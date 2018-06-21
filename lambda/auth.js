/**
 * Der Verlauf einer Authentifizierung kann als State-Machine gesehen werden. 
 * Dies soll die Variable alexa_state implementieren.
 * 
 * Docs: https://github.com/jakesgordon/javascript-state-machine
 * 
 * Die aktuelle State-Machine sieht folgendermaßen aus:
 * 
 * 
 *                                      
 *                                                                                                                                                                                
 *  ----- ---                                                          --------                                                                                               
 * |setup|   |                korrekt           korrekt               |getQuest|<---------------------------------------------------
 *  ----- <--                 ctr > 0           ctr > 0                --------                                                     |              
 *   ^ |                         --                --                      ^                                                        |               
 *   | v                        |  v    korrekt   |  v                     |                                                        v               
 *  -----      ------  korrekt  ------  ctr = 0  -------                -------         -----------          ---------          ----------                   
 * |start|--->| calc |-------->|static|-------->|dynamic|------------->|success|<------|checkAnswer|<------>|addAnswer|<-------|checkQuest|                            
 *  -----      ------           ------           -------                -------         -----------          ---------          ----------                   
 *    ^           |               |                 |                    |  |                                                       ^                                     
 *    |           |               |                 |         -----------   v                                                       |                                      
 *    |           |               v                 |        |          --------                                                    |                                      
 *    |           |  falsch     ------   falsch     |        |         |addQuest|<--------------------------------------------------
 *    |           |----------->|failed|<------------         |          --------                                                        
 *    |                          ------                      |                                                                                          
 *    |                            |                         |                                                                                           
 *     ------------------------------------------------------                                                                                         
 *                               reset                                                                                          
 */

'use strict'

var StateMachine = require('./includes/javascript-state-machine');
const alexa = require('./alexa');
const statics = require('./data/statics');
const fct = require('./help-functions');
var questions = require('./data/questions');
// Enum für alle möglichen Features
var Enum = Object.freeze({
    Feature: Object.freeze({ NICHTS : 0, AENDERN : 1, HINZUFUEGEN : 2 })
    });

/* globale Variablen */
// die Thresholds speichern wieviele Fragen der jeweiligen Kategorien beantwortet werden müssen
var statThreshold = statics.STATIC_THRESHOLD;
var dynThreshold = statics.DYNAMIC_THRESHOLD;
// hält die aktuelle Frage 
var currentQuest ={number: '',
                    question: '',
                    answer: '',
                    isStatic: true};
// das letzte was Alexa sagte, sollte es wiederholt werden
var lastSaid = 'Willkommen.';
// 1 = Refresh, 0 = kein Refresh nach Authentifizierung
var useRfrsh = false;
var useRfrshCrt = statics.USE_REFRESH_COUNTER;
const debug = false;
var setup = true;
var authenticated = false;
var featureState = 0;
// for research purpose
var test = false;
var testRun = 1;
var checkTmp;
var setupQuestCtr = -1;
var errorCtr = 0;

var auth_state = new StateMachine({
    init : 'start',
    transitions: [
        { name: 'startToCalc',            from: 'start',       to: 'calc'        },
        { name: 'startToSetup',           from: 'start',       to: 'setup'       },
        { name: 'setupToStart',           from: 'setup',       to: 'start'       },
        { name: 'checkToAdd',             from: 'setup',       to: 'addAnswer'   },
        { name: 'toSetup',                from: 'checkAnswer', to: 'setup'       },
        { name: 'toSetup',                from: 'setup',       to: 'setup'       },
        { name: 'calcToStatic',           from: 'calc',        to: 'static'      },
        { name: 'staticToStatic',         from: 'static',      to: 'static'      },
        { name: 'staticToDynamic',        from: 'static',      to: 'dynamic'     },
        { name: 'dynamicToDynamic',       from: 'dynamic',     to: 'dynamic'     },
        { name: 'dynamicToAddAnswer',     from: 'dynamic',     to: 'addAnswer'   },
        { name: 'dynamicToSuccess',       from: 'dynamic',     to: 'success'     },
        { name: 'answerWrong',            from: 'calc',        to: 'failed'      },
        { name: 'answerWrong',            from: 'static',      to: 'failed'      },
        { name: 'answerWrong',            from: 'dynamic',     to: 'failed'      },
        { name: 'reset',                  from: 'failed',      to: 'start'       },
        { name: 'reset',                  from: 'success',     to: 'start'       },

        { name: 'addToCheck',             from: 'addAnswer',   to: 'checkAnswer' },
        { name: 'checkToAdd',             from: 'checkAnswer', to: 'addAnswer'   },

        { name: 'addQuestion',            from: 'success',     to: 'addQuest'    },
        { name: 'addToCheck',             from: 'addQuest',    to: 'checkQuest'  },
        { name: 'checkToAdd',             from: 'checkQuest',  to: 'addQuest'    },
        { name: 'checkQuestToAddAnswer',  from: 'checkQuest',  to: 'addAnswer'   },

        { name: 'getQuestion',            from: 'success',     to: 'getQuest'    },
        { name: 'getToCheck',             from: 'getQuest',    to: 'checkQuest'  },
        { name: 'checkToGet',             from: 'checkQuest',  to: 'getQuest'    },
        { name: 'checkToGet',             from: 'checkAnswer', to: 'addAnswer'   },

        { name: 'abort',                  from: 'getQuest',    to: 'success'    },
        { name: 'abort',                  from: 'addQuest',    to: 'success'    },
        { name: 'abort',                  from: 'checkQuest',  to: 'success'    },
        { name: 'abort',                  from: 'addAnswer',   to: 'success'    },
        { name: 'abort',                  from: 'checkAnswer', to: 'success'    }
    ]
});

