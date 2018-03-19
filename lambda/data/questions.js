'use strict';

const Https = require('https');

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
        question: 'Geben Sie ihre Postleitzahl in einzelnen Ziffern an.',
        answer: '76744',
        use: 0
    },
    {//2
        question: 'In welcher stadt wohnen sie?' ,
        answer: 'wörth am rhein',
        use: 0
    }/*,
    {//3
        question: 'in welcher stadt wurden sie geboren?',
        answer: 'erfurt',
        use: 0
    },
    {//4
        question: 'was sind die letzten drei ziffern ihrer handynummer?',
        answer: '099',
        use: 0
    },
    {//5
        question: 'wie ist ihre schuhgröße?',
        answer: '42',
        use: 0
    },
    {//6
        question: 'wie ist ihre körpergröße in zentimetern?',
        answer: '179',
        use: 0
    },
    {//7
        question: 'Von welcher Marke ist Ihr Handy?',
        answer: 'huawei',
        use: 0
    },
    {//8
        question: 'In welcher Hausnummer wohnen Sie?' ,
        answer: '8a'
    },
    {//9
        question: 'Wie ist der Mädchenname Ihrer Mutter?',
        answer: 'müller',
        use: 0
    },
    {//10
        question: 'Was war Ihr erstes Haustier?',
        answer: 'hund',
        use: 0
    },
    {//11
        question: 'Was war Ihr letztes Haustier?',
        answer: 'katze',
        use: 0
    },
    {//12
        question: 'Wieviele Haustiere haben Sie?',
        answer: '1',
        use: 0
    },
    {//13
        question: 'Was war der Name ihres ersten Haustieres?',
        answer: 'timmy',
        use: 0
    },
    {//14
        question: 'Was ist Ihr Lieblingsbuch?',
        answer: 'krabat',
        use: 0
    },
    {//15
        question: 'Was ist Ihr Lieblingsfilm?',
        answer: 'der herr der ringe',
        use: 1
    },
    {//16
        question: 'Was war Ihr Lieblingsfach in der Schule?',
        answer: 'mathematik',
        use: 0
    },
    {//17
        question: 'Welches Fach mochten Sie am wenigsten in der Schule?',
        answer: 'sozialkunde',
        use: 0
    },
    {//18
        question: 'Was ist Ihr Lieblingssport?',
        answer: 'basketball',
        use: 0
    },
    {//19
        question: 'Was ist Ihre Lieblingsfußballmannschaft?',
        answer: 'ksc',
        use: 0
    },
    {//20
        question: 'Wie war der Vorname Ihres väterlichen Großvaters?',
        answer: 'anton',
        use: 0
    },
    {//21
        question: 'Wie war der Vorname Ihrer mütterlichen Großmutter?',
        answer: 'nina',
        use: 0
    },
    {//22
        question: 'Von welcher Marke ist Ihr Auto?',
        answer: 'VW',
        use: 0
    },
    {//23
        question: 'Welche Marke hatte ihr erstes Auto?',
        answer: 'Toyota',
        use: 0
    },
    {//24
        question: 'Wie war der Name Ihres ersten Freundes, ihrer ersten Freundin?',
        answer: 'maria',
        use: 0
    },
    {//25
        question: 'Wie lautet Ihr Lieblingsinterpret?',
        answer: 'rammstein',
        use: 0
    },
    {//26
        question: 'Was war Ihr erstes Urlaubsland?',
        answer: 'türkei',
        use: 0
    },
    {//27
        question: 'Was ist Ihr Lieblingsurlaubsland?',
        answer: 'spanien',
        use: 0
    },
    {//28
        question: 'Von welcher Marke ist Ihr Laptop?',
        answer: 'acer',
        use: 0
    },
    {//29
        question: 'Von welcher Marke ist Ihr Tablet?',
        answer: 'samsung',
        use: 0
    },
    {//30
        question: 'Was war ihr erstes Musikinstrument?',
        answer: 'gitarre',
        use: 0
    },
    {//31
        question: 'Welches Bier trinken Sie am liebsten?',
        answer: 'bitburger',
        use: 0
    },
    {//32
        question: 'Was ist Ihre Lieblingsserie?',
        answer: 'The End of the Fucking World',
        use: 0
    }*/
];

