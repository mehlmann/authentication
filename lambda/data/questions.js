'use strict';

const Https = require('https');
const fct = require('../help-functions');

/**
 * Eine Sammlung von statischen Fragen und den dazugehörigen Antworten.
 */
var staticQuestions = [
    {//0
        question: 'was ist ihre lieblingsfarbe?',
        answer: 'blau',
        use: 0
    },
    {//1
        question: 'In welcher stadt wohnen sie?' ,
        answer: 'wörth am rhein',
        use: 0
    },
    {//2
        question: 'in welcher stadt wurden sie geboren?',
        answer: 'erfurt',
        use: 0
    },
    {//3
        question: 'wie ist ihre schuhgröße?',
        answer: '42',
        use: 0
    },
    {//4
        question: 'wie ist ihre körpergröße in zentimetern?',
        answer: '',
        use: 0
    },
    {//5
        question: 'Von welcher Marke ist Ihr Handy?',
        answer: '',
        use: 0
    },
    {//6
        question: 'In welcher Hausnummer wohnen Sie?' ,
        answer: '',
        use: 0
    },
    {//7
        question: 'Was war Ihr erstes Haustier?',
        answer: '',
        use: 0
    },
    {//8
        question: 'Was war Ihr letztes Haustier?',
        answer: '',
        use: 0
    },
    {//9
        question: 'Was ist Ihr Lieblingsbuch?',
        answer: '',
        use: 0
    },
    {//10
        question: 'Was ist Ihr Lieblingsfilm?',
        answer: '',
        use: 0
    },
    {//11
        question: 'Was war Ihr Lieblingsfach in der Schule?',
        answer: '',
        use: 0
    },
    {//12
        question: 'Welches Fach mochten Sie am wenigsten in der Schule?',
        answer: '',
        use: 0
    },
    {//13
        question: 'Was ist Ihr Lieblingssport?',
        answer: '',
        use: 0
    },
    {//14
        question: 'Wie war der Vorname des Vaters ihres Vaters?',
        answer: '',
        use: 0
    },
    {//15
        question: 'Wie war der Vorname der Mutter Ihrer Mutter?',
        answer: '',
        use: 0
    },
    {//16
        question: 'Von welcher Marke ist Ihr Auto?',
        answer: '',
        use: 0
    },
    {//17
        question: 'Welche Marke hatte ihr erstes Auto?',
        answer: '',
        use: 0
    },
    {//18
        question: 'Wie war der Name Ihres ersten Freundes oder ihrer ersten Freundin?',
        answer: '',
        use: 0
    },
    {//19
        question: 'Was ist Ihr Lieblingsurlaubsland?',
        answer: '',
        use: 0
    },
    {//20
        question: 'Von welcher Marke ist Ihr Laptop?',
        answer: '',
        use: 0
    },
    {//21
        question: 'Von welcher Marke ist Ihr Tablet?',
        answer: 'samsung',
        use: 0
    },
    {//22
        question: 'Was war ihr erstes Musikinstrument?',
        answer: '',
        use: 0
    },
    {//23
        question: 'Welches Bier trinken Sie am liebsten?',
        answer: '',
        use: 0
    },
    {//24
        question: 'Was ist Ihre Lieblingsserie?',
        answer: '',
        use: 0
    },
    {//25
        question: 'Wie lautet Ihr Lieblingsinterpret?',
        answer: '',
        use: 0
    },
    {//26
        question: 'was ist die letzte ziffer ihrer handynummer?',
        answer: '',
        use: 0
    }
];

/**
 * Eine Sammlung von dynamischen Fragen und den dazugehörigen Antworten.
 */
