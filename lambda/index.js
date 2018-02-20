'use strict'

const alexa = require('./alexa')
const auth = require('./auth')
const quest = require('./data/questions')

/**
 * Ruft die verschiedenen intents auf.
 * @param {*} intentRequest Anfrage
 * @param {*} session aktuelle Sitzung
 * @param {function} callback Rückgabefunktion
 */
function onIntent(intentRequest, session, callback) {
    const intent = intentRequest.intent;
    console.log(`Authentication in state ${auth.getState()}.`);
    console.log(`Got a ${intent.name}.`);
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
            if (auth.isInState('checkDynRefresh')) {
                auth.endDynRefresh(callback);
            } else {
                auth.wrongIntent(callback);
            }
            break;
        case 'AMAZON.NoIntent':
            if (auth.isInState('checkDynRefresh')) {
                auth.repromptDynRefresh(callback);
            } else {
                auth.wrongIntent(callback);
            }
            break;
        case 'AntwortenIntent':
            gotKnownIntent(intent, callback);
            break;
        case 'FarbeIntent':
            gotKnownIntent(intent, callback);
            break;
        case 'GeldsummeIntent':
            gotKnownIntent(intent, callback);
            break;
        case 'HandyMarkenIntent':
            gotKnownIntent(intent, callback);
            break;
        case 'RechenaufgabeIntent':
            (auth.isInState('start')) ? auth.getCalculation(callback) : auth.wrongIntent(callback);
            break;
        case 'Reset':
            if (auth.isInState('failed') || auth.isInState('success')) {
                auth.resetState(callback);
            } else {
                auth.wrongIntent(callback);
            }
            break;
        case 'StadtIntent':
            gotKnownIntent(intent, callback);
            break;
        case 'ZahlIntent':
            gotKnownIntent(intent, callback);
            break;
        case 'ZahlenZweiIntent':
            gotKnownIntent(intent, callback);
            break;
        case 'ZahlenDreiIntent':
            gotKnownIntent(intent, callback);
            break;
        case 'ZahlenVierIntent':
            gotKnownIntent(intent, callback);
            break;
        case 'ZahlenFuenfIntent':
            gotKnownIntent(intent, callback);
            break;
        default: alexa.onUnknownIntent(callback); break;
    }
}

/**
 * Ein bekannter Intent wurde empfangen, leite ihn weiter.
 * @param {*} intent Intent
 * @param {function} callback Rückgabefunktion
 */
function gotKnownIntent(intent, callback) {
    if (auth.isInState('calc')) {
        auth.verifyCalc(intent, callback);
    } else if (auth.isInState('static')) {
        auth.verifyStaticAnswer(intent, callback);
    } else if (auth.isInState('dynamic')) {
        auth.verifyDynamicAnswer(intent, callback);
    } else if (auth.isInState('dynRefresh')) {
        auth.checkRefresh(intent, callback);
    } else {
        auth.wrongIntent(callback);
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
            console.log(`Authentication in state ${auth.getState()}.`);
            var sys = event.context.System;
            console.log(sys);
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
        callback(err);
    }
};