/**
 * Eine Sammlung von dynamischen Fragen und den dazugehörigen Antworten.
 */
var dynamicQuestions = [
    {//0
        question: 'Wieviel Geld haben sie beim letzten Amazon Kauf ausgegeben?',
        answer: '20,00€',
        use: 0
    },
    {//1
        question: 'Wie hoch war Ihre letzte PayPal-Überweisung?',
        answer: '32,65€',
        use: 0
    },
    {//2
        question: 'Welches Festival oder Konzert haben Sie zuletzt besucht?',
        answer: 'rock am ring',
        use: 0
    }/*,
    {//3
        question: 'Was war das letzte Buch, welches Sie gelesen haben?',
        answer: 'zeit der krähen',
        use: 0
    },
    {//4
        question: 'Welchen Film haben Sie zuletzt gesehen?',
        answer: 'Chihiros Reise ins Zauberland',
        use: 1
    },
    {//5
        question: 'Welche Serie haben Sie zuletzt gesehen?',
        answer: 'Altered Carbon',
        use: 0
    },
    {//6
        question: 'Welchen Radiosender haben Sie zuletzt gehört?',
        answer: 'swr3',
        use: 0
    },
    {//7
        question: 'Was war die zuletzt installierte App auf Ihrem Smartphone?',
        answer: 'jodel',
        use: 0
    },
    {//8
        question: 'Was war die zuletzt installierte App auf Ihrem Tablet?',
        answer: 'candy crush',
        use: 0
    },
    {//9
        question: 'Was haben Sie zuletzt über Amazon bestellt?',
        answer: 'klopapier',
        use: 0
    }*/
];

/**
 * Gibt die statische Frage an arrayNumber-Stelle aus.
 * @param {int} arrayNumber Nummerierung der Frage
 */
function getStaticQuestion(arrayNumber) {
    return staticQuestions[arrayNumber].question;
}

/**
 * Gibt die dynamische Frage an arrayNumber-Stelle aus.
 * @param {int} arrayNumber Nummerierung der Frage
 */
function getDynamicQuestion(arrayNumber) {
    return dynamicQuestions[arrayNumber].question;
}

/**
 * Gibt die statische Antwort an arrayNumber-Stelle aus.
 * @param {int} arrayNumber Nummerierung der Frage
 */
function getStaticAnswer(arrayNumber) {
    return staticQuestions[arrayNumber].answer;
}

/**
 * Gibt die dynamische Antwort an arrayNumber-Stelle aus.
 * @param {int} arrayNumber Nummerierung der Frage
 */
function getDynamicAnswer(arrayNumber) {
    return dynamicQuestions[arrayNumber].answer;
}

/**
 * Schreibt in arrayNumber der statischen Fragen die neu Antwort hinein.
 * @param {int} arrayNumber Nummerierung der Frage
 * @param {string} newAnswer neue Antwort
 */
function setStaticAnswer(arrayNumber, newAnswer) {
    staticQuestions[arrayNumber].answer = newAnswer;
}

/**
 * Schreibt in arrayNumber der dynamischen Fragen die neu Antwort hinein.
 * @param {int} arrayNumber Nummerierung der Frage
 * @param {string} newAnswer neue Antwort
 */
function setDynamicAnswer(arrayNumber, newAnswer) {
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
    return staticQuestions[arrayNumber].use;
}

/**
 * Setzt, ob eine statische Frage benutzet werden soll.
 * @param {int} arrayNumber Nummer der Frage
 * @param {int} used wird die Frage benutzt? 
 */
function setStaticUsed(arrayNumber, used) {
    (used) ? staticQuestions[arrayNumber].use = 1 : staticQuestions[arrayNumber].use = 0;
}

/**
 * Gibt aus, ob eine dynamische Frage benutzt wird.
 * @param {int} arrayNumber Nummer der Frage
 */
function isDynamicUsed(arrayNumber) {
    return dynamicQuestions[arrayNumber].use;
}

/**
 * Setzt, ob eine dynamische Frage benutzet werden soll.
 * @param {int} arrayNumber Nummer der Frage
 * @param {int} used wird die Frage benutzt? 
 */
function setDynamicUsed(arrayNumber, used) {
    (used) ? dynamicQuestions[arrayNumber].use = 1 : dynamicQuestions[arrayNumber].use = 0;
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