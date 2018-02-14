/**
 * Der Verlauf einer Authentifizierung kann als State-Machine gesehen werden. 
 * Dies soll die Variable alexa_state implementieren.
 * 
 * Docs: https://github.com/jakesgordon/javascript-state-machine
 * 
 * Ein Beispiel einer Fragen-State-Machine könnte sein:
 * 
 *                                      Antwort korrekt            Antwort korrekt
 *                                        counter > 0                counter > 0 
 *                                            ----                       ----
 *                                           |    v   Antwort korrekt   |    v   Antwort korrekt 
 *  -----           ------  Antwort korrekt  ------     counter = 0     -------    counter = 0      -------
 * |start|-------->| calc |---------------->|static|------------------>|dynamic|------------------>|success|
 *  -----           ------                   ------                     -------                     -------
 *                    |                        |                           |
 *                    |                        |                           v
 *                    |                        |      Antwort falsch    ------
 *                    |----------------------------------------------->|failed|
 *                                                                      ------
 */

var StateMachine = require('./includes/javascript-state-machine');
const helpFct = require('./help-functions');
const alexa = require('./alexa');
const staticQuestions = require('./data/questions').staticQuestions;
const dynamicQuestions = require('./data/questions').dynamicQuestions;

// globale Variablen
var sum;
var currentQuestNr;
var statThreshold = 1;
var dynThreshold = 1;
var currentQuest ='';

var auth_state = new StateMachine({
    init : 'start',
    transitions: [
        { name: 'startToCalc',      from: 'start',   to: 'calc'    },
        { name: 'calcToStatic',     from: 'calc',    to: 'static'  },
        { name: 'staticToStatic',   from: 'static',  to: 'static'  },
        { name: 'staticToDynamic',  from: 'static',  to: 'dynamic' },
        { name: 'dynamicToDynamic', from: 'dynamic', to: 'dynamic' },
        { name: 'dynamicToSuccess', from: 'dynamic', to: 'success' },
        { name: 'answerWrong',      from: 'calc',    to: 'failed'  },
        { name: 'answerWrong',      from: 'static',  to: 'failed'  },
        { name: 'answerWrong',      from: 'dynamic', to: 'failed'  },
        { name: 'reset',            from: 'failed',  to: 'start'   },
        { name: 'reset',            from: 'success', to: 'start'   }
    ],
    methods: {
        onStartToCalc: function(obj, question) {
            console.log('Question is: ' + question + '\nMoving from start to calc.');
        },
        onCalcToStatic: function(obj, claim, real) {
            console.log(`Answer was correct. You said ${claim}, it was ${real}.\nMoving from calc to static.`);
        },
        onStaticToStatic: function(obj, claim, real) {
            console.log(`Answer was correct. You said ${claim}, it was ${real}.\nMoving from static to static.`);
        },
        onStaticToDynamic: function(obj, claim, real) {
            console.log(`Answer was correct. You said ${claim}, it was ${real}.\nMoving from static to dynamic.`);
        },
        onDynamicToDynamic: function(obj, claim, real) {
            console.log(`Answer was correct. You said ${claim}, it was ${real}.\nMoving from dynamic to dynamic.`);
        },
        onDynamicToSuccess: function(obj, claim, real) {
            console.log(`Answer was correct. You said ${claim}, it was ${real}.\nMoving from dynamic to success.`);
        },
        onAnswerWrong:  function(obj, claim, real) {
            console.log(`Answer was wrong! You said ${claim}, it was ${real}.`);
        },
        onReset:  function(obj) {
            console.log('Going back to start.');
        }
    }
});

/**
 * Gibt den aktuellen Zustand der State-Machine aus.
 */
function getState() {
    return auth_state.state;
}

/**
 * Vergleicht ob die Maschine sich im übergebenen Zustand befindet.
 * @param {*} state 
 */
function isInState(state) {
    return auth_state.is(state);
}

/**
 * Sollte ein Intent eingehen, welcher nicht dem aktuellen Zustand der State-Machine entspricht,
 * wird er hier behandelt.
 * @param {*} intent
 * @param {*} callback
 */
function wrongIntent(callback) {
    const cardTitle = 'Falscher Intent';
    var speechOutput = '';
    if (auth_state.is('success')) {
        speechOutput = 'Sie haben sich bereits erfolgreich authentifiziert.';
    } else if (auth_state.is('failed')) {
        speechOutput = 'Ihre Authentifizierung ist leider bereits fehlgeschlagen.';
    } else {
        speechOutput = 'Beantworten Sie bitte die Frage: ' + currentQuest;
    }
    const shouldEndSession = false;

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, speechOutput, shouldEndSession));
}

