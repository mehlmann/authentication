'use strict'

const fct = require('./help-functions');

/**
 * Die Standard-Funktionen für Alexa.
 *
 * Diese zwei Funktionen bauen bei übergebenen Parametern eine Ausgabe für Alexa.
 * @param {string} title Titel des Speechlets
 * @param {string} output Ausgabe von Alexa
 * @param {string} repromptText Wiederholte Ausgabe von Alexa
 * @param {boolean} shouldEndSession true - Ende der App 
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
 * @param {function} callback Rückgabe an die App
 */
function getWelcomeResponse(callback) {
    const cardTitle = 'Willkommen';
    const speechOutput = 'Willkommen';
    const repromptText = 'Willkommen';
    const shouldEndSession = false;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * getHelpResponse wird ausgeführt, wenn der Benutzer Hilfe benötigt.
 * @param {function} callback Rückgabe an die App
 */
function getHelpResponse(callback) {
    const cardTitle = 'Hilfe';
    const speechOutput = 'Sie sollten sich authentifizieren.';
    const repromptText = 'Wollen sie sich nicht authentifizieren?';
    const shouldEndSession = false;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * getEndResponse wird ausgeführt, sobald der Skill beendet wird.
 * @param {function} callback Rückgabe an die App
 */
function getEndResponse(callback) {
    const cardTitle = 'Skill beendet';
    const speechOutput = 'Auf Wiedersehen.';
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

/**
 * Wird bei Start des Skills ausgeführt.
 * @param {*} launchRequest Anfrage
 * @param {*} session aktuelle Sitzung
 * @param {function} callback Rückgabe an die App
 */
function onLaunch(launchRequest, session, callback) {
    fct.printLog(`Skill requestId=${launchRequest.requestId}, sessionId=${session.sessionId} gestartet.`);
    getWelcomeResponse(callback);
}

/**
 * Wird bei Beenden des Skills ausgeführt.
 * @param {*} sessionEndedRequest Anfrage
 * @param {*} session aktuelle Sitzung
 * @param {function} callback Rückgabe an die App
 */
function onSessionEnded(sessionEndedRequest, session, callback) {
    fct.printLog(`Skill requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId} beendet.`);
    getEndResponse(callback);
}

/**
 * Sollte ein Intent nicht erfasst worden sein.
 * @param {function} callback Rückgabe an die App
 */
function onUnknownIntent(callback) {
    const cardTitle = 'Unknown Intent';
    const speechOutput = 'Ich habe Sie nicht verstanden. Bitte wiederholen Sie das zuvor gesagte.';
    const repromptText = 'Bitte wiederholen Sie das zuvor gesagte.';
    const shouldEndSession = false;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

module.exports = {buildSpeechletResponse,
                buildResponse,
                getWelcomeResponse,
                getHelpResponse,
                getEndResponse,
                onLaunch,
                onSessionEnded,
                onUnknownIntent};
