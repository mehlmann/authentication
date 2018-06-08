'use strict'

const alexa = require('./alexa');
const auth = require('./auth');
const fct = require('./help-functions');

const debug = false;

/**
 * Nachdem eine Zahlenaufgabe gestellt wurde, sollte sie mit einer Zahl beantwortet werden.
 * @param {*} intent Intent
 * @param {function} callback Callback
 */
function handleCalcIntents(intent, callback) {
    if (intent.name == 'AbbruchIntent') auth.noWayOut(callback);
    (intent.name == 'CalcIntent' || intent.name == 'ZahlIntent') ? auth.verifyCalc(intent, callback) : auth.wrongIntent(callback);
}

/**
 * Nachdem eine Ja/Nein-Frage gestellt wurde, sollte man auch mit Ja oder Nein antworten.
 * @param {*} intent Intent
 * @param {function} callback Callback
 */
function handleConfirmAnswerIntents(intent, callback) {
    if (intent.name == 'JaIntent') {
        (auth.needSetup()) ? auth.addAnswer(callback, intent) : auth.endAddAnswer(callback);
    } else if (intent.name == 'NeinIntent') {
        auth.repromptCheck(callback);
    } else if (intent.name == 'AbbruchIntent') {
        auth.abort(callback);
    } else {
        auth.wrongIntent(callback);
    }
}

/**
 * Nachdem eine Ja/Nein-Frage gestellt wurde, sollte man auch mit Ja oder Nein antworten.
 * @param {*} intent Intent
 * @param {function} callback Callback
 */
function handleConfirmQuestIntents(intent, callback) {
    if (intent.name == 'JaIntent') {
        auth.endAddQuest(callback);
    } else if (intent.name == 'NeinIntent') {
        auth.repromptCheck(callback);
    } else if (intent.name == 'AbbruchIntent') {
        auth.abort(callback);
    } else {
        auth.wrongIntent(callback);
    }
}

/**
 * Nachdem die Authentifizierung fehlgeschlagen ist, kann man nur neustarten.
 * @param {*} intent Intent
 * @param {function} callback Callback
 */
function handleFailedIntents(intent, callback) {
    (intent.name == 'Reset') ? auth.resetState(callback) : auth.wrongIntent(callback);
}

/**
 * Während der Einrichtung hat der Benutzer zwei Optionen:
 * (1) Frage überpringen
 * (2) Frage beantworten
 * @param {String} intent Intent 
 * @param {function} callback Rückgabefunktion
 */
function handleSetupIntent(intent, callback) {
    if (intent.name == 'WeiterIntent') {
        auth.getNextQuestion(callback);
    } else {
        auth.auth_state.checkToAdd();
        handleQuestIntents(intent, callback);
    }
}

/**
 * Beim Start ist nur Aufgabe erlaubt.
 * @param {function} callback Callback
 */
function handleStartIntents(intent, callback) {
    if (intent.name == 'RechenaufgabeIntent') {
          auth.getCalculation(callback);
    } else if (intent.name == 'TestIntent') {
        const speechOutput = 'Es wird nun eine Testreihe von fünf Authentifizierungsversuchen gestartet, '
        + 'in welcher die Erfolgswahrscheinlichkeit und Nutzerfreundlichkeit der Authentifizierung getestet werden soll. '
        + 'Es gibt jeweils einen Rechen, statischen und dynamischen Frageblock. '
        + 'Nach jeder Authentifizierung wird die Anzahl der statischen oder dynamischen Fragen erhöht, '
        + 'um zu ermitteln, was die angenehmste Variante für einen Benutzer ist. '
        + 'Beginnen wir mit dem ersten Durchlauf. Ihre erste Aufgabe lautet, ';
         auth.startTesting(callback, speechOutput);
    } else if (intent.name == 'AbbruchIntent') {
        auth.noWayOut(callback);
    } else {
        alexa.getHelpResponse(callback);
    }
}

/**
 * Nachdem die Authentifizierung erfolgreich abgeschlossen wurde, kann man entweder Fragen hinzufügen oder neustarten.
 * @param {*} intent Intent
 * @param {function} callback Callback
 */
function handleSuccessIntents(intent, callback) {
    if (intent.name == 'AbbruchIntent') {
        auth.noWayOut(callback);
    } else if (intent.name == 'AntwortAendern') {
        // TODO
    } else if (intent.name == 'FrageHinzufuegen') {
        auth.addQuestion(callback);
    } else if (intent.name == 'Reset') {
        auth.resetState(callback);
    } else {
        auth.wrongIntent(callback);
    }
}

/**
 * Nachdem eine Frage gestellt wurde, sollte sie mit einer passenden Antwort beantwortet werden.
 * @param {*} intent Intent
 * @param {function} callback Callback
 */
