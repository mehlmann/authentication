'use strict';

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
    const speechOutput = 'Du solltest dich authentifizieren.';
    const repromptText = 'Willst du dich nicht authentifizieren?';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * handleSessionEndRequest wird ausgeführt, sobald der Skill beendet wird.
 * @param {*} callback 
 */
function handleSessionEndRequest(callback) {
    const cardTitle = 'Skill beendet';
    const speechOutput = 'Auf Wiedersehen.';
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

/**
 * Ruft die verschiedenen intents auf.
 * @param {*} intentRequest 
 * @param {*} session 
 * @param {*} callback 
 */
function onIntent(intentRequest, session, callback) {
    const intentName = intentRequest.intent.name;

    if (intentName === 'AMAZON.HelpIntent') {
        getHelpResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent' || intentName === 'SessionEndedRequest') {
        handleSessionEndRequest(callback);
    } else if (intentName === 'LaunchRequest') {
        getWelcomeResponse(callback);
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
        if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        }
    } catch (err) {
        callback(err);
    }
};