/**
 * Gibt den aktuellen Zustand der State-Machine aus.
 */
function getState() {
    if (debug) fct.printLog(`Current state: ${auth_state.state}.`);
    return auth_state.state;
}

/**
 * Gibt aus, ob der Nutzer authentifiziert ist.
 */
function isAuthenticated() {
    return authenticated;
}

/**
 * Vergleicht ob die Maschine sich im übergebenen Zustand befindet.
 * @param {string} state aktueller Status  
 */
function isInState(state) {
    if (debug) fct.printLog(`IsInState returns: ${auth_state.is(state)}.`);
    return auth_state.is(state);
}

/** 
 * Sind wir beim Setup?
 */
function needSetup() {
    if (setup) {
        return true;
    } else {
        return false;
    }
}

/**
 * Gibt den setupQuestCtr aus.
 */
function getSetupQuestCtr() {
    return setupQuestCtr;
}

/**
 * Fügt eine bestätigte Antwort der Frage hinzu.
 * @param {function} callback Rückgabe 
 * @param {*} intent Intent 
 */
function addAnswer(callback, intent) {
    if (setupQuestCtr < questions.getStaticSize()) {
        questions.setStaticAnswer(setupQuestCtr, checkTmp);
        questions.setStaticUsed(setupQuestCtr, true);
    } else {
        var arrayNumber = setupQuestCtr - questions.getStaticSize();
        questions.setDynamicAnswer(arrayNumber, checkTmp);
        questions.setDynamicUsed(arrayNumber, true);
    }
    getNextQuestion(callback);
}

/**
 * Der Benutzer möchte eine Frage hinzufügen.
 * @param {function} callback Rückgabe
 */
function addQuestion(callback) {
    if (debug) fct.printLog(`addQuestion...`);
    const cardTitle = 'Frage hinzufügen';
    lastSaid = "Nennen Sie mir die Frage, welche Sie hinzufügen möchten.";
    currentQuest.question = lastSaid;
    const shouldEndSession = false;
    featureState = 2;
    auth_state.addQuestion();

    callback({}, alexa.buildSpeechletResponse(cardTitle, lastSaid, lastSaid, shouldEndSession));
}

/**
 * Der Benutzer möchte eine statische Antwort aktualisieren.
 * @param {function} callback Rückgabe-Funktion
 */
