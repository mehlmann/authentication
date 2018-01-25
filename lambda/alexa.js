/**
 * Die Standard-Funktionen für Alexa.
 */

const helpFct = require('./help-functions')

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
        helpFct.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
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
        helpFct.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * getEndResponse wird ausgeführt, sobald der Skill beendet wird.
 * @param {*} callback 
 */
function getEndResponse(callback) {
    const cardTitle = 'Skill beendet';
    const speechOutput = 'Auf Wiedersehen.';
    const shouldEndSession = true;

    callback({}, helpFct.buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
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

/**
 * Wird bei Beenden des Skills ausgeführt.
 * @param {*} sessionEndedRequest 
 * @param {*} session 
 * @param {*} callback 
 */
function onSessionEnded(sessionEndedRequest, session, callback) {
    console.log(`Skill requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId} beendet.`);
    getEndResponse(callback);
}


module.exports = {getWelcomeResponse,
                getHelpResponse,
                getEndResponse,
                onLaunch,
                onSessionEnded}