var dynamicQuestions = [
    {//0
        question: 'Wieviel Geld in vollen Euro haben sie beim letzten Amazon Kauf ausgegeben?',
        answer: '20,00€',
        use: 0
    },
    {//1
        question: 'Wie hoch war Ihre letzte PayPal-Überweisung in vollen Euro?',
        answer: '20,00€',
        use: 0
    },
    {//2
        question: 'Welches Festival oder Konzert haben Sie zuletzt besucht?',
        answer: 'rock am ring',
        use: 0
    },
    {//3
        question: 'Welchen Film haben Sie zuletzt gesehen?',
        answer: 'Die Verurteilten',
        use: 0
    },
    {//4
        question: 'Welche Serie haben Sie zuletzt gesehen?',
        answer: 'Malcolm mittendrin',
        use: 0
    },
    {//5
        question: 'Welchen Radiosender haben Sie zuletzt gehört?',
        answer: '',
        use: 0
    },
    {//6
        question: 'Was war die zuletzt installierte App auf Ihrem Smartphone?',
        answer: '',
        use: 0
    },
    {//7
        question: 'Was war die zuletzt installierte App auf Ihrem Tablet?',
        answer: '',
        use: 0
    },
    {//10
        question: 'Was war das letzte Buch, welches Sie gelesen haben?',
        answer: 'zeit der krähen',
        use: 0
    },
    {//9
        question: 'Was haben Sie zuletzt über Amazon bestellt?',
        answer: '',
        use: 0
    }
];

/**
 * Gibt die statische Frage an arrayNumber-Stelle aus.
 * @param {int} arrayNumber Nummerierung der Frage
 */
function getStaticQuestion(arrayNumber) {
    if (arrayNumber < 0 || arrayNumber >= staticQuestions.length) {
        fct.printError(`getStaticQuestion, Array out of bound: ${arrayNumber}.`);
        return '';
    }
    return staticQuestions[arrayNumber].question;
}

/**
 * Gibt die dynamische Frage an arrayNumber-Stelle aus.
 * @param {int} arrayNumber Nummerierung der Frage
 */
function getDynamicQuestion(arrayNumber) {
    if (arrayNumber < 0 || arrayNumber >= dynamicQuestions.length) {
        fct.printError(`getDynamicQuestion, Array out of bound: ${arrayNumber}.`);
        return '';
    }
    return dynamicQuestions[arrayNumber].question;
}

/**
 * Gibt die statische Antwort an arrayNumber-Stelle aus.
 * @param {int} arrayNumber Nummerierung der Frage
 */
function getStaticAnswer(arrayNumber) {
    if (arrayNumber < 0 || arrayNumber >= staticQuestions.length) {
        fct.printError(`getStaticAnswer, Array out of bound: ${arrayNumber}.`);
        return '';
    }
    return staticQuestions[arrayNumber].answer;
}

/**
 * Gibt die dynamische Antwort an arrayNumber-Stelle aus.
 * @param {int} arrayNumber Nummerierung der Frage
 */
function getDynamicAnswer(arrayNumber) {
    if (arrayNumber < 0 || arrayNumber >= dynamicQuestions.length) {
        fct.printError(`getDynamicAnswer, Array out of bound: ${arrayNumber}.`);
        return '';
    }
    return dynamicQuestions[arrayNumber].answer;
}

/**
 * Schreibt in arrayNumber der statischen Fragen die neu Antwort hinein.
 * @param {int} arrayNumber Nummerierung der Frage
 * @param {string} newAnswer neue Antwort
 */
function setStaticAnswer(arrayNumber, newAnswer) {
    if (arrayNumber < 0 || arrayNumber >= staticQuestions.length) {
        fct.printError(`setStaticAnswer, Array out of bound: ${arrayNumber}.`);
        return;
    }
    staticQuestions[arrayNumber].answer = newAnswer;
}

/**
 * Schreibt in arrayNumber der dynamischen Fragen die neu Antwort hinein.
 * @param {int} arrayNumber Nummerierung der Frage
 * @param {string} newAnswer neue Antwort
 */
function setDynamicAnswer(arrayNumber, newAnswer) {
    if (arrayNumber < 0 || arrayNumber >= dynamicQuestions.length) {
        fct.printError(`setDynamicAnswer, Array out of bound: ${arrayNumber}.`);
        return;
    }
    dynamicQuestions[arrayNumber].answer = newAnswer;
}

/**
 * Fügt den statischen Fragen eine neue Frage hinzu.
 * @param {string} newQuestion neue Frage
 * @param {string} newAnswer neue Antwort
 */
function addStaticQuestion(newQuestion, newAnswer) {
    staticQuestions.push({question: newQuestion, answer: newAnswer, use: 1});
}

/**
 * Gibt die Anzahl an statischen Fragen aus.
 */
function getStaticSize() {
    return staticQuestions.length;
}

