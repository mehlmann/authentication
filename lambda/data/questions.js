'use strict';

const Https = require('https');

/**
 * Eine Sammlung von statischen Fragen und den dazugehörigen Antworten.
 */
var staticQuestions = [
    {
        question: 'was ist ihre lieblingsfarbe?',
        answer: 'blau'
    },
    {
        question: 'Geben Sie ihre Postleitzahl in einzelnen Ziffern an.',
        answer: ''
    }/*,
    {
        questions: 'In welcher Stadt wohnen Sie?' ,
        answer: ''
    },
    {
        questions: 'In welcher Straße wohnen Sie?' ,
        answer: ''
    }*/
];

/**
 * Eine Sammlung von dynamischen Fragen und den dazugehörigen Antworten.
 */
var dynamicQuestions = [
    {
        question: 'wieviel haben sie beim letzten Amazon Kauf ausgegeben?',
        answer: 'zwanzig euro'
    }
];

/**
 * Diese Funktion soll alle möglichen dynamischen Antworten füllen.
 * @param {*} sys 
 */
function initAnswers(sys) {
    initPLZ(sys);  //staticQuestions[1] staticQuestions[2] staticQuestions[3]
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
                //staticQuestions[2] = address['stateOrRegion'];
                //staticQuestions[3] = address['addressLine2'];
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

module.exports = {staticQuestions,
                dynamicQuestions,
                initAnswers};