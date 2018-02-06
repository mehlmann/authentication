'use strict'



const alexa = require('./alexa')
const auth = require('./auth')

/**
 * Ruft die verschiedenen intents auf.
 * @param {*} intentRequest 
 * @param {*} session 
 * @param {*} callback 
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
        case 'RechenaufgabeIntent':
            (auth.isInState('start')) ? auth.getCalculation(callback) : auth.wrongIntent(intent, callback);
            break;
        case 'RechenloesungIntent':
            (auth.isInState('calc')) ? auth.verifyCalc(intent, callback) : auth.wrongIntent(intent, callback);
            break;
        case 'AntwortenIntent':
            if (auth.isInState('static')) {
                auth.verifyStaticAnswer(intent, callback);
            } else if (auth.isInState('dynamic')) {
                auth.verifyDynamicAnswer(intent, callback);
            } else {
                auth.wrongIntent(intent, callback);
            }
            break;
        case 'FarbeIntent':
            (auth.isInState('static')) ? auth.verifyStaticAnswer(intent, callback) : auth.wrongIntent(intent, callback);
            break;
        case 'GeldsummeIntent':
            (auth.isInState('dynamic')) ? auth.verifyDynamicAnswer(intent, callback) : auth.wrongIntent(intent, callback);
            break;
        default: alexa.onUnknownIntent(callback); break;
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
            console.log(`Authentication in state ${auth.getState()}.`);
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
