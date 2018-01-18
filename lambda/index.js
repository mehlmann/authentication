'use strict';



// globale Variablen
var sum = 0;

/**
    Diese Funktion baut bei übergebenen Parametern eine Ausgabe für Alexa.
*/
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `SessionSpeechlet - ${title}`,
            content: `SessionSpeechlet - ${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}

/**
 * getWelcomeResponse wird bei starten des Skills ausgeführt und bildet eine Art Begrüssung.
 * @param {*} callback 
 */
function getWelcomeResponse(callback) {
    const sessionAttributes = {};
    const cardTitle = 'Willkommen';
    const speechOutput = 'Willkommen';
    const repromptText = 'Willkommen';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * getHelpResponse wird ausgeführt, wenn der Benutzer Hilfe benötigt.
 * @param {*} callback 
 */
function getHelpResponse(callback) {
    const sessionAttributes = {};
    const cardTitle = 'Hilfe';
    const speechOutput = 'Sie sollten sich authentifizieren.';
    const repromptText = 'Wollen sie sich nicht authentifizieren?';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * getEndResponse wird ausgeführt, sobald der Skill beendet wird.
 * @param {*} callback 
 */
function getEndResponse(callback) {
    const cardTitle = 'Skill beendet';
    const speechOutput = 'Auf Wiedersehen.';
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

/**
 * Wird bei Start des Skills ausgeführt.
 * @param {*} launchRequest 
 * @param {*} session 
 * @param {*} callback 
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`Skill requestId=${launchRequest.requestId}, sessionId=${session.sessionId} gestartet.`);
    getWelcomeResponse(callback);
}

function onSessionEnded(sessionEndedRequest, session, callback) {
    console.log(`Skill requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId} beendet.`);
    getEndResponse(callback);
}

function verifyAnswer(intent, callback) {
    const cardTitle = 'Antwort gegeben';
    var speechOutput = '';
    const shouldEndSession = false;
    try {
        var answer = intent.slots.antwort.value;
        speechOutput = `Ihre Anwort war ${answer}`;
        repromptText = `Ihre Anwort war ${answer}`;
    } catch (err) {
        speechOutput = 'Bei Ihrer Antwort ist ein Fehler aufgetreten.';
        repromptText = 'Bei Ihrer Antwort ist ein Fehler aufgetreten.';
    }
    callback({}, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function verifyCalc(intent, callback) {
    const cardTitle = 'Aufgabe gelöst';
    var speechOutput = '';
    const repromptText = ``;
    const shouldEndSession = false;
    try {
        var result = intent.slots.loesung.value;
        speechOutput = `Ihre Lösung war ${result}`;
        repromptText = `Ihre Lösung war ${result}`;
    } catch (err) {
        speechOutput = 'Bei Ihrer Antwort ist ein Fehler aufgetreten.';
        repromptText = 'Bei Ihrer Antwort ist ein Fehler aufgetreten.';
    }
    callback({}, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
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

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Stellt dem Benutzer eine Frage.
 * @param {*} callback
 */
function getQuestion(callback) {
    const cardTitle = 'Frage gestellt';
    var speechOutput = `Was ist deine Lieblingsfarbe?`;
    const repromptText = `Beantworte mir, was deine Lieblingsfarbe ist.`;
    const shouldEndSession = false;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Ruft die verschiedenen intents auf.
 * @param {*} intentRequest 
 * @param {*} session 
 * @param {*} callback 
 */
function onIntent(intentRequest, session, callback) {
    const intent = intentRequest.intent;
    if (intent.name === 'AMAZON.StopIntent' || intent.name === 'AMAZON.CancelIntent') {
        getEndResponse(callback);
    } else if (intent.name === 'AMAZON.HelpIntent') {
        getHelpResponse(callback);
    } else if (intent.name === 'Antworten') {
        verifyAnswer(intent, callback);
    } else if (intent.name === 'Rechenloesung') {
        verifyCalc(intent, callback);
    } else if (intent.name === 'Rechenaufgabe') {
        getCalculation(callback);
    } else if (intent.name === 'Frage') {
        getQuestion(callback);
    } else {
        throw new Error('Invalid intent');
    }
}

/**
 * Behandelt die ankommenden Anfragen.
 * @param {*} event 
 * @param {*} context 
 * @param {*} callback 
 */
exports.handler = (event, context, callback) => {
    try {
        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, 
                event.session, 
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
