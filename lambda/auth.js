/**
 * Der Verlauf einer Authentifizierung kann als State-Machine gesehen werden. 
 * Dies soll die Variable alexa_state implementieren.
 * 
 * Docs: https://github.com/jakesgordon/javascript-state-machine
 * 
 * Die aktuelle State-Machine sieht folgendermaßen aus:
 * 
 *                                      Antwort korrekt            Antwort korrekt                
 *                                        counter > 0                counter > 0                  
 *                                            ----                       ----                         
 *                                           |    v   Antwort korrekt   |    v   Antwort korrekt               
 *  -----           ------  Antwort korrekt  ------     counter = 0     -------    counter = 0      ----------      nein       -----
 * |start|-------->| calc |---------------->|static|------------------>|dynamic|------------------>|dynRefresh|<=============>|check|
 *  -----           ------                   ------                     -------                     ----------                 -----
 *                    |                        |                           |                                  Antwort richtig    |
 *                    |                        |                           v                                   verstanden?       | ja
 *                    |                        |      Antwort falsch    ------                        -------                    |
 *                    |----------------------------------------------->|failed|                      |success|<------------------
 *                                                                      ------                        -------
 */

'use strict'

var StateMachine = require('./includes/javascript-state-machine');
const alexa = require('./alexa');
const statics = require('./data/statics');
const fct = require('./help-functions');
var questions = require('./data/questions');

// globale Variablen
var statThreshold = statics.STATIC_THRESHOLD;
var dynThreshold = statics.DYNAMIC_THRESHOLD;
var currentQuest ={number: '',
                    question: '',
                    answer: ''};

var debug = 0;

var auth_state = new StateMachine({
    init : 'start',
    transitions: [
        { name: 'startToCalc',                 from: 'start',           to: 'calc'            },
        { name: 'calcToStatic',                from: 'calc',            to: 'static'          },
        { name: 'staticToStatic',              from: 'static',          to: 'static'          },
        { name: 'staticToDynamic',             from: 'static',          to: 'dynamic'         },
        { name: 'dynamicToDynamic',            from: 'dynamic',         to: 'dynamic'         },
        { name: 'dynamicToDynRefresh',         from: 'dynamic',         to: 'dynRefresh'      },
        { name: 'dynRefreshToCheckDynRefresh', from: 'dynRefresh',      to: 'checkDynRefresh' },
        { name: 'checkDynRefreshToDynRefresh', from: 'checkDynRefresh', to: 'dynRefresh'      },
        { name: 'checkDynRefreshToSuccess',    from: 'checkDynRefresh', to: 'success'         },
        { name: 'answerWrong',                 from: 'calc',            to: 'failed'          },
        { name: 'answerWrong',                 from: 'static',          to: 'failed'          },
        { name: 'answerWrong',                 from: 'dynamic',         to: 'failed'          },
        { name: 'reset',                       from: 'failed',          to: 'start'           },
        { name: 'reset',                       from: 'success',         to: 'start'           }
    ],
    methods: {
        onStartToCalc: function(obj, question) {
            fct.printLog('Question is: ' + question + '\nMoving from start to calc.');
        },
        onCalcToStatic: function(obj, claim, real) {
            fct.printLog(`Answer was correct. You said ${claim}, it was ${real}.\nMoving from calc to static.`);
        },
        onStaticToStatic: function(obj, claim, real) {
            fct.printLog(`Answer was correct. You said ${claim}, it was ${real}.\nMoving from static to static.`);
        },
        onStaticToDynamic: function(obj, claim, real) {
            fct.printLog(`Answer was correct. You said ${claim}, it was ${real}.\nMoving from static to dynamic.`);
        },
        onDynamicToDynamic: function(obj, claim, real) {
            fct.printLog(`Answer was correct. You said ${claim}, it was ${real}.\nMoving from dynamic to dynamic.`);
        },
        onDynamicToDynRefresh: function(obj, claim, real) {
            fct.printLog(`Answer was correct. You said ${claim}, it was ${real}.\nMoving from dynamic to dynRefresh.`);
        },
        onDynRefreshToCheckDynRefresh: function(obj, question, answer) {
            fct.printLog(`Question: ${question}, users answer was ${answer}.\nMoving from dynRefresh to checkDynRefresh.`);
        },
        onCheckDynRefreshToDynRefresh: function(obj, question, answer) {
            fct.printLog(`Question: ${question}, should not have answer ${answer}.\nMoving from checkDynRefresh to dynRefresh.`);
        },
        onCeckDynRefreshToSuccess: function(obj, question, answer) {
            fct.printLog(`Question: ${question}, has now the answer ${answer}.\nMoving from checkDynRefresh to success.`);
        },
        onAnswerWrong:  function(obj, claim, real) {
            fct.printLog(`Answer was wrong! You said ${claim}, it was ${real}.`);
        },
        onReset:  function(obj) {
            fct.printLog('Going back to start.');
        }
    }
});

