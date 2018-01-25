'use strict'



const alexa = require('./alexa')
const auth = require('./auth')
const helpFct = require('./help-functions')


/**
 * Ruft die verschiedenen intents auf.
 * @param {*} intentRequest 
 * @param {*} session 
 * @param {*} callback 
 */
function onIntent(intentRequest, session, callback) {
    const intent = intentRequest.intent;
    if (intent.name === 'AMAZON.StopIntent' || intent.name === 'AMAZON.CancelIntent') {
        alexa.getEndResponse(callback);
    } else if (intent.name === 'AMAZON.HelpIntent') {
        alexa.getHelpResponse(callback);
    } else if (intent.name === 'Antworten') {
        if (auth.auth_state.is('quest1')) {
            auth.verifyCalc(intent, callback);
        }else if (auth.auth_state.is('quest2')) {
            auth.verifyAnswer(intent, callback);
        } else if (auth.auth_state.is('authenticated')) {
            auth.onAuthenticated(callback);
        } else if (auth.auth_state.is('abort')) {
            auth.onFailed(callback);
        }
    } else if (intent.name === 'Rechenloesung') {
        if (auth.auth_state.is('quest1')) {
            auth.verifyCalc(intent, callback);
        } else if (auth.auth_state.is('quest2')) {
            auth.verifyAnswer(intent, callback);
        } else if (auth.auth_state.is('authenticated')) {
            auth.onAuthenticated(callback);
        } else if (auth.auth_state.is('abort')) {
            auth.onFailed(callback);
        }
    } else if (intent.name === 'Rechenaufgabe') {
        auth.getCalculation(callback);
    } else if (intent.name === 'Frage') {
        auth.getQuestion(callback);
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
            alexa.onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, helpFct.buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, helpFct.buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            alexa.onSessionEnded(event.request, 
                event.session, 
                (sessionAttributes, speechletResponse) => {
                    callback(null, helpFct.buildResponse(sessionAttributes, speechletResponse));
                });
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