/** 
 * Gibt die Anzahl an dynamischen Fragen aus.
 */
function getDynamicSize() {
    return dynamicQuestions.length;
}

/**
 * Gibt aus, ob eine statische Frage benutzt wird.
 * @param {int} arrayNumber Nummer der Frage
 */
function isStaticUsed(arrayNumber) {
    if (arrayNumber < 0 || arrayNumber >= staticQuestions.length) {
        fct.printError(`isStaticUsed, Array out of bound: ${arrayNumber}.`);
        return 0;
    }
    return staticQuestions[arrayNumber].use;
}

/**
 * Setzt, ob eine statische Frage benutzet werden soll.
 * @param {int} arrayNumber Nummer der Frage
 * @param {int} used wird die Frage benutzt? 
 */
function setStaticUsed(arrayNumber, used) {
    if (arrayNumber < 0 || arrayNumber >= staticQuestions.length) {
        fct.printError(`setStaticUsed, Array out of bound: ${arrayNumber}.`);
        return;
    }
    (used) ? staticQuestions[arrayNumber].use = 1 : staticQuestions[arrayNumber].use = 0;
}

/**
 * Gibt aus, ob eine dynamische Frage benutzt wird.
 * @param {int} arrayNumber Nummer der Frage
 */
function isDynamicUsed(arrayNumber) {
    if (arrayNumber < 0 || arrayNumber >= dynamicQuestions.length) {
        fct.printError(`isDynamicUsed, Array out of bound: ${arrayNumber}.`);
        return 0;
    }
    return dynamicQuestions[arrayNumber].use;
}

/**
 * Setzt, ob eine dynamische Frage benutzet werden soll.
 * @param {int} arrayNumber Nummer der Frage
 * @param {int} used wird die Frage benutzt? 
 */
function setDynamicUsed(arrayNumber, used) {
    if (arrayNumber < 0 || arrayNumber >= dynamicQuestions.length) {
        fct.printError(`setDynamicUsed, Array out of bound: ${arrayNumber}.`);
        return;
    }
    (used) ? dynamicQuestions[arrayNumber].use = 1 : dynamicQuestions[arrayNumber].use = 0;
}

/**
 * Überprüft, welche statische Frage der übergebenen Frage am ähnlichsten ist.
 * Beide Strings werden gesplittet und die Wörter anschließend einzeln verglichen.
 * @param {string} quest übergebene Frage
 */
function compareStaticQuestion(quest) {
    var splitted = quest.split(" ");
    var bestCtr = 0;
    var bestI = 0;
    for (var i = 0; i < staticQuestions.length(); i++) {
        var tmp = staticQuestions[i].question.split(" ");
        var compareCtr = 0;
        for (var j = 0; j < splitted.length(); j++) {
            for (var k = 0; k < tmp.length(); k++) {
                if (splitted[j].toLowerCase() == tmp[k].toLowerCase()) {
                    compareCtr++;
                }
            }
        }
        if (bestCtr < compareCtr) {
            bestCtr = compareCtr;
            bestI = i;
        }
    }
}

/**
 * Diese Funktion soll alle möglichen dynamischen Antworten füllen.
 * @param {*} sys 
 */
function initAnswers(sys) {
    initPLZ(sys);
}

/**
 * This is a small wrapper client for the Alexa Address API.
 */
class AlexaDeviceAddressClient {