/**
 * Gibt den aktuellen Zustand der State-Machine aus.
 */
function getState() {
    if (debug) fct.printLog(`Current state: ${auth_state.state}.`);
    return auth_state.state;
}

/**
 * Vergleicht ob die Maschine sich im übergebenen Zustand befindet.
 * @param {string} state aktueller Status  
 */
function isInState(state) {
    if (debug) fct.printLog(`IsInState returns: ${auth_state.is(state)}.`);
    return auth_state.is(state);
}

/**
 * Sollte ein Intent eingehen, welcher nicht dem aktuellen Zustand der State-Machine entspricht,
 * wird er hier behandelt.
 * @param {function} callback Rückgabefunktion
 */
function wrongIntent(callback) {
    if (debug) fct.printLog(`Got in wrongIntent. Current state is: ${auth_state.state}.`);
    const cardTitle = 'Falscher Intent';
    var speechOutput = '';
    if (auth_state.is('success')) {
        speechOutput = 'Sie haben sich bereits erfolgreich authentifiziert.';
    } else if (auth_state.is('failed')) {
        speechOutput = 'Ihre Authentifizierung ist leider bereits fehlgeschlagen.';
    } else {
        speechOutput = 'Beantworten Sie bitte die Frage: ' + currentQuest.question;
    }
    const shouldEndSession = false;

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, speechOutput, shouldEndSession));
}

/**
 * Der Benutzer ist bereits authentifiziert.
 * @param {function} callback Rückgabefunktion
 */