function handleQuestIntents(intent, callback) {
    switch (intent.name) {
        case 'AbbruchIntent':
            auth.noWayOut(callback);
            break;
        case 'AntwortAendern':
            // TODO
            break;
        case 'AppIntent':
            if (debug) fct.printLog('Verstandene App: ' + intent.slots.app.value);
            var answer = intent.slots.app.value;
            if (!answer) fct.printError('verifyApp failed! No app was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'BierIntent':
            if (debug) fct.printLog('Verstandenes Bier: ' + intent.slots.bier.value);
            var answer = intent.slots.bier.value;
            if (!answer) fct.printError('verifyBeer failed! No beer was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'BuchIntent':
            if (debug) fct.printLog('Verstandenes Buch: ' + intent.slots.buch.value);
            var answer = intent.slots.buch.value;
            if (!answer) fct.printError('verifyBook failed! No book was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'CalcIntent':
            auth.verifyCalc(intent, callback);
            break;
        case 'FahrzeugIntent':
            if (debug) fct.printLog('Verstandenes Fahrzeug: ' + intent.slots.auto.value);
            var answer = intent.slots.auto.value;
            if (!answer) fct.printError('verifyVehicle failed! No vehicle was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'ElektronikMarkenIntent':
            var answer = intent.slots.marke.value;
            if (debug) fct.printLog(`City: ${answer}`);
            if (!answer) fct.printError('verifyCellphone failed! No brand was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'FarbeIntent':
            if (debug) fct.printLog('Verstandene Farbe: ' + intent.slots.farbe.value);
            var answer = intent.slots.farbe.value;
            if (!answer) fct.printError('verifyColor failed! No color was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'FestivalIntent':
            if (debug) fct.printLog('Verstandenes Festival: ' + intent.slots.festival.value);
            var answer = intent.slots.festival.value;
            if (!answer) fct.printError('verifyFestival failed! No festival was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'FilmIntent':
            if (debug) fct.printLog(`Movie: ${intent.slots.film.value}`);
            var answer = intent.slots.film.value;
            if (!answer) fct.printError('VerifyMovie failed! No movie was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'FussballIntent':
            if (debug) fct.printLog('Verein: ' + intent.slots.verein.value);
            var answer = intent.slots.verein.value;
            if (!answer) fct.printError('verifySoccer failed! No Soccer-Team was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'GeldsummeIntent':
            auth.verifyMoney(intent, callback);
            break;
        case 'InstrumentIntent':
            if (debug) fct.printLog('Instrument: ' + intent.slots.instrument.value);
            var answer = intent.slots.instrument.value;
            if (!answer) fct.printError('verifyInstrument failed! No instrument was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'InterpretIntent':
            if (debug) fct.printLog('Verstandener Interpret: ' + intent.slots.interpret.value);
            var answer = intent.slots.interpret.value;
            if (!answer) fct.printError('verifyArtist failed! No artist was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'LandIntent':
            if (debug) fct.printLog('Verstandenes Land: ' + intent.slots.landName.value);
            var answer = intent.slots.landName.value;
            if (!answer) fct.printError('verifyLand failed! No land was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'RadiosenderIntent':
            if (debug) fct.printLog(`Radio: ${intent.slots.sender.value}`);
            var answer = intent.slots.sender.value;
            if (!answer) fct.printError('VerifyRadio failed! No radio was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'SportIntent':
            if (debug) fct.printLog(`Sport: ${intent.slots.sport.value}`);
            var answer = intent.slots.sport.value;
            if (!answer) fct.printError('VerifySport failed! No sport was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'SerienIntent':
            if (debug) fct.printLog(`Show: ${intent.slots.serie.value}`);
            var answer = intent.slots.serie.value;
            if (!answer) fct.printError('VerifyShow failed! No show was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'StadtIntent':
            if (debug) fct.printLog(`City: ${intent.slots.stadtName.value}`);
            var answer = intent.slots.stadtName.value;
            if (!answer) fct.printError('VerifyCity failed! No city was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'TierIntent':
            if (debug) fct.printLog(`Tier: ${intent.slots.tier.value}`);
            var answer = intent.slots.tier.value;
            if (!answer) fct.printError('VerifyAnimal failed! No animal was given!');
            auth.verifyAnswer(answer, callback);
            break;
        case 'UnterrichtIntent':
            auth.verifySchoolSubject(intent, callback);
            break;
        case 'VornameIntent':
            if (debug) fct.printLog(`Name: ${intent.slots.name.value}`);
            var answer = intent.slots.name.value;
            if (!answer) fct.printError('VerifyFirstname failed! No name was given!');
            auth.verifyAnswer(answer, callback);
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
        case 'setup':
            handleSetupIntent(intent, callback);
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
            handleQuestIntents(intent, callback);
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
            if (auth.needSetup()) {
                if (auth.getSetupQuestCtr() >= 0) {
                    auth.wrongIntent((sessionAttributes, speechletResponse) => {
                        callback(null, alexa.buildResponse(sessionAttributes, speechletResponse));
                    });
                } else {
                    auth.startSetup((sessionAttributes, speechletResponse) => {
                        callback(null, alexa.buildResponse(sessionAttributes, speechletResponse));
                    });
                }
            } else {
            alexa.onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, alexa.buildResponse(sessionAttributes, speechletResponse));
                });
            }
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