function changeAnswer(callback) {
    if (debug) fct.printLog(`changeAnswer...`);
    const cardTitle = `Frage Ändern`;
    const speechOutput = 'Sie wollen also die Antwort auf eine statische Frage ändern. Nennen Sie mir bitte die Frage, deren Antwort sie ändern möchten.';
    lastSaid = 'Nennen Sie mir bitte die Frage, deren Antwort sie ändern möchten.';
    currentQuest.question = lastSaid;
    const shouldEndSession = false;
    featureState = 1;
    auth_state.getQuestion();

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * Gibt die nächste Frage für die Einrichtung aus. 
 * Sobald der Counter über der Summe der Fragen ist, ist die Einrichtung beendet.
 * @param {function} callback Rückgabefunktion 
 */
function getNextQuestion(callback) {
    setupQuestCtr++;
    if (debug) fct.printLog(`Fetching next Question. SetupQuestCtr=${setupQuestCtr}`);
    const cardTitle = 'Hole nächste Frage';
    const shouldEndSession = false;
    auth_state.toSetup();
    if (setupQuestCtr < questions.getStaticSize()) {
        currentQuest.question = questions.getStaticQuestion(setupQuestCtr);
    } else if (setupQuestCtr < (questions.getStaticSize() + questions.getDynamicSize())) {
        currentQuest.question = questions.getDynamicQuestion(setupQuestCtr-questions.getStaticSize());
    } else {
        endSetup(callback);
    }
    const speechOutput = currentQuest.question;
    lastSaid = `Bitte geben Sie mir die Antwort auf die Frage, ${currentQuest.question}.`;
    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * Beendet die Einrichtung.
 * @param {function} callback Rückgabe
 */
function endSetup(callback) {
    fct.printLog('End of Setup.');
    const cardTitle = 'Setup beendet';
    const speechOutput = 'Die Einrichtung ist abgeschlossen. Sie können sich nun mit dem Befehl, Aufgabe, authentifizieren.';
    const shouldEndSession = false;
    setupQuestCtr = -1;
    lastSaid = 'Die Einrichtung ist abgeschlossen.';
    resetCurrentQuestion();
    setup = false;

    auth_state.setupToStart();
    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * Fragt den Benutzer seine Antwort zu verifizieren.
 * @param {string} input Benutzereingabe
 * @param {function} callback Rückgabefunktion
 */
function checkInput(input, callback) {
    const cardTitle = 'Check Input';
    if (debug || test) fct.printLog(`checkInput-Input is ${input}.`);
    lastSaid = `Sie sagten ${input}, Ist das richtig?`;
    checkTmp = input;
    const shouldEndSession = false;

    auth_state.addToCheck();
    callback({}, alexa.buildSpeechletResponse(cardTitle, lastSaid, lastSaid, shouldEndSession));
}

/**
 * Alexa hat den Benutzer richtig verstanden. Die dynamische Antwort darf aktualisiert werden.
 * @param {function} callback Rückgabefunktion
 */
function endAddAnswer(callback) {
    if (debug) fct.printLog('endAddAnswer');
    const cardTitle = 'Antwort akzeptiert';
    var speechOutput = `Die Antwort auf die Frage wurde akzeptiert. Die Authentifizierung ist abgeschlossen.`;
    lastSaid = `Die Authentifizierung ist beendet.`;
    const shouldEndSession = false;
    currentQuest.answer = checkTmp;
    if (currentQuest.isStatic) {
        questions.changeStaticQuestions(currentQuest.number, currentQuest.question, currentQuest.answer);
    } else {
        questions.setDynamicAnswer(currentQuest.number, currentQuest.answer);
    }
    featureState = 0;
    auth_state.abort();
    resetCurrentQuestion();


    if (test) onAuthenticated(callback);

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * Alexa hat den Benutzer richtig verstanden. Die dynamische Antwort darf aktualisiert werden.
 * @param {function} callback Rückgabefunktion
 */
function endAddQuest(callback) {
    if (debug) fct.printLog('endAddQuest');
    if (currentQuest.number == -1) currentQuest.number = questions.getStaticSize();
    currentQuest.question = checkTmp;
    currentQuest.isStatic = true;
    const cardTitle = 'Frage akzeptiert';
    var speechOutput = `Die Frage wurde akzeptiert. Bitte geben Sie mir nun die Antwort auf die Frage, ${currentQuest.question}.`;
    lastSaid = `Bitte geben Sie mir die Antwort auf die Frage, ${currentQuest.question}.`;
    const shouldEndSession = false;
    auth_state.checkQuestToAddAnswer();

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * Stellt dem Benutzer eine simple Additions-Aufgabe.
 * @param {function} callback Rückgabefunktion 
 */
function getCalculation(callback) {
    if (debug) fct.printLog(`getCalculation...`);
    statThreshold = statics.getStaticThreshold();
    dynThreshold = statics.getDynamicThreshold();
    var summandA = Math.floor(Math.random() * 20);
    var summandB = Math.floor(Math.random() * 20);
    if (debug || test) fct.printLog(`Question: ${summandA} + ${summandB} = ${summandA+summandB}`);

    const cardTitle = 'Aufgabe gestellt';
    currentQuest.question = `Was ist ${summandA} plus ${summandB}?`;
    lastSaid = `Lösen Sie bitte die Aufgabe ${summandA} plus ${summandB}.`;
    const shouldEndSession = false;

    currentQuest.answer = summandA + summandB;
    currentQuest.isStatic = true;
    auth_state.startToCalc();

    callback({}, alexa.buildSpeechletResponse(cardTitle, currentQuest.question, lastSaid, shouldEndSession));
}

/**
 * Stellt dem Benutzer eine Frage.
 * @param {function} callback Rückgabefunktion
 */
function getDynamicQuestion(callback) {
    if (debug) fct.printLog(`getDynamicQuestion...`);
    const cardTitle = 'Frage gestellt';
    currentQuest.number = Math.floor(Math.random() * questions.getDynamicSize());
    while (!questions.isDynamicUsed(currentQuest.number) || (currentQuest.question == questions.getDynamicQuestion(currentQuest.number))) {
        currentQuest.number = Math.floor(Math.random() * questions.getDynamicSize());
    }
    currentQuest.question = questions.getDynamicQuestion(currentQuest.number);
    currentQuest.answer = questions.getDynamicAnswer(currentQuest.number);
    currentQuest.isStatic = false;
    const speechOutput = currentQuest.question;
    lastSaid = `Bitte geben Sie mir die Antwort auf die Frage, ${currentQuest.question}.`;
    if (debug || test) fct.printLog(`[${currentQuest.number}]: ${currentQuest.question} -${currentQuest.answer}.`);
    const shouldEndSession = false;
    fct.printLog(`Authentication is in state ${auth_state.state}. CurrentQuestNr=${currentQuest.number}.`);

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * getHelpResponse wird ausgeführt, wenn der Benutzer Hilfe benötigt.
 * @param {function} callback Rückgabe an die App
 */
function getHelpResponse(callback) {
    const cardTitle = 'Hilfe';
    const shouldEndSession = false;
    var speechOutput = 'Hilfe';
    if (isInState('start')) {
        speechOutput = 'Sie sollten sich authentifizieren. Starten Sie mit dem Befehl, Aufgabe.';
        lastSaid = 'Wollen sie sich nicht authentifizieren?';
    } else if (isInState('success')) {
        speechOutput = 'Sie haben sich bereits erfolgreich authentifiziert. '
        + 'Nun können Sie mit dem Befehl, lass mich eine Frage hinzufügen, eine neue statische Frage hinzufügen. '
        + 'Falls sich Ihre Antwort einer statischen Frage geändert hat, können Sie diese mit dem Befehl, Lass mich die Antwort einer statischen Frage ändern, aktualisieren.';
        lastSaid = 'Sie haben sich bereits erfolgreich authentifiziert.';
    } else {
        wrongIntent(callback);
    }
    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * Ermittelt abhängig vom Zustand (static, dynamic) und den aktuellen Thresholds den nächsten Zustand der Zustandsmaschine.
 * @param {function} callback Rückgabefunktion
 */
function getNextState(callback) {
    if (debug) fct.printLog(`Getting next state. \nCurrent state is: ${auth_state.state}. \nstatThr: ${statThreshold} \ndynThr: ${dynThreshold}`);
    if (isInState('static')) {
        statThreshold--;
        if (statThreshold > 0) {
            auth_state.staticToStatic();
            getStaticQuestion(callback);
        } else {
            auth_state.staticToDynamic();
            getDynamicQuestion(callback);
        }
    } else {
        dynThreshold--;
        if (dynThreshold > 0) {
            auth_state.dynamicToDynamic();
            getDynamicQuestion(callback);
        } else {
            if (useRfrshCrt < 2) useRfrsh = true; 
            if (useRfrsh) {
                auth_state.dynamicToAddAnswer();
                useRfrshCrt = statics.getUseRefreshCounter();
                useRfrsh = false;
                startDynamicRefresh(callback);
            } else {
                useRfrshCrt--;
                auth_state.dynamicToSuccess();
                onAuthenticated(callback);
            }
        }
    }
}

/**
 * Stellt dem Benutzer eine Frage.
 * @param {function} callback Rückgabefunktion
 */
function getStaticQuestion(callback) {
    if (debug) fct.printLog(`getStaticQuestion...`);
    const cardTitle = 'Frage gestellt';
    currentQuest.number = Math.floor(Math.random() * questions.getStaticSize());
    while (!questions.isStaticUsed(currentQuest.number) || (currentQuest.question == questions.getStaticQuestion(currentQuest.number))) {
        currentQuest.number = Math.floor(Math.random() * questions.getStaticSize());
    }
    currentQuest.question = questions.getStaticQuestion(currentQuest.number);
    currentQuest.answer = questions.getStaticAnswer(currentQuest.number);
    currentQuest.isStatic = true;
    const speechOutput = currentQuest.question;
    lastSaid = `Bitte geben Sie mir die Antwort auf die Frage, ${currentQuest.question}.`;
    if (debug || test) fct.printLog(`[${currentQuest.number}]: ${currentQuest.question} -${currentQuest.answer}.`);
    const shouldEndSession = false;
    fct.printLog(`Authentication is in state ${auth_state.state}. CurrentQuestNr=${currentQuest.number}.`);

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * Der Benutzer ist bereits authentifiziert.
 * @param {function} callback Rückgabefunktion
 */
function onAuthenticated(callback) {
    if (debug) fct.printLog(`Got in onAuthenticated. testRun=${testRun}`);
    const cardTitle = 'Authentication done.';
    const speechOutput = 'Die Authentifizierung war erfolgreich. Sie können nun die Befehle, Lass mich eine Frage hinzufügen, oder, Lass mich die Antwort einer statischen Frage ändern, benutzen.';
    lastSaid = 'Die Authentifizierung war erfolgreich.';
    var shouldEndSession = false;
    authenticated = true;
    resetCurrentQuestion();

    if (testRun > 4) {
        const speechOutput = 'Der Authentifizierungsversuch ist zu Ende. '
        + 'Die Testreihe endet hiermit. Ich danke Ihnen für die Teilnahme. Fahren Sie nun fort mit dem Befehl, Aufgabe.';
        lastSaid = 'Fahren Sie nun fort mit dem Befehl, Aufgabe.';
        fct.printLog(`Number of Errors: ${errorCtr}.`);
        test = false;
        errorCtr = 0;
        useRfrshCrt = statics.USE_REFRESH_COUNTER;
        statics.resetStaticThreshold();
        statics.resetDynamicThreshold();
        if (debug) fct.printLog('End of Testing.');
        auth_state.reset();
        testRun = 1;
        callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
    }

    if (test) {
        (testRun%2 == 1) ? statics.increaseStaticThreshold() : statics.increaseDynamicThreshold() ;
        testRun++;
        statThreshold = statics.getStaticThreshold();
        dynThreshold = statics.getDynamicThreshold();
        var ordinal = fct.numberToOrdinal(testRun);
        if (debug) fct.printLog(`testRun: ${testRun}, ordinal: ${ordinal}, statThreshold: ${statThreshold}, dynThreshold: ${dynThreshold}`);
        const speechOutput = `Der Authentifizierungsversuch war erfolgreich. Wir beginnen mit dem ${ordinal} Testfall. `
            + `Nun sind es ${statThreshold} statische und ${dynThreshold} dynamische Fragen. `;

        auth_state.reset();
        startTesting(callback, speechOutput);
    }

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * Der Benutzer hat versagt.
 * @param {function} callback Rückgabefunktion
 */
function onFailed(callback) {
    if (debug) fct.printLog(`Got in onFailed. testRun=${testRun}`);
    const cardTitle = 'Authentication failed.';
    lastSaid = 'Die Authentifizierung ist leider fehlgeschlagen.';
    const repromptText = `Auf Wiedersehen.`;
    var shouldEndSession = false;

    callback({}, alexa.buildSpeechletResponse(cardTitle, lastSaid, repromptText, shouldEndSession));
}

/**
 * Alexa hat den Benuzer falsch verstanden. Die Antwort muss wiederholt werden.
 * @param {function} callback Rückgabefunktion
 */
function reprompt(callback) {
    if (debug) fct.printLog(`Reprompt...FeatureState = ${featureState}.`);
    const cardTitle = 'Frage wiederholen';    
    const shouldEndSession = false;
    lastSaid = `Bitte geben Sie mir die Antwort auf die Frage, ${currentQuest.question}.`;
    switch (featureState) {
        case Enum.Feature.NICHTS:
            if (debug) fct.printLog('Going from checkQuest to addQuest...');
            auth_state.checkToAdd();
            break;
        case Enum.Feature.AENDERN:
            if (debug) fct.printLog('Going from checkQuest to getQuest...');
            auth_state.checkToGet();
            break;
        case Enum.Feature.HINZUFUEGEN:
            if (debug) fct.printLog('Going from checkQuest to addQuest...');
            auth_state.checkToAdd();
            break;
        default:
    }

    callback({}, alexa.buildSpeechletResponse(cardTitle, currentQuest.question, lastSaid, shouldEndSession));
}

/**
 * Setzt die Authentifizierung zurück.
 * @param {function} callback Rückgabefunktion
 */
function resetState(callback) {
    if (debug) fct.printLog(`Got in resetState.`);
    const cardTitle = 'Authentication reset.';
    const speechOutput = 'Die Authentifizierung ist im Zustand start.';
    lastSaid = `Fragen Sie nach einer Aufgabe.`;
    const shouldEndSession = false;
    authenticated = false;
    auth_state.reset();

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * Fragt den Benutzer die Antwort einer der dynamischen Fragen zu aktualisieren.
 * @param {function} callback Rückgabefunktion
 */
function startDynamicRefresh(callback) {
    if (debug) fct.printLog(`startDynamicRefresh...`);
    currentQuest.number = Math.floor(Math.random() * questions.getDynamicSize());
    while (!questions.isDynamicUsed(currentQuest.number)) {
        currentQuest.number = Math.floor(Math.random() * questions.getDynamicSize());
    }
    currentQuest.question = questions.getDynamicQuestion(currentQuest.number);
    currentQuest.answer = questions.getDynamicAnswer(currentQuest.number);
    currentQuest.isStatic = false;
    if (debug) fct.printLog(`[${currentQuest.number}]: ${currentQuest.question} -${currentQuest.answer}.`);

    const cardTitle = 'Dynamische Antwort aktualisieren';
    var speechOutput = `Die Authentifizierung war erfolgreich. Ich muss die Antwort einer dynamischen Frage aktualisieren.
                        Bitte geben Sie mir die aktuelle Antwort auf die Frage, ${currentQuest.question}.`;
    lastSaid = `Bitte geben Sie mir die Antwort auf die Frage, ${currentQuest.question}.`;
    const shouldEndSession = false;

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * Startet den Setup der Applikation.
 * @param {function} callback Rückgabefunktion
 */
function startSetup(callback) {
    if (debug) fct.printLog('Starting to setup a question.');
    setupQuestCtr = 0;
    const cardTitle = 'Starte Setup';
    const shouldEndSession = false;
    currentQuest.question = questions.getStaticQuestion(setupQuestCtr);
    currentQuest.isStatic = true;
    const speechOutput = 'Willkommen. Ihre Authentifizierungsfragen müssen erst eingerichtet werden. '
            + 'Ich werde Ihnen alle Fragen nun aufzählen. '
            + 'Beantworten Sie bitte die Frage, falls Sie diese für die Authentifizierung verwenden möchten. '
            + 'Andernfalls sagen Sie, nächste, oder, weiter, um die Frage zu überspringen. '
            + 'Sie sollten mindestens zwei Fragen jeder Kategorie wählen. '
            + 'Die erste Frage ist. '
            + currentQuest.question;
    lastSaid = `Die erste Frage ist. ${currentQuest.question}.`;
    auth_state.startToSetup();
    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * Startet die Authentifizierungsreihe.
 * @param {function} callback Rückgabefunktion
 * @param {string} speechOutput Ausgabe, welche den letzten Durchgang beschreiben soll
 */
function startTesting(callback, speechOutput) {
    if (debug) fct.printLog('Starting Test-Phase...');
    if(!test) testRun = 1;
    test = true;
    fct.printLog('Starting test...');
    const cardTitle = 'Test Anfang';
    const shouldEndSession = false;

    statThreshold = statics.getStaticThreshold();
    dynThreshold = statics.getDynamicThreshold();
    var summandA = Math.floor(Math.random() * 20);
    var summandB = Math.floor(Math.random() * 20);
    if (debug) fct.printLog(`Question: ${summandA} + ${summandB} = ${summandA+summandB}`);
    currentQuest.question = `Was ist ${summandA} plus ${summandB}?`;
    lastSaid = `Lösen Sie bitte die Aufgabe ${summandA} plus ${summandB}.`;
    speechOutput += currentQuest.question;
    currentQuest.answer = summandA + summandB;
    currentQuest.isStatic = true;
    auth_state.startToCalc();

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * Überprüft, ob der übergebene Text mit der aktuellen Antwort übereinstimmt.
 * @param {string} answer Antwort des Benutzers
 * @param {function} callback Rückgabefunktion
 */
function verifyAnswer(answer, callback) {
    if (debug || test) fct.printLog('Type: ' + (typeof answer) + ', answer= ' + answer);
    if (isInState('addAnswer')) {
        checkInput(answer, callback);
    } else if (isInState('addQuest')) {
        checkInput(answer, callback);
    } else if (isInState('getQuest')) {
        verifyQuestion(answer, callback);
    } else {
        if (typeof answer == 'number') {
            if ((test) || (answer == currentQuest.answer)) {
                if (answer != currentQuest.answer) {
                    errorCtr++;
                    fct.printLog(`Wrong Answer!!! Answer was: ${answer}, but it should have been: ${currentQuest.answer}!!! ErrorCtr = ${errorCtr}.`);
                }
                auth_state.calcToStatic();
                getStaticQuestion(callback);
            } else {
                auth_state.answerWrong();
                onFailed(callback);
            }
        } else {
            if ((test) || (answer.toLowerCase() == currentQuest.answer.toLowerCase())) {
                if (answer != currentQuest.answer) {
                    errorCtr++;
                    fct.printLog(`Wrong Answer!!! Answer was: ${answer}, but it should have been: ${currentQuest.answer}!!! ErrorCtr = ${errorCtr}.`);
                }
                getNextState(callback);
            } else {
                auth_state.answerWrong();
                onFailed(callback);
            }
        }
    }
}

/**
 * Verifiziert die Rechenantwort. 
 * Trat beim Argument ein Fehler auf wird eine Antwort ausgegeben.
 * War die Antwort richtig, wird mit einer statischen Frage weiterverfahren.
 * War die Antwort falsch, wird die Authentifizierung abgebrochen.
 * @param {*} intent 
 * @param {function} callback Rückgabefunktion
 */
function verifyCalc(intent, callback) {
    if (debug) fct.printLog(`verifyCalc...\nIntent: ${intent}`);
    var result;
    (intent.name == 'CalcIntent') ? result = fct.wordToNumber(intent.slots.zahl.value) : result = intent.slots.erste.value;
    if (auth_state.state == 'calc') {
        if (!result) fct.printError('verifyCalc failed! No number was given!');
        if ((test) || (result == currentQuest.answer)) {
            if (result != currentQuest.answer) fct.printLog(`Wrong Answer!!! Answer was: ${result}, but it should have been: ${currentQuest.answer}!!!`);
            auth_state.calcToStatic();
            getStaticQuestion(callback);
        } else {
            auth_state.answerWrong();
            onFailed(callback);
        }
    } else {
        verifyAnswer(result, callback);
    }
}

/**
 * Eine Auswertung eines Geldbetrages.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifyMoney(intent, callback) {
    if (debug) fct.printLog(`Geldmenge: ${intent.slots.euro.value},${intent.slots.cent.value} €.`);
    var amountEuro = intent.slots.euro.value;
    var amountCent = intent.slots.cent.value;
    if (!amountEuro && !amountCent) fct.printError('verifyMoneyAnswer failed.');

    var answer = fct.formatMoneyAmount(amountEuro, amountCent);

    verifyAnswer(answer, callback);
}

/**
 * Überprüft die übergebene Zahl.
 * @param {*} intent der Intent der Anfrage 
 * @param {function} callback Rückgabefunktion
 */
function verifyNumber(intent, callback) {
    var answer = '';
    if (intent.name == 'CalcIntent') {
        answer = intent.slots.zahl.value;
        verifyAnswer(answer, callback);
    } else {
        if (!intent.slots.erste) fct.printError('verifyNumber failed! No number was given!');
        if (intent.slots.erste && intent.slots.erste.value) answer += `${intent.slots.erste.value}`;
        if (intent.slots.zweite && intent.slots.zweite.value) answer += `${intent.slots.zweite.value}`;
        if (intent.slots.dritte && intent.slots.dritte.value) answer += `${intent.slots.dritte.value}`;
        if (intent.slots.vierte && intent.slots.vierte.value) answer += `${intent.slots.vierte.value}`;
        if (intent.slots.fuenfte && intent.slots.fuenfte.value) answer += `${intent.slots.fuenfte.value}`;
        if (debug) fct.printLog(`Number: ${answer}`);
        
        verifyAnswer(answer, callback);
    }
}

/**
 * Der Benutzer hat die Frage genannt, jetzt muss eine Frage in der Datenbank gefunden werden, welcher der Frage entspricht.
 * @param {string} answer Frage des Benutzers
 * @param {function} callback Rückgabefunktion 
 */
function verifyQuestion(answer, callback) {
    if (debug) fct.printLog(`User gave question: ${answer}.`);
    const cardTitle = 'Überprüfe Frage';
    currentQuest.number = questions.searchQuestion(answer);
    currentQuest.isStatic = true;
    checkTmp = questions.getStaticQuestion(currentQuest.number);
    const speechOutput = `Ihre Frage lautete, ${answer}. Die naheliegendste Frage der Datenbank ist, ${checkTmp}. Wollen Sie die Antwort dieser Frage ändern?`;
    lastSaid = `Wollen Sie die aktuelle Antwort der Frage ${checkTmp} ändern?`;
    const shouldEndSession = false;
    auth_state.getToCheck();

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * Dem Benutzer sollte die Freiheit gelassen werden, Eingaben von Fragen oder Antworten abbrechen zu dürfen.
 * @param {function} callback Rückgabefunktion
 */
function abort(callback) {
    if (debug) fct.printLog(`Aborting. User was in state ${auth_state.state}. Going to state success.`);
    const cardTitle = 'Abort';
    const speechOutput = 'Ich breche den Vorgang für sie ab.';
    lastSaid = 'Der Vorgang wurde abgebrochen.';
    const shouldEndSession = false;
    featureState = 0;
    auth_state.abort();
    resetCurrentQuestion();

    callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, lastSaid, shouldEndSession));
}

/**
 * Sollte der Benutzer in einem Zustand Antworten ändern wollen, in welchen er es nicht darf,
 * wird ihm das gesagt.
 * @param {function} callback Rückgabe
 */
function noChanging(callback) {
    if (debug) fct.printLog(`You cannot change answers in state ${auth_state.state}.`);
     const cardTitle = 'No Changing';
     const speechOutput = 'Sie können gerade keine statischen Antworten ändern.';
     const shouldEndSession = false;

     callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, speechOutput, shouldEndSession));
}

/**
 * Sollte der Benutzer in einem Zustand abbrechen, in welchem nicht abgebrochen werden kann.
 * @param {function} callback Rückgabe
 */
function noWayOut(callback) {
    if (debug) fct.printLog(`There is no way out of state ${auth_state.state}.`);
     const cardTitle = 'No Way Out';
     const speechOutput = 'Sie können nicht abbrechen.';
     const shouldEndSession = false;

     callback({}, alexa.buildSpeechletResponse(cardTitle, speechOutput, speechOutput, shouldEndSession));
}

/**
 * Nach dem Hinzufügen einer Frage oder Antwort, wird die aktuelle Frage geleert.
 */
function resetCurrentQuestion() {
    currentQuest.number = -1;
    currentQuest.question = '';
    currentQuest.answer = '';
    currentQuest.isStatic = true;
}

/**
 * Sollte ein Intent eingehen, welcher nicht dem aktuellen Zustand der State-Machine entspricht,
 * wird das zuletzt gesagte wiederholt.
 * @param {function} callback Rückgabefunktion
 */
function wrongIntent(callback) {
    if (debug) fct.printLog(`Got in wrongIntent. Current state is: ${auth_state.state}.`);
    const cardTitle = 'Falscher Intent';
    const shouldEndSession = false;
    callback({}, alexa.buildSpeechletResponse(cardTitle, lastSaid, lastSaid, shouldEndSession));
}


module.exports = {auth_state,
                getState,
                isAuthenticated,
                isInState,
                needSetup,
                addAnswer,
                addQuestion,
                changeAnswer,
                endAddAnswer,
                endAddQuest,
                getCalculation,
                getHelpResponse,
                getNextQuestion,
                getSetupQuestCtr,
                onAuthenticated,
                onFailed,
                reprompt,
                resetState,
                startSetup,
                startTesting,
                verifyAnswer,
                verifyCalc,
                verifyMoney,
                verifyNumber,
                abort,
                noChanging,
                noWayOut,
                wrongIntent};