    /**
     * Retrieve an instance of the Address API client.
     * @param apiEndpoint the endpoint of the Alexa APIs.
     * @param deviceId the device ID being targeted.
     * @param consentToken valid consent token.
     */
    constructor(apiEndpoint, deviceId, consentToken) {
        this.deviceId = deviceId;
        this.consentToken = consentToken;
        this.endpoint = apiEndpoint.replace(/^https?:\/\//i, "");
    }

    /**
     * This will make a request to the Address API using the device ID and
     * consent token provided when the Address Client was initialized.
     * This will retrieve the full address of a device.
     * @return {Promise} promise for the request in flight.
     */
    getFullAddress() {
        const options = this.__getRequestOptions(`/v1/devices/${this.deviceId}/settings/address`);

        return new Promise((fulfill, reject) => {
            this.__handleDeviceAddressApiRequest(options, fulfill, reject);
        });
    }

    /**
     * This will make a request to the Address API using the device ID and
     * consent token provided when the Address Client was initialized.
     * This will retrieve the country and postal code of a device.
     * @return {Promise} promise for the request in flight.
     */
    getCountryAndPostalCode() {
        const options = this.__getRequestOptions(
            `/v1/devices/${this.deviceId}/settings/address/countryAndPostalCode`);

        return new Promise((fulfill, reject) => {
            this.__handleDeviceAddressApiRequest(options, fulfill, reject);
        });
    }
    
    getSettings() {
        const options = this.__getRequestOptions(
            `/v1/devices/${this.deviceId}/settings`);

        return new Promise((fulfill, reject) => {
            this.__handleDeviceAddressApiRequest(options, fulfill, reject);
        });
    }

    /**
     * This is a helper method that makes requests to the Address API and handles the response
     * in a generic manner. It will also resolve promise methods.
     * @param requestOptions
     * @param fulfill
     * @param reject
     * @private
     */
    __handleDeviceAddressApiRequest(requestOptions, fulfill, reject) {
        Https.get(requestOptions, (response) => {
            console.log(`Device Address API responded with a status code of : ${response.statusCode}`);

            response.on('data', (data) => {
                let responsePayloadObject = JSON.parse(data);

                const deviceAddressResponse = {
                    statusCode: response.statusCode,
                    address: responsePayloadObject
                };

                fulfill(deviceAddressResponse);
            });
        }).on('error', (e) => {
            console.error(e);
            reject();
        });
    }

    /**
     * Private helper method for retrieving request options.
     * @param path the path that you want to hit against the API provided by the skill event.
     * @return {{hostname: string, path: *, method: string, headers: {Authorization: string}}}
     * @private
     */
    __getRequestOptions(path) {
        return {
            hostname: this.endpoint,
            path: path,
            method: 'GET',
            'headers': {
                'Authorization': 'Bearer ' + this.consentToken
            }
        };
    }
}

/**
 * Initialisiert die Adresse des Amazon Echo.
 * @param {*} sys 
 */
function initPLZ(sys) {
    const consentToken = sys.user.permissions.consentToken;
    console.log('Important Log:');
    console.log(sys.application);
    console.log(sys.user);
    console.log(sys.device);

    // Der Benutzer muss zuerst zustimmen, dass man die Postition des Geräts benutzen darf.
    if(!consentToken) {
        this.emit(":tellWithPermissionCard", 'Need permissions', 'Need permissions.');
        console.log("Benötige Zugriffsrechte für die Adresse.");
        return;
    }

    const deviceId = sys.device.deviceId;
    const apiEndpoint = sys.apiEndpoint;

    const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);
    let deviceAddressRequest = alexaDeviceAddressClient.getFullAddress();

    deviceAddressRequest.then((addressResponse) => {
        switch(addressResponse.statusCode) {
            case 200:
                const address = addressResponse.address;
                console.log('Got adress: ' + address);
                console.log(address['addressLine2'] + 
                    '\n' + address['postalCode'] + 
                    ' ' + address['city'] + 
                    '\n' + address['stateOrRegion'] + 
                    ' (' + address['countryCode'] + ')');
                staticQuestions[1].answer = address['postalCode'];
                staticQuestions[2].answer = address['city'];
                //staticQuestions[3].answer = address['addressLine2'];
                break;
            case 204:
                // Adresse leider nicht gesetzt
                console.log("Successfully requested from the device address API, but no address was returned.");
                break;
            case 403:
                // Keine Berechtigung
                console.log("The consent token we had wasn't authorized to access the user's address.");
                break;
            default:
                console.log(`Unknown Error occurred. StatusCode: ${addressResponse.statusCode}.`);
        }
    });

    deviceAddressRequest.catch((error) => {
        console.error(error);
        console.info("Ending getAddressHandler()");
    });
}

module.exports = {getStaticQuestion,
                getStaticAnswer,
                getDynamicQuestion,
                getDynamicAnswer,
                setStaticAnswer,
                setDynamicAnswer,
                addStaticQuestion,
                getStaticSize,
                getDynamicSize,
                isStaticUsed,
                setStaticUsed,
                isDynamicUsed,
                setDynamicUsed,
                initAnswers};