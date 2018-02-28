'use strict'

const alexa = require('./alexa');
const auth = require('./auth');
const fct = require('./help-functions');
const quest = require('./data/questions');

/**
 * Beim Start ist nur Aufgabe erlaubt.
 * @param {function} callback Callback
 */
function handleStartIntents(intent, callback) {
    (intent.name == 'RechenaufgabeIntent') ? auth.getCalculation(callback) : alexa.getHelpResponse(callback);
}

/**
 * Nachdem eine Aufgabe gestellt wurde, sollte sie mit einer Zahl beantwortet werden.
 * @param {*} intent Intent
 * @param {function} callback Callback
 */
function handleCalcIntents(intent, callback) {
    (intent.name == 'ZahlIntent') ? auth.verifyCalc(intent, callback) : auth.wrongIntent(callback);
}

/**
 * Nachdem eine Frage gestellt wurde, sollte sie mit einer passenden Antwort beantwortet werden.
 * @param {*} intent Intent
 * @param {function} callback Callback
 */
function handleQuestIntents(intent, callback) {
    switch (intent.name) {
        case 'AntwortenEinsIntent':
            auth.verifyCommonAnswer(intent, callback);
            break;
        case 'AntwortenZweiIntent':
            auth.verifyCommonAnswer(intent, callback);
            break;
        case 'AntwortenDreiIntent':
            auth.verifyCommonAnswer(intent, callback);
            break;
        case 'AntwortenVierIntent':
            auth.verifyCommonAnswer(intent, callback);
            break;
        case 'AntwortenFuenfIntent':
            auth.verifyCommonAnswer(intent, callback);
            break;
        case 'BierIntent':
            auth.verifyBeer(intent, callback);
            break;
        case 'FahrzeugIntent':
            auth.verifyVehicle(intent, callback);
            break;
        case 'ElektronikMarkenIntent':
            auth.verifyCellphone(intent, callback);
            break;
        case 'FarbeIntent':
            auth.verifyColor(intent, callback);
            break;
        case 'FussballIntent':
            auth.verifySoccer(intent, callback);
            break;
        case 'GeldsummeIntent':
            auth.verifyMoney(intent, callback);
            break;
        case 'InstrumentIntent':
            auth.verifyInstrument(intent, callback);
            break;
        case 'LandIntent':
            auth.verifyLand(intent, callback);
            break;
        case 'SportIntent':
            auth.verifySport(intent, callback);
            break;
        case 'StadtIntent':
            auth.verifyCity(intent, callback);
            break;
        case 'TierIntent':
            auth.verifyAnimal(intent, callback);
            break;
        case 'UnterrichtIntent':
            auth.verifySchoolSubject(intent, callback);
            break;
        case 'VornameIntent':
            auth.verifyFirstname(intent, callback);
            break;
        case 'ZahlIntent':
            auth.verifyNumber(intent, callback);
            break;
        case 'ZahlenZweiIntent':
            auth.verifyNumber(intent, callback);
            break;
        case 'ZahlenDreiIntent':
            auth.verifyNumber(intent, callback);
            break;
        case 'ZahlenVierIntent':
            auth.verifyNumber(intent, callback);
            break;
        case 'ZahlenFuenfIntent':
            auth.verifyNumber(intent, callback);
            break;
        default: auth.wrongIntent(callback);
    }
}

/**
 * Nachdem eine Ja/Nein-Frage gestellt wurde, sollte man auch mit Ja oder Nein antworten.
 * @param {*} intent Intent
 * @param {function} callback Callback
 */
function handleConfirmQuestIntents(intent, callback) {
    if (intent.name == 'AMAZON.YesIntent') {
        auth.endAddQuest(callback)
    } else if (intent.name == 'AMAZON.NoIntent') {
        auth.repromptCheck(callback)
    } else {
        auth.wrongIntent(callback);
    }
}

/**
 * Nachdem eine Ja/Nein-Frage gestellt wurde, sollte man auch mit Ja oder Nein antworten.
 * @param {*} intent Intent
 * @param {function} callback Callback
 */