function onAuthenticated(callback) {
    if (debug) fct.printLog(`Got in onAuthenticated.`);
    const cardTitle = 'Authentication done.';
    var speechOutput = 'Die Authentifizierung war erfolgreich.';
    const repromptText = `Auf Wiedersehen.`;
    const shouldEndSession = false;

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Der Benutzer hat versagt.
 * @param {function} callback Rückgabefunktion
 */
function onFailed(callback) {
    if (debug) fct.printLog(`Got in onFailed.`);
    const cardTitle = 'Authentication failed.';
    var speechOutput = 'Die Authentifizierung ist leider fehlgeschlagen.';
    const repromptText = `Auf Wiedersehen.`;
    const shouldEndSession = false;

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Setzt die Authentifizierung zurück.
 * @param {function} callback Rückgabefunktion
 */
function resetState(callback) {
    if (debug) fct.printLog(`Got in resetState.`);
    const cardTitle = 'Authentication reset.';
    var speechOutput = 'Die Authentifizierung ist im Zustand start.';
    const repromptText = `Fragen Sie nach einer Aufgabe.`;
    const shouldEndSession = false;
    auth_state.reset();

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Ermittelt abhängig vom Zustand (static, dynamic) und den aktuellen Thresholds den nächsten Zustand der Zustandsmaschine.
 * @param {string} userAnswer die Antwort des Benutzers
 * @param {string} correctAnswer die korrekte Antwort
 * @param {function} callback Rückgabefunktion
 */
function getNextState(userAnswer, correctAnswer, callback) {
    if (debug) fct.printLog(`Getting next state. \nCurrent state is: ${auth_state.state}. \nstatThr: ${statThreshold} \ndynThr: ${dynThreshold}`);
    if (isInState('static')) {
        statThreshold--;
        if (statThreshold > 0) {
            auth_state.staticToStatic(userAnswer, correctAnswer);
            getStaticQuestion(callback);
        } else {
            auth_state.staticToDynamic(userAnswer, correctAnswer);
            getDynamicQuestion(callback);
        }
    } else {
        dynThreshold--;
        if (dynThreshold > 0) {
            auth_state.dynamicToDynamic(userAnswer, correctAnswer);
            getDynamicQuestion(callback);
        } else {
            auth_state.dynamicToDynRefresh(userAnswer, correctAnswer);
            startDynamicRefresh(callback);
        }
    }
}

/**
 * Überprüft, ob der übergebene Text mit der aktuellen Antwort übereinstimmt.
 * @param {string} answer Antwort des Benutzers
 * @param {function} callback Rückgabefunktion
 */
function verifyAnswer(answer, callback) {
    if (isInState('dynRefresh')) {
        checkRefresh(answer, callback);
    } else {
        if (answer == currentQuest.answer) {
            getNextState(answer, currentQuest.answer, callback);
        } else {
            auth_state.answerWrong(answer, currentQuest.answer);
            onFailed(callback);
        }

    }
}

/**
 * Fragt den Benutzer die Antwort einer der dynamischen Fragen zu aktualisieren.
 * @param {function} callback Rückgabefunktion
 */
function startDynamicRefresh(callback) {
    if (debug) fct.printLog(`startDynamicRefresh...`);
    currentQuest.number = Math.floor(Math.random() * questions.getDynamicSize());
    currentQuest.question = questions.getDynamicQuestion(currentQuest.number);
    currentQuest.answer = questions.getDynamicAnswer(currentQuest.number);
    if (debug) fct.printLog(`[${currentQuest.number}]: ${currentQuest.question} -${currentQuest.answer}.`);

    const cardTitle = 'Dynamische Antwort aktualisieren';
    var speechOutput = `Die Authentifizierung war erfolgreich. Ich muss die Antwort einer dynamischen Frage aktualisieren. 
                        Die Frage lautet ${currentQuest.question} und ihre alte Antwort war ${currentQuest.answer}.
                        Bitte geben Sie mir die aktuelle Antwort auf diese Frage.`;
    const repromptText = `Aktualisieren Sie bitte die Antwort auf die Frage ${currentQuest.question}.`;
    const shouldEndSession = false;

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Fragt den Benutzer seine Antwort zu verifizieren.
 * @param {string} answer Benutzereingabe
 * @param {function} callback Rückgabefunktion
 */
function checkRefresh(answer, callback) {
    currentQuest.answer = answer;
    const cardTitle = 'Refresh erhalten';
    if (debug) fct.printLog(`Question was: ${questions.getDynamicQuestion(currentQuest.number)}. Answer is ${currentQuest.answer}.`);
    currentQuest.question = `Auf die Frage ${questions.getDynamicQuestion(currentQuest.number)} gaben Sie die Antwort ${currentQuest.answer}. Ist dies richtig?`;
    const shouldEndSession = false;

    auth_state.dynRefreshToCheckDynRefresh(currentQuest.question, currentQuest.answer);
    callback({}, alexa.buildSpeechletResponse(cardTitle, currentQuest.question, currentQuest.question, shouldEndSession));
}

/**
 * Alexa hat den Benuzer falsch verstanden. Die Antwort muss wiederholt werden.
 * @param {function} callback Rückgabefunktion
 */
function repromptDynRefresh(callback) {
    if (debug) fct.printLog('repromptDynRefresh');
    const cardTitle = 'Dynamische Antwort wiederholen';
    var speechOutput = `Bitte wiederholen Sie die Antwort auf die Frage ${questions.getDynamicQuestion(currentQuest.number)}`;
    const repromptText = `Aktualisieren Sie bitte die Antwort auf die Frage ${questions.getDynamicQuestion(currentQuest.number)}.`;
    const shouldEndSession = false;
    auth_state.checkDynRefreshToDynRefresh(currentQuest.question, currentQuest.answer);

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Alexa hat den Benutzer richtig verstanden. Die dynamische Antwort darf aktualisiert werden.
 * @param {function} callback Rückgabefunktion
 */
function endDynRefresh(callback) {
    if (debug) fct.printLog('repromptDynRefresh');
    const cardTitle = 'Dynamische Antwort akzeptiert';
    var speechOutput = `Die dynamische Antwort auf die Frage wurde akzeptiert. Die Authentifizierung ist abgeschlossen.`;
    const repromptText = `Die Authentifizierung ist beendet.`;
    const shouldEndSession = false;

    questions.setDynamicAnswer(currentQuest.number, currentQuest.answer);
    auth_state.checkDynRefreshToSuccess(currentQuest.question, currentQuest.answer);

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Stellt dem Benutzer eine simple Additions-Aufgabe.
 * @param {function} callback Rückgabefunktion 
 */
function getCalculation(callback) {
    if (debug) fct.printLog(`getCalculation...`);
    var summandA = Math.floor(Math.random() * 20);
    var summandB = Math.floor(Math.random() * 20);
    if (debug) fct.printLog(`Question: ${summandA} + ${summandB} = ${summandA+summandB}`);

    const cardTitle = 'Aufgabe gestellt';
    currentQuest.question = `Was ist ${summandA} plus ${summandB}?`;
    const repromptText = `Lösen Sie bitte die Aufgabe ${summandA} plus ${summandB}.`;
    const shouldEndSession = false;

    currentQuest.answer = summandA + summandB;
    auth_state.startToCalc(currentQuest.question);

    callback({}, alexa.buildSpeechletResponse(cardTitle, currentQuest.question, repromptText, shouldEndSession));
}

/**
 * Stellt dem Benutzer eine Frage.
 * @param {function} callback Rückgabefunktion
 */
function getStaticQuestion(callback) {
    if (debug) fct.printLog(`getStaticQuestion...`);
    const cardTitle = 'Frage gestellt';
    currentQuest.number = Math.floor(Math.random() * questions.getStaticSize());
    while (!questions.isStaticUsed(currentQuest.number)) {
        currentQuest.number = Math.floor(Math.random() * questions.getStaticSize());
    }
    currentQuest.question = questions.getStaticQuestion(currentQuest.number);
    currentQuest.answer = questions.getStaticAnswer(currentQuest.number);
    if (debug) fct.printLog(`[${currentQuest.number}]: ${currentQuest.question} -${currentQuest.answer}.`);
    const shouldEndSession = false;
    fct.printLog(`Authentication is in state ${auth_state.state}. CurrentQuestNr=${currentQuest.number}.`);

    callback({}, alexa.buildSpeechletResponse(cardTitle, currentQuest.question, currentQuest.question, shouldEndSession));
}

/**
 * Stellt dem Benutzer eine Frage.
 * @param {function} callback Rückgabefunktion
 */
function getDynamicQuestion(callback) {
    if (debug) fct.printLog(`getDynamicQuestion...`);
    const cardTitle = 'Frage gestellt';
    currentQuest.number = Math.floor(Math.random() * questions.getDynamicSize());
    currentQuest.question = questions.getDynamicQuestion(currentQuest.number);
    currentQuest.answer = questions.getDynamicAnswer(currentQuest.number);
    if (debug) fct.printLog(`[${currentQuest.number}]: ${currentQuest.question} -${currentQuest.answer}.`);
    const shouldEndSession = false;
    fct.printLog(`Authentication is in state ${auth_state.state}. CurrentQuestNr=${currentQuest.number}.`);

    callback({}, alexa.buildSpeechletResponse(cardTitle, currentQuest.question, currentQuest.question, shouldEndSession));
}

/**
 * Verifiziert die Rechenantwort. 
 * Trat beim Argument ein Fehler auf wird eine Antwort ausgegeben.
 * War die Antwort richtig, wird mit einer statischen Frage weiterverfahren.
 * War die Antwort falsch, wird die Authentifizierung abgebrochen.
 * @param {*} intent 
 * @param {function} callback Rückgabefunktion
 */
function verifyCalc(intent, callback) {
    if (debug) fct.printLog(`verifyCalc...\nIntent: ` + intent);
    var result = intent.slots.erste.value;
    if (!result) fct.printError('verifyCalc failed! No number was given!');
    if (result == currentQuest.answer) {
        auth_state.calcToStatic(result, currentQuest.answer);
        getStaticQuestion(callback);
    } else {
        auth_state.answerWrong(result, currentQuest.answer);
        onFailed(callback);
    }
}

/**
 * Überprüft eine Farbenantwort.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifyColor(intent, callback) {
    if (debug) fct.printLog('Verstandene Farbe: ' + intent.slots.farbe.value);
    var answer = intent.slots.farbe.value;
    if (!answer) fct.printError('verifyColor failed! No color was given!');
    verifyAnswer(answer, callback);
}

/**
 * Überprüft ob ein Land richtig ist.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifyLand(intent, callback) {
    var answer = intent.slots.landName.value;
    if (debug) fct.printLog(`Land: ${answer}`);
    verifyAnswer(answer, callback);
}

/**
 * Eine Auswertung eines Geldbetrages.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifyMoney(intent, callback) {
    if (debug) fct.printLog(`Geldmenge: ${intent.slots.euro.value},${intent.slots.cent.value} €.`);
    var amountEuro = intent.slots.euro.value;
    var amountCent = intent.slots.cent.value;
    if (!amountEuro && !amountCent) fct.printError('verifyMoneyAnswer failed.');

    var answer = fct.formatMoneyAmount(amountEuro, amountCent);

    verifyAnswer(answer, callback);
}

/**
 * Überprüft die übergebene Zahl.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifyNumber(intent, callback) {
    var answer = '';
    if (!intent.slots.erste) fct.printError('verifyNumber failed! No number was given!');
    if (intent.slots.erste && intent.slots.erste.value) answer += `${intent.slots.erste.value}`;
    if (intent.slots.zweite && intent.slots.zweite.value) answer += `${intent.slots.zweite.value}`;
    if (intent.slots.dritte && intent.slots.dritte.value) answer += `${intent.slots.dritte.value}`;
    if (intent.slots.vierte && intent.slots.vierte.value) answer += `${intent.slots.vierte.value}`;
    if (intent.slots.fuenfte && intent.slots.fuenfte.value) answer += `${intent.slots.fuenfte.value}`;
    if (debug) fct.printLog(`Number: ${answer}`);
    
    verifyAnswer(answer, callback);
}

/**
 * Überprüft ob eine Städte-Antwort korrekt ist.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifyCity(intent, callback) {
    var answer = intent.slots.stadt.value;
    if (debug) fct.printLog(`City: ${answer}`);
    if (!answer) fct.printError('VerifyCity failed! No city was given!');
    verifyAnswer(answer, callback);
}

/**
 * Überprüft ob eine Handy-Marken-Antwort korrekt ist.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifyCellphone(intent, callback) {
    var answer = intent.slots.marke.value;
    if (debug) fct.printLog(`City: ${answer}`);
    if (!answer) fct.printError('verifyCellphone failed! No brand was given!');
    verifyAnswer(answer, callback);
}


module.exports = {auth_state,
                getState,
                isInState,
                wrongIntent,
                resetState,
                checkRefresh,
                endDynRefresh,
                repromptDynRefresh,
                getCalculation,
                verifyCalc,
                verifyColor,
                verifyLand,
                verifyMoney,
                verifyNumber,
                verifyCity,
                verifyCellphone,
                onAuthenticated,
                onFailed};
