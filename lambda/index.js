'use strict'

const alexa = require('./alexa');
const auth = require('./auth');
const fct = require('./help-functions');
const quest = require('./data/questions');

/**
 * Ruft die verschiedenen intents auf.
 * @param {*} intentRequest Anfrage
 * @param {*} session aktuelle Sitzung
 * @param {function} callback Rückgabefunktion
 */
function onIntent(intentRequest, session, callback) {
    const intent = intentRequest.intent;
    fct.printLog(`Authentication in state ${auth.getState()}.`);
    fct.printLog(`Got a ${intent.name}.`);
    switch (intent.name) {
        case 'AMAZON.StopIntent':
            alexa.getEndResponse(callback);
            break;
        case 'AMAZON.CancelIntent':
            alexa.getEndResponse(callback);
            break;
        case 'AMAZON.HelpIntent':
            alexa.getHelpResponse(callback);
            break;
        case 'AMAZON.YesIntent':
            (auth.isInState('checkDynRefresh')) ? auth.endDynRefresh(callback) : auth.wrongIntent(callback);
            break;
        case 'AMAZON.NoIntent':
            (auth.isInState('checkDynRefresh')) ? auth.repromptDynRefresh(callback) : auth.wrongIntent(callback);
            break;
        case 'AntwortenIntent':
            fct.printLog('Got a AntwortIntent.'); // TODO
            break;
        case 'ElektronikMarkenIntent':
            auth.verifyCellphone(intent, callback);
            break;
        case 'FarbeIntent':
            auth.verifyColor(intent, callback);
            break;
        case 'GeldsummeIntent':
            auth.verifyMoney(intent, callback);
            break;
        case 'LandIntent':
            auth.verifyLand(intent, callback);
            break;
        case 'RechenaufgabeIntent':
            (auth.isInState('start')) ? auth.getCalculation(callback) : auth.wrongIntent(callback);
            break;
        case 'Reset':
            (auth.isInState('failed') || auth.isInState('success')) ? auth.resetState(callback) : auth.wrongIntent(callback);
            break;
        case 'StadtIntent':
            auth.verifyCity(intent, callback);
            break;
        case 'ZahlIntent':
            (auth.isInState('calc')) ? auth.verifyCalc(intent, callback) : auth.verifyNumber(intent, callback);
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
        default: alexa.onUnknownIntent(callback); break;
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
            quest.initAnswers(sys);
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
