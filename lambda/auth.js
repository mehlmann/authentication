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

var StateMachine = require('./includes/javascript-state-machine')
const helpFct = require('./help-functions')
const alexa = require('./alexa')
const staticQuestions = require('./data/questions').staticQuestions
const dynamicQuestions = require('./data/questions').dynamicQuestions

// globale Variablen
var sum = 15;
var statThreshold = 1;
var dynThreshold = 1;

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
        { name: 'answerWrong',      from: 'dynamic', to: 'failed'  }
    ],
    methods: {
        onStartToCalc: function(question) {
            console.log(`Question is: ${question}. Moving from start to calc.`);
        },
        onCalcToStatic: function(claim, real) {
            console.log(`Answer was correct. You said ${claim}, it was ${real}. Moving from calc to static.`);
        },
        onStaticToStatic: function(claim, real) {
            console.log(`Answer was correct. You said ${claim}, it was ${real}. Moving from static to static.`);
        },
        onStaticToDynamic: function(claim, real) {
            console.log(`Answer was correct. You said ${claim}, it was ${real}. Moving from static to dynamic.`);
        },
        onDynamicToDynamic: function(claim, real) {
            console.log(`Answer was correct. You said ${claim}, it was ${real}. Moving from dynamic to dynamic.`);
        },
        onDynamicToSuccess: function(claim, real) {
            console.log(`Answer was correct. You said ${claim}, it was ${real}. Moving from dynamic to success.`);
        },
        onAnswerWrong:  function(claim, real) {
            console.log(`Answer was wrong! You said ${claim}, it was ${real}.`);
        },
        onInvalidTransition: function(transition, from, to) {
            const cardTitle = 'Falscher Intent.';
            var speechOutput = 'Sie sollten die letzte Frage beantworten.';
            const shouldEndSession = false;
        
            callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, speechOutput, shouldEndSession));
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
function isState(state) {
    return auth_state.is(state);
}

function categorizeRequest(intent, callback) {
    // switch case maybe?  TODO
    if (auth_state.is('start')) {
        getCalculation(callback);
    } else if (auth_state.is('calc')) {
        verifyCalc(intent, callback);
    }else if (auth_state.is('static')) {
        verifyStaticAnswer(intent, callback);
    } else if (auth_state.is('dynamic')) {
        verifyDynamicAnswer(intent, callback);
    } else if (auth_state.is('success')) {
        onAuthenticated(callback);
    } else if (auth_state.is('abort')) {
        onFailed(callback);
    }
}

/**
 * Der Benutzer ist bereits authentifiziert.
 * @param {*} callback
 */
function onAuthenticated(callback) {
    const cardTitle = 'Authentication done.';
    var speechOutput = 'Die Authentifizierung war bereits erfolgreich.';
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
    const shouldEndSession = true;

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Stellt dem Benutzer eine simple Additions-Aufgabe.
 * @param {*} callback 
 */
function getCalculation(callback) {
    var summandA = Math.floor(Math.random() * 20);
    var summandB = Math.floor(Math.random() * 20);
    sum = 15;//summandA + summandB; TODO

    const cardTitle = 'Aufgabe gestellt';
    var speechOutput = `Was ist ${summandA} plus ${summandB}?`;
    const repromptText = `Lösen Sie bitte die Aufgabe ${summandA} plus ${summandB}.`;
    const shouldEndSession = false;

    auth_state.startToCalc(speechOutput);

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Stellt dem Benutzer eine Frage.
 * @param {*} callback
 */
function getStaticQuestion(callback) {
    console.log(`Authentication is in state ${auth_state.state}.`);
    const cardTitle = 'Frage gestellt';
    var speechOutput = staticQuestions[0].question;
    const repromptText = staticQuestions[0].question;
    const shouldEndSession = false;

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Stellt dem Benutzer eine Frage.
 * @param {*} callback
 */
function getDynamicQuestion(callback) {
    console.log(`Authentication is in state ${auth_state.state}.`);
    const cardTitle = 'Frage gestellt';
    var speechOutput = dynamicQuestions[0].question;
    const repromptText = dynamicQuestions[0].question;
    const shouldEndSession = false;

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
    try {
        var result = intent.slots.loesung.value;
    } catch (err) {
        var speechOutput = 'Bei Ihrer Rechen-Antwort ist ein Fehler aufgetreten.';
        callback({}, alexa.buildSpeechletResponse('Rechenlösung Fehler', speechOutput, speechOutput, false));
    }
    if (helpFct.stringToInteger(result.toLowerCase()) == sum) {
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
    try {
        var answer = intent.slots.antwort.value;
    } catch (err) {
        var speechOutput = 'Bei Ihrer statischen Antwort ist ein Fehler aufgetreten.';
        callback({}, alexa.buildSpeechletResponse('StatAnswer Fehler', speechOutput, speechOutput, false));
    }
    if (answer === staticQuestions[0].answer) {
        statThreshold--;
        if (statThreshold > 0) {
            auth_state.staticToStatic(answer, staticQuestions[0].answer);
            getStaticQuestion(callback);
        } else {
            auth_state.staticToDynamic(answer, staticQuestions[0].answer);
            getDynamicQuestion(callback);
        }
    } else {
        auth_state.answerWrong(answer, staticQuestions[0].answer);
        onFailed(callback);
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
    try {
        var answer = intent.slots.antwort.value;
    } catch (err) {
        var speechOutput = 'Bei Ihrer dynamischen Antwort ist ein Fehler aufgetreten.';
        var repromptText = 'Bei Ihrer dynamischen Antwort ist ein Fehler aufgetreten.';
        callback({}, alexa.buildSpeechletResponse('DynAnswer Fehler', speechOutput, speechOutput, false));
    }
    if (answer == dynamicQuestions[0].answer) {
        dynThreshold--;
        if (dynThreshold > 0) {
            auth_state.dynamicToDynamic(answer, dynamicQuestions[0].answer);
            getDynamicQuestion(callback);
        } else {
            auth_state.dynamicToSuccess(answer, dynamicQuestions[0].answer);
            onAuthenticated(callback);
        }
    } else {
        auth_state.answerWrong(answer, dynamicQuestions[0].answer);
        onFailed(callback);
    }
}


module.exports = {auth_state,
                getState,
                isState,
                categorizeRequest,
                onAuthenticated,
                onFailed,
                getStaticQuestion,
                getDynamicQuestion}
