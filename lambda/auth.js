/**
 * Der Verlauf einer Authentifizierung kann als State-Machine gesehen werden. 
 * Dies soll die Variable alexa_state implementieren.
 * 
 * Docs: https://github.com/jakesgordon/javascript-state-machine
 * 
 * Ein Beispiel einer Fragen-State-Machine könnte sein:
 * 
 *  ------   Antwort korrekt   ------   Antwort korrekt   -------
 * |quest1|------------------>|quest2|------------------>|success|
 *  ------                     ------                     -------
 *    |                           |
 *    |                           v Antwort falsch
 *    |      Antwort falsch    ------
 *    |---------------------->|failed|
 *                             ------
 */

var StateMachine = require('./includes/javascript-state-machine')
const helpFct = require('./help-functions')
const questions = require('./data/questions')

// globale Variablen
var sum = -1;

var auth_state = new StateMachine({
    init : 'start',
    transitions: [
        { name: 'getQuestion',    from: 'start',  to: 'quest1' },
        { name: 'answerCorrect',  from: 'quest1', to: 'quest2' },
        { name: 'answerCorrect',  from: 'quest2', to: 'success'},
        { name: 'answerWrong',    from: 'quest1', to: 'failed' },
        { name: 'answerWrong',    from: 'quest2', to: 'failed' }
    ],
    methods: {
        onGetQuestion: function(question) {
            console.log(`Question is: ${question}.`);
        },
        onAnswerCorrect: function(claim, real) {
            console.log(`Answer was correct. You said ${claim}, it was ${real}.`);
        },
        onAnswerWrong:  function(claim, real) {
            console.log(`Answer was wrong! You said ${claim}, it was ${real}.`);
        }     
    }
});

function categorizeRequest(intent, callback) {
    if (auth_state.is('start')) {
        getQuestion(callback);
    } else if (auth_state.is('quest1')) {
        verifyCalc(intent, callback);
    }else if (auth_state.is('quest2')) {
        verifyAnswer(intent, callback);
    } else if (auth_state.is('authenticated')) {
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

    callback({}, helpFct.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Der Benutzer hat versagt.
 * @param {*} callback
 */
function onFailed(callback) {
    const cardTitle = 'Authentication failed.';
    var speechOutput = 'Die Authentifizierung ist bereits fehlgeschlagen.';
    const repromptText = `Auf Wiedersehen.`;
    const shouldEndSession = false;

    callback({}, helpFct.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function verifyAnswer(intent, callback) {
    const cardTitle = 'Antwort gegeben';
    var speechOutput = '';
    var repromptText = '';
    const shouldEndSession = false;
    try {
        var answer = intent.slots.antwort.value;
        speechOutput = `Ihre Anwort war ${answer}. `;
        repromptText = `Ihre Anwort war ${answer}. `;
    } catch (err) {
        speechOutput = 'Bei Ihrer Antwort ist ein Fehler aufgetreten.';
        repromptText = 'Bei Ihrer Antwort ist ein Fehler aufgetreten.';
        callback({}, helpFct.buildSpeechletResponse(cardTitle, speechOutput, repromptText, true));
    }
    if (answer == questions[0].answer) {
        speechOutput += 'Dies ist richtig.';
        auth_state.answerCorrect(answer, questions[0].answer);
    } else {
        speechOutput += 'Dies ist falsch.';
        auth_state.anwerWrong(answer, questions[0].answer);
    }
    callback({}, helpFct.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function verifyCalc(intent, callback) {
    if (sum < 0) getCalculation(callback);

    const cardTitle = 'Aufgabe gelöst';
    var speechOutput = '';
    var repromptText = ``;
    const shouldEndSession = false;
    try {
        var result = intent.slots.loesung.value;
        speechOutput = `Ihre Lösung war ${result}. `;
        repromptText = `Ihre Lösung war ${result}. `;
    } catch (err) {
        speechOutput = 'Bei Ihrer Antwort ist ein Fehler aufgetreten.';
        repromptText = 'Bei Ihrer Antwort ist ein Fehler aufgetreten.';
        callback({}, helpFct.buildSpeechletResponse(cardTitle, speechOutput, repromptText, true));
    }
    if (helpFct.stringToInteger(result.toLowerCase()) == sum) {
        speechOutput += 'Dies ist richtig.';
        auth_state.answerCorrect(result, sum);
    } else {
        speechOutput += 'Dies ist falsch.';
        auth_state.answerWrong(result, sum);
    }
    callback({}, helpFct.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
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

    callback({}, helpFct.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Stellt dem Benutzer eine Frage.
 * @param {*} callback
 */
function getQuestion(callback) {
    const cardTitle = 'Frage gestellt';
    var speechOutput = questions[0].question;
    const repromptText = `Beantworte mir, was deine Lieblingsfarbe ist.`;
    const shouldEndSession = false;

    callback({}, helpFct.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


module.exports = {auth_state,
                categorizeRequest,
                onAuthenticated,
                onFailed,
                verifyAnswer,
                verifyCalc,
                getCalculation,
                getQuestion}