/**
 * Der Benutzer ist bereits authentifiziert.
 * @param {*} callback
 */
function onAuthenticated(callback) {
    const cardTitle = 'Authentication done.';
    var speechOutput = 'Die Authentifizierung war erfolgreich.';
    const repromptText = `Auf Wiedersehen.`;
    const shouldEndSession = false;

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Der Benutzer hat versagt.
 * @param {*} callback
 */
function onFailed(callback) {
    const cardTitle = 'Authentication failed.';
    var speechOutput = 'Die Authentifizierung ist leider fehlgeschlagen.';
    const repromptText = `Auf Wiedersehen.`;
    const shouldEndSession = false;

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Setzt die Authentifizierung zurück.
 * @param {*} callback 
 */
function resetState(callback) {
    const cardTitle = 'Authentication reset.';
    var speechOutput = 'Die Authentifizierung ist im Zustand start.';
    const repromptText = `Fragen Sie nach einer Aufgabe.`;
    const shouldEndSession = false;
    auth_state.reset();

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Ermittelt abhängig von isStatic und den aktuellen Thresholds den nächsten Zustand der Zustandsmaschine.
 * @param {*} isStatic 
 * @param {*} callback 
 * @param {*} userAnswer
 * @param {*} correctAnswer
 */
function getNextState(isStatic, callback, userAnswer, correctAnswer) {
    if (isStatic) {
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
            auth_state.dynamicToSuccess(userAnswer, correctAnswer);
            onAuthenticated(callback);
        }
    }
}

/**
 * Stellt dem Benutzer eine simple Additions-Aufgabe.
 * @param {*} callback 
 */
function getCalculation(callback) {
    var summandA = Math.floor(Math.random() * 20);
    var summandB = Math.floor(Math.random() * 20);
    sum = summandA + summandB;

    const cardTitle = 'Aufgabe gestellt';
    var speechOutput = `Was ist ${summandA} plus ${summandB}?`;
    const repromptText = `Lösen Sie bitte die Aufgabe ${summandA} plus ${summandB}.`;
    const shouldEndSession = false;

    currentQuest = speechOutput;
    auth_state.startToCalc(speechOutput);

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Stellt dem Benutzer eine Frage.
 * @param {*} callback
 */
function getStaticQuestion(callback) {
    const cardTitle = 'Frage gestellt';
    currentQuestNr = Math.floor(Math.random() * staticQuestions.length);
    console.log(`Authentication is in state ${auth_state.state}. CurrentQuestNr=${currentQuestNr}.`);
    var speechOutput = staticQuestions[currentQuestNr].question;
    const repromptText = staticQuestions[currentQuestNr].question;
    const shouldEndSession = false;
    currentQuest = speechOutput;

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Stellt dem Benutzer eine Frage.
 * @param {*} callback
 */
function getDynamicQuestion(callback) {
    const cardTitle = 'Frage gestellt';
    currentQuestNr = Math.floor(Math.random() * dynamicQuestions.length);
    console.log(`Authentication is in state ${auth_state.state}. CurrentQuestNr=${currentQuestNr}.`);
    var speechOutput = dynamicQuestions[currentQuestNr].question;
    const repromptText = dynamicQuestions[currentQuestNr].question;
    const shouldEndSession = false;
    currentQuest = speechOutput;

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Verifiziert die Rechenantwort. 
 * Trat beim Argument ein Fehler auf wird eine Antwort ausgegeben.
 * War die Antwort richtig, wird mit einer statischen Frage weiterverfahren.
 * War die Antwort falsch, wird die Authentifizierung abgebrochen.
 * @param {*} intent 
 * @param {*} callback 
 */
function verifyCalc(intent, callback) {
    console.log('result: ' + intent);
    var result = intent.slots.loesung.value;
    if (!result) console.log('verifyCalc failed! No number was given!');
    if (result == sum) {
        auth_state.calcToStatic(result, sum);
        getStaticQuestion(callback);
    } else {
        auth_state.answerWrong(result, sum);
        onFailed(callback);
    }
}

/**
 * Verifiziert die statische Antwort.
 * Trat beim Argument ein Fehler auf wird eine Antwort ausgegeben.
 * War die Antwort richtig, wird mit einer weiteren Frage verfahren. 
 * Ist hierbei der Schwellwert noch nicht erreicht worden, wird eine weitere statische Frage gestellt. Sonst gehen wir in die dynamischen rüber.
 * War die Antwort falsch, wird die Authentifizierung abgebrochen.
 * @param {*} intent 
 * @param {*} callback 
 */
function verifyStaticAnswer(intent, callback) {
    switch (currentQuestNr) {
        case 0:
            verifyColor(intent, callback, staticQuestions[0].answer, true);
            break;
        case 1:
            verifyPLZ(intent, callback, staticQuestions[1].answer, true);
            break;
        case 2:
            verifyCity(intent, callback, staticQuestions[2].answer, true);
            break;
        case 3:
            verifyCity(intent, callback, staticQuestions[3].answer, true);
            break;
        default: break;
    }
}

/**
 * Verifiziert die dynamische Antwort.
 * Trat beim Argument ein Fehler auf wird eine Antwort ausgegeben.
 * War die Antwort richtig, wird mit einer weiteren Frage verfahren. 
 * Ist hierbei der Schwellwert noch nicht erreicht worden, wird eine weitere dynamische Frage gestellt. Sonst war die Authentifizierung erfolgreich.
 * War die Antwort falsch, wird die Authentifizierung abgebrochen.
 * @param {*} intent 
 * @param {*} callback 
 */
function verifyDynamicAnswer(intent, callback) {
    switch (currentQuestNr) {
        case 0:
            verifyMoney(intent, callback, dynamicQuestions[0].answer, false);
            break;
        case 1:
            verifyMoney(intent, callback, dynamicQuestions[1].answer, false);
            break;
        default: break;
    }
}

/**
 * Überprüft eine Farbenantwort.
 * @param {*} intent 
 * @param {*} callback
 * @param {*} isStatic
 */
function verifyColor(intent, callback, correctAnswer, isStatic) {
    console.log('Verstandene Farbe: ' + intent.slots.farbe.value);
    var answer = intent.slots.farbe.value;
    if (!answer) console.log('verifyColor failed! No color was given!');
    if (answer == correctAnswer) {
        getNextState(isStatic, callback, answer, correctAnswer);
    } else {
        auth_state.answerWrong(answer, correctAnswer);
        onFailed(callback);
    }
}

/**
 * Eine Auswertung eines Geldbetrages.
 * @param {*} intent 
 * @param {*} callback
 * @param {*} isStatic 
 */
function verifyMoney(intent, callback, correctAnswer, isStatic) {
    console.log('Geldmenge: ' + intent.slots.euro.value + ', ' + intent.slots.cent.value + '€.' );
    var amountEuro = intent.slots.euro.value;
    var amountCent = intent.slots.cent.value;
    if (!amountEuro && !amountCent) console.log('verifyMoneyAnswer ');
    var answer = '';
    if (amountEuro) answer += `${amountEuro} euro`;
    if (amountEuro && amountCent) { 
        answer += ` und ${amountCent} sent`;
    } else {
        answer += `${amountCent} sent`;
    }
    if (answer == correctAnswer) {
        getNextState(isStatic, callback, answer, correctAnswer);
    } else {
        auth_state.answerWrong(answer, correctAnswer);
        onFailed(callback);
    }
}

/**
 * Überprüft die übergebene Postleitzahl.
 * @param {*} intent 
 * @param {*} callback 
 * @param {*} correctAnswer 
 */
function verifyPLZ(intent, callback, correctAnswer, isStatic) {
    console.log(`PLZ: ${intent.slots.erste.value}${intent.slots.zweite.value}${intent.slots.dritte.value}${intent.slots.vierte.value}${intent.slots.fuenfte.value}`);
    var intFirst = intent.slots.erste.value;
    var intSecond = intent.slots.zweite.value;
    var intThird = intent.slots.dritte.value;
    var intFourth = intent.slots.vierte.value;
    var intFifth = intent.slots.fuenfte.value
    var answer = `${intFirst}${intSecond}${intThird}${intFourth}${intFifth}`;
    
    if (answer == correctAnswer) {
        getNextState(isStatic, callback, answer, correctAnswer);
    } else {
        auth_state.answerWrong(answer, correctAnswer);
        onFailed(callback);
    }
}

/**
 * Überprüft ob eine Städte-Antwort korrekt ist.
 * @param {*} intent 
 * @param {*} callback 
 * @param {*} correctAnswer 
 * @param {*} isStatic 
 */
function verifyCity(intent, callback, correctAnswer, isStatic) {
    var answer = intent.slots.stadt.value;
    if (!answer) console.log('VerifyCity failed! No city was given!');
    if (answer == correctAnswer) {
        getNextState(isStatic, callback, answer, correctAnswer);
    } else {
        auth_state.answerWrong(answer, correctAnswer);
        onFailed(callback);
    }
}


module.exports = {auth_state,
                getState,
                isInState,
                wrongIntent,
                resetState,
                getCalculation,
                verifyCalc,
                verifyStaticAnswer,
                verifyDynamicAnswer,
                onAuthenticated,
                onFailed};
