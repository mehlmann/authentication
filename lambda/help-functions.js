'use strict'

const ordinals = [
    {
        number: 1,
        ordinal: 'ersten'
    },
    {
        number: 2,
        ordinal: 'zweiten'
    },
    {
        number: 3,
        ordinal: 'dritten'
    },
    {
        number: 4,
        ordinal: 'vierten'
    },
    {
        number: 5,
        ordinal: 'fünften'
    },
    {
        number: 6,
        ordinal: 'sechsten'
    },
    {
        number: 7,
        ordinal: 'siebten'
    },
    {
        number: 8,
        ordinal: 'achten'
    },
    {
        number: 9,
        ordinal: 'neunten'
    },
    {
        number: 10,
        ordinal: 'zenten'
    },
];

/**
 * Erstellt aus zwei Zahlen eine Geldbetrag des Formats x,yy€.
 * Sollten entweder euro oder cent nicht definiert (undefined) sein, so werden sie zu 0 ausgewertet.
 * @param {int} euro Betrag in Euro
 * @param {int} cent Betrag in Cent
 */
function formatMoneyAmount(euro, cent) {
    var formatCent = formatNumberLength(cent, 2);
    var answer = '';
    if (euro) {
        answer += `${euro}`;
        if (formatCent) { 
            answer += `,${formatCent}€`;
        } else {
            answer += `,00€`;
        }
    }  else {
        answer += `0,${formatCent}€`;
    }
    return answer;
}

/**
 * Ergänzt ein Integer mit vorangehenden 0'en.
 * @param {int} number zu formatierende Zahl
 * @param {int} length Länge der Ausgabe
 */
function formatNumberLength(number, length) {
    if (!number) return undefined;
    var tmp = '' + number;
    while (tmp.length < length) {
        tmp = '0' + tmp;
    }
    return tmp;
}

/**
 * Wandelt eine Zahl zu ihrer Ordnung um.
 * @param {int} number Zahl von 1-10
 */
function numberToOrdinal(number) {
    if (number > 10) return 'NaN';
    if (number < 0) return 'NaN';
    for (var i = 0; i < ordinals.length; i++) {
        if (ordinals[i].number == number) return ordinals[i].ordinal;
    }
}

/**
 * Gibt einen Text in der Konsole aus.
 * @param {string} string Text
 */
function printLog(log) {
    console.log(log);
}

/**
 * Gibt einen Fehlertext in der Konsole aus.
 * @param {string} error Fehlertext
 */
function printError(error) {
    console.error(error);
}

module.exports = {
    formatMoneyAmount,
    formatNumberLength,
    numberToOrdinal,
    printLog,
    printError
};