function handleConfirmAnswerIntents(intent, callback) {
    if (intent.name == 'AMAZON.YesIntent') {
        auth.endAddAnswer(callback)
    } else if (intent.name == 'AMAZON.NoIntent') {
        auth.repromptCheck(callback)
    } else {
        auth.wrongIntent(callback);
    }
}

/**
 * Nachdem die Authentifizierung erfolgreich abgeschlossen wurde, kann man entweder Fragen hinzufügen oder neustarten.
 * @param {*} intent Intent
 * @param {function} callback Callback
 */
function handleSuccessIntents(intent, callback) {
    if (intent.name == 'Reset') {
        auth.resetState(callback);
    } else if (intent.name == 'FrageHinzufuegen') {
        auth.addQuestion(callback);
    }
}

/**
 * Nachdem die Authentifizierung fehlgeschlagen ist, kann man nur neustarten.
 * @param {*} intent Intent
 * @param {function} callback Callback
 */
function handleFailedIntents(intent, callback) {
    if (intent.name == 'Reset') auth.resetState(callback);
}

/**
 * Nachdem das Hinzufügen einer Frage verlangt wurde, kann auch nur eine Frage angenommen werden.
 * @param {*} intent Intent 
 * @param {*} callback Callback
 */
function handleAddQuestIntents(intent, callback) {
    (intent.name == 'FrageIntent') ? auth.verifyQuestion(intent, callback) : auth.wrongIntent(callback) ; 
}


/**
 * Ruft die verschiedenen intents auf.
 * @param {*} intentRequest Anfrage
 * @param {*} session aktuelle Sitzung
 * @param {function} callback Rückgabefunktion
 */
function onIntent(intentRequest, session, callback) {
    const intent = intentRequest.intent;
    fct.printLog(`Authentication in state ${auth.getState()}.`);
    fct.printLog(intent);

    // Zuerst die global verfügbaren Befehle prüfen.
    if (intent.name == 'AMAZON.StopIntent') alexa.getEndResponse(callback);
    if (intent.name == 'AMAZON.CancelIntent') alexa.getEndResponse(callback);
    if (intent.name == 'AMAZON.HelpIntent') alexa.getHelpResponse(callback);

    // abhängig vom Zustand werden nur bestimmte Intents zugelassen.
    switch (auth.getState()) {
        case 'start':
            handleStartIntents(intent, callback);
            break;
        case 'calc':
            handleCalcIntents(intent, callback);
            break;
        case 'static':
            handleQuestIntents(intent, callback);
            break;
        case 'dynamic':
            handleQuestIntents(intent, callback);
            break;
        case 'addQuest':
            handleAddQuestIntents(intent, callback);
            break;
        case 'addAnswer':
            handleQuestIntents(intent, callback);
            break;
        case 'checkQuest':
            handleConfirmQuestIntents(intent, callback);
            break;
        case 'checkAnswer':
            handleConfirmAnswerIntents(intent, callback);
            break;
        case 'success':
            handleSuccessIntents(intent, callback);
            break;
        case 'failed':
            handleFailedIntents(intent, callback);
            break;
        default: fct.printError(`onIntent failed. State ${auth.getState()} unknown.`); break;
    }
}

/**
 * Behandelt die ankommenden Anfragen.
 * @param {*} event Ereignis
 * @param {*} context der aktuelle Kontext
 * @param {function} callback Rückgabefunktion
 */
exports.handler = (event, context, callback) => {
    try {
        if (event.request.type === 'LaunchRequest') {
            fct.printLog(`Authentication in state ${auth.getState()}.`);
            var sys = event.context.System;
            fct.printLog(sys);
            //quest.initAnswers(sys);
            alexa.onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, alexa.buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, alexa.buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            alexa.onSessionEnded(event.request, 
                event.session, 
                (sessionAttributes, speechletResponse) => {
                    callback(null, alexa.buildResponse(sessionAttributes, speechletResponse));
                });
            callback();
        }
    } catch (err) {
        fct.printError(err);
        callback(err);
    }
};
