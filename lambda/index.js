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
    if (intent.name === 'AMAZON.StopIntent' || intent.name === 'AMAZON.CancelIntent') {
        console.log(`Got a ${intent.name}.`);
        alexa.getEndResponse(callback);
    } else if (intent.name === 'AMAZON.HelpIntent') {
        console.log(`Got a ${intent.name}.`);
        alexa.getHelpResponse(callback);
    } else if (intent.name === 'Antworten') {
        console.log(`Got a ${intent.name}Intent.`);
        auth.categorizeRequest(intent, callback);
    } else if (intent.name === 'Rechenloesung') {
        console.log(`Got a ${intent.name}Intent.`);
        auth.categorizeRequest(intent, callback);
    } else if (intent.name === 'Rechenaufgabe') {
        console.log(`Got a ${intent.name}Intent.`);
        auth.categorizeRequest(intent, callback);
    } else if (intent.name === 'Frage') {
        console.log(`Got a ${intent.name}Intent.`);
        if (auth.isState('calc')) {
            auth.getStaticQuestion(callback);
        } else {
            auth.getDynamicQuestion(callback);
        }
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
