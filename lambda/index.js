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

    switch (intent.name) {
        case 'AMAZON.StopIntent':
            console.log(`Got a ${intent.name}.`);
            alexa.getEndResponse(callback);
        case 'AMAZON.CancelIntent':
            console.log(`Got a ${intent.name}.`);
            alexa.getEndResponse(callback);
        case 'AMAZON.HelpIntent':
            console.log(`Got a ${intent.name}.`);
            alexa.getHelpResponse(callback);
        case 'Rechenaufgabe':
            console.log(`Got a ${intent.name}Intent.`);
            if (auth.auth_state.is('start')) {
                auth.getCalculation(callback);
            } else {
                auth.wrongIntent(intent, callback);
            }
        case 'Rechenloesung':
            console.log(`Got a ${intent.name}Intent.`);
            if (auth.isInState('calc')) {
                auth.getStaticQuestion(callback);
            } else {
                auth.getDynamicQuestion(callback);
            }
        case 'Antworten':
            console.log(`Got a ${intent.name}Intent.`);
            auth.categorizeRequest(intent, callback);
        default: throw new Error('Invalid intent');
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
