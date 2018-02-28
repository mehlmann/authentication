/**
 * Der Verlauf einer Authentifizierung kann als State-Machine gesehen werden. 
 * Dies soll die Variable alexa_state implementieren.
 * 
 * Docs: https://github.com/jakesgordon/javascript-state-machine
 * 
 * Die aktuelle State-Machine sieht folgendermaßen aus:
 * 
 *                                   Antwort korrekt            Antwort korrekt                
 *                                     counter > 0                counter > 0                  
 *                                         ----                       ----                         
 *                                        |    v   Antwort korrekt   |    v   Antwort korrekt               
 *  -----        ------  Antwort korrekt  ------     counter = 0     -------    counter = 0      ----------      nein       -----
 * |start|----->| calc |---------------->|static|------------------>|dynamic|------------------>|dynRefresh|<=============>|check|
 *  -----        ------                   ------                     -------         | useRfsh?  ----------                 -----
 *                 |                        |                           |            |                       Antwort richtig| ^|^
 *                 |                        |                           v            |                        verstanden?   | |||
 *                 |                        |      Antwort falsch    ------          |             -------                  | |||
 *                 |----------------------------------------------->|failed|         |----------->|success|<----------------| |||
 *                                                                   ------                        -------                    |||
 *                                                                                                    |                       |||
 *                                                                                                    v                       |||
 *                                                                                                 --------                   |||-> ---------
 *                                                                                                |addQuest|<-----------------||   |addAnswer|
 *                                                                                                 --------                    |--> ---------
 * 
 */

'use strict'

var StateMachine = require('./includes/javascript-state-machine');
const alexa = require('./alexa');
const statics = require('./data/statics');
const fct = require('./help-functions');
var questions = require('./data/questions');

/* globale Variablen */
// die Thresholds speichern wieviele Fragen der jeweiligen Kategorien beantwortet werden müssen
var statThreshold = statics.STATIC_THRESHOLD;
var dynThreshold = statics.DYNAMIC_THRESHOLD;
// hält die aktuelle Frage 
var currentQuest ={number: '',
                    question: '',
                    answer: ''};
// 1 = Refresh, 0 = kein Refresh nach Authentifizierung
var useRfrsh = 0;
// erweiterte Ausgaben in der Konsole
var debug = 0;
var tmp;

