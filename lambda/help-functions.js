'use strict';

var numbers = require('./data/numbers')

/**
    Diese zwei Funktionen bauen bei übergebenen Parametern eine Ausgabe für Alexa.
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
 * Wandelt eine gesprochene Zahl in den dazugehörigen Integer um.
 * @param {*} integerStr
 */
function stringToInteger(integerStr) {
    for (var i = 0; i < numbers.length; i++) {
        if (numbers[i].word == integerStr) 
            return numbers[i].number;
    }
    return 'Hello World.';
}



module.exports = {stringToInteger,
                  buildSpeechletResponse,
                  buildResponse};