var auth_state = new StateMachine({
    init : 'start',
    transitions: [
        { name: 'startToCalc',         from: 'start',      to: 'calc'       },
        { name: 'calcToStatic',        from: 'calc',       to: 'static'     },
        { name: 'staticToStatic',      from: 'static',     to: 'static'     },
        { name: 'staticToDynamic',     from: 'static',     to: 'dynamic'    },
        { name: 'dynamicToDynamic',    from: 'dynamic',    to: 'dynamic'    },
        { name: 'dynamicToDynRefresh', from: 'dynamic',    to: 'dynRefresh' },
        { name: 'dynamicToSuccess',    from: 'dynamic',    to: 'success'    },
        { name: 'dynRefreshToCheck',   from: 'dynRefresh', to: 'check'      },
        { name: 'checkToDynRefresh',   from: 'check',      to: 'dynRefresh' },
        { name: 'checkToSuccess',      from: 'check',      to: 'success'    },
        { name: 'answerWrong',         from: 'calc',       to: 'failed'     },
        { name: 'answerWrong',         from: 'static',     to: 'failed'     },
        { name: 'answerWrong',         from: 'dynamic',    to: 'failed'     },
        { name: 'reset',               from: 'failed',     to: 'start'      },
        { name: 'reset',               from: 'success',    to: 'start'      },
        { name: 'addQuestion',         from: 'success',    to: 'addQuest'   },
        { name: 'checkQuestion',       from: 'addQuest',   to: 'check'      },
        { name: 'addAnswer',           from: 'check',      to: 'addAnswer'  },
        { name: 'checkAnswer',         from: 'addAnswer',  to: 'check'      },
        { name: 'endAddQuest',         from: 'check',      to: 'success'    }
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
        onDynamicToSuccess: function(obj, claim, real) {
            fct.printLog(`Answer was correct. You said ${claim}, it was ${real}.\nMoving from dynamic to success.`);
        },
        onDynRefreshToCheck: function(obj, question, answer) {
            fct.printLog(`Question: ${question}, users answer was ${answer}.\nMoving from dynRefresh to check.`);
        },
        onCheckToDynRefresh: function(obj, question, answer) {
            fct.printLog(`Question: ${question}, should not have answer ${answer}.\nMoving from check to dynRefresh.`);
        },
        onCeckDynRefreshToSuccess: function(obj, question, answer) {
            fct.printLog(`Question: ${question}, has now the answer ${answer}.\nMoving from check to success.`);
        },
        onAnswerWrong:  function(obj, claim, real) {
            fct.printLog(`Answer was wrong! You said ${claim}, it was ${real}.`);
        },
        onReset:  function(obj) {
            fct.printLog('Going back to start.');
        },
        onAddQuestion: function(obj) {
            fct.printLog(`User wants to add a question.\nMoving from success to addQuest.`);
        },
        onCheckQuestion: function(obj, question) {
            fct.printLog(`Question: ${question} added.\nMoving from addQuest to check.`);
        },
        onAddAnswer: function(obj) {
            fct.printLog(`Question: ${question} confirmed.\nMoving from check to addAnswer.`);
        },
        onCheckAnswer: function(obj, question, answer) {
            fct.printLog(`Question: ${question}, will have the answer ${answer}.\nMoving from addAnswer to check.`);
        },
        onEndAddQuest: function(obj, question, answer) {
            fct.printLog(`Question: ${question}, has now the answer ${answer}.\nMoving from check to success.`);
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
            if (useRfrsh) {
                auth_state.dynamicToDynRefresh(userAnswer, correctAnswer);
                startDynamicRefresh(callback);
            } else {
                auth_state.dynamicToSuccess(currentQuest.question, currentQuest.answer);
                onAuthenticated(callback);
            }
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
        checkAnswer(answer, callback);
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
function checkAnswer(answer, callback) {
    currentQuest.answer = answer;
    const cardTitle = 'Check Answer';
    if (debug) fct.printLog(`Answer is ${currentQuest.answer}.`);
    currentQuest.question = `Sie gaben die Antwort ${currentQuest.answer}. Ist dies richtig?`;
    const shouldEndSession = false;

    auth_state.dynRefreshToCheck(currentQuest.question, currentQuest.answer);
    callback({}, alexa.buildSpeechletResponse(cardTitle, currentQuest.question, currentQuest.question, shouldEndSession));
}

/**
 * Fragt den Benutzer seine Antwort zu verifizieren.
 * @param {string} question Benutzereingabe
 * @param {function} callback Rückgabefunktion
 */
function checkQuestion(question, callback) {
    const cardTitle = 'Check Question';
    if (debug) fct.printLog(`Question was: ${question}.`);
    currentQuest.question = `Die Frage lautet ${question}. Ist dies richtig?`;
    tmp = question;
    const shouldEndSession = false;

    auth_state.checkQuestion(currentQuest.question);
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
    auth_state.checkToDynRefresh(currentQuest.question, currentQuest.answer);

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
    auth_state.checkToSuccess(currentQuest.question, currentQuest.answer);

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
    while (!questions.isDynamicUsed(currentQuest.number)) {
        currentQuest.number = Math.floor(Math.random() * questions.getDynamicSize());
    }
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
 * Überprüft eine allgemeine Antwort.
 * @param {*} intent 
 * @param {function} callback Rückgabefunktion 
 */
function verifyCommonAnswer(intent, callback) {
    var answer = '';
    if (!intent.slots.antwortEins) fct.printError('verifyCommonAnswer failed! No answer was given!');
    if (intent.slots.antwortEins && intent.slots.antwortEins.value) answer += `${intent.slots.antwortEins.value}`;
    if (intent.slots.antwortZwei && intent.slots.antwortZwei.value) answer += ` ${intent.slots.antwortZwei.value}`;
    if (intent.slots.antwortDrei && intent.slots.antwortDrei.value) answer += ` ${intent.slots.antwortDrei.value}`;
    if (intent.slots.antwortVier && intent.slots.antwortVier.value) answer += ` ${intent.slots.antwortVier.value}`;
    if (intent.slots.antwortFuenf && intent.slots.antwortFuenf.value) answer += ` ${intent.slots.antwortFuenf.value}`;
    if (debug) fct.printLog(`Answer: ${answer}`);
    
    verifyAnswer(answer, callback);
}

/**
 * Überprüft eine Bierantwort.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifyBeer(intent, callback) {
    if (debug) fct.printLog('Verstandenes Bier: ' + intent.slots.bier.value);
    var answer = intent.slots.bier.value;
    if (!answer) fct.printError('verifyBeer failed! No beer was given!');
    verifyAnswer(answer, callback);
}

/**
 * Überprüft eine Fahrzeugantwort.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifyVehicle(intent, callback) {
    if (debug) fct.printLog('Verstandenes Fahrzeug: ' + intent.slots.auto.value);
    var answer = intent.slots.auto.value;
    if (!answer) fct.printError('verifyVehicle failed! No vehicle was given!');
    verifyAnswer(answer, callback);
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
    if (debug) fct.printLog('Verstandenes Land: ' + intent.slots.landName.value);
    var answer = intent.slots.landName.value;
    if (!answer) fct.printError('verifyLand failed! No land was given!');
    verifyAnswer(answer, callback);
}

/**
 * Überprüft ob ein Fußball-Verein richtig ist.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifySoccer(intent, callback) {
    if (debug) fct.printLog('Verein: ' + intent.slots.verein.value);
    var answer = intent.slots.verein.value;
    if (!answer) fct.printError('verifySoccer failed! No Soccer-Team was given!');
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
 * Überprüft ob ein Instrument richtig ist.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifyInstrument(intent, callback) {
    if (debug) fct.printLog('Instrument: ' + intent.slots.instrument.value);
    var answer = intent.slots.instrument.value;
    if (!answer) fct.printError('verifyInstrument failed! No instrument was given!');
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
    if (debug) fct.printLog(`City: ${intent.slots.stadt.value}`);
    var answer = intent.slots.stadt.value;
    if (!answer) fct.printError('VerifyCity failed! No city was given!');
    verifyAnswer(answer, callback);
}

/**
 * Überprüft ob eine Sport-Antwort korrekt ist.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifySport(intent, callback) {
    if (debug) fct.printLog(`Sport: ${intent.slots.sport.value}`);
    var answer = intent.slots.sport.value;
    if (!answer) fct.printError('VerifySport failed! No sport was given!');
    verifyAnswer(answer, callback);
}

/**
 * Überprüft ob eine Sport-Antwort korrekt ist.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifyAnimal(intent, callback) {
    if (debug) fct.printLog(`Tier: ${intent.slots.tier.value}`);
    var answer = intent.slots.tier.value;
    if (!answer) fct.printError('VerifyAnimal failed! No animal was given!');
    verifyAnswer(answer, callback);
}

/**
 * Überprüft ob eine Sport-Antwort korrekt ist.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifySchoolSubject(intent, callback) {
    if (debug) fct.printLog(`Subject: ${intent.slots.unterricht.value}`);
    var answer = intent.slots.unterricht.value;
    if (!answer) fct.printError('VerifySchoolSubject failed! No subject was given!');
    verifyAnswer(answer, callback);
}

/**
 * Überprüft ob eine Sport-Antwort korrekt ist.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifyFirstname(intent, callback) {
    if (debug) fct.printLog(`Name: ${intent.slots.name.value}`);
    var answer = intent.slots.name.value;
    if (!answer) fct.printError('VerifyFirstname failed! No name was given!');
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

/**
 * Der Benutzer möchte eine Frage hinzufügen.
 * @param {function} callback Rückgabe
 */
function addQuestion(callback) {
    if (debug) fct.printLog(`addQuestion...`);
    currentQuest.question = "Nennen Sie mir die Frage, welche Sie hinzufügen möchten.";

    const cardTitle = 'Frage hinzufügen';
    var speechOutput = currentQuest.question;
    const shouldEndSession = false;

    auth_state.addQuestion();

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, speechOutput, shouldEndSession));
}

/**
 * Bereitet die Frage, welche vom Benutzer gegebn wurde vor.
 * fragewort} {verb} {wortEins} {wortZwei} {wortDrei} {wortVier} {wortFuenf} {wortSechs
 * @param {*} intent Intent
 * @param {function} callback Callback
 */
function verifyQuestion(intent, callback) {
    var quest = '';
    if (intent.slots.fragewort.value) quest += `${intent.slots.fragewort.value}`;
    if (intent.slots.verb.value)      quest += ` ${intent.slots.verb.value}`;
    if (intent.slots.wortEins.value)  quest += ` ${intent.slots.wortEins.value}`;
    if (intent.slots.wortZwei.value)  quest += ` ${intent.slots.wortZwei.value}`;
    if (intent.slots.wortDrei.value)  quest += ` ${intent.slots.wortDrei.value}`;
    if (intent.slots.wortVier.value)  quest += ` ${intent.slots.wortVier.value}`;
    if (intent.slots.wortFuenf.value) quest += ` ${intent.slots.wortFuenf.value}`;
    if (intent.slots.wortSechs.value) quest += ` ${intent.slots.wortSechs.value}`;
    quest += '?';
    if (debug) fct.printLog(`${quest}`);
    checkQuestion(quest, callback);
}


module.exports = {auth_state,
                getState,
                isInState,
                wrongIntent,
                resetState,
                endDynRefresh,
                repromptDynRefresh,
                getCalculation,
                verifyCalc,
                verifyCommonAnswer,
                verifyBeer,
                verifyVehicle,
                verifyColor,
                verifyLand,
                verifySoccer,
                verifyMoney,
                verifyInstrument,
                verifyNumber,
                verifyCity,
                verifySport,
                verifyAnimal,
                verifySchoolSubject,
                verifyCellphone,
                verifyFirstname,
                onAuthenticated,
                onFailed,
                addQuestion};
