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

const numbers = [
    {
        word: 'null',
        number: '0'
    },
    {
        word: 'eins',
        number: '1'
    },
    {
        word: 'zwei',
        number: '2'
    },
    {
        word: 'drei',
        number: '3'
    },
    {
        word: 'vier',
        number: '4'
    },
    {
        word: 'fünf',
        number: '5'
    },
    {
        word: 'sechs',
        number: '6'
    },
    {
        word: 'sieben',
        number: '7'
    },
    {
        word: 'acht',
        number: '8'
    },
    {
        word: 'neun',
        number: '9'
    },
    {
        word: 'zehn',
        number: '10'
    },
    {
        word: 'elf',
        number: '11'
    },
    {
        word: 'zwölf',
        number: '12'
    },
    {
        word: 'dreizehn',
        number: '13'
    },
    {
        word: 'vierzehn',
        number: '14'
    },
    {
        word: 'fünfzehn',
        number: '15'
    },
    {
        word: 'sechzehn',
        number: '16'
    },
    {
        word: 'siebzehn',
        number: '17'
    },
    {
        word: 'achtzehn',
        number: '18'
    },
    {
        word: 'neunzehn',
        number: '19'
    },
    {
        word: 'zwanzig',
        number: '20'
    },
    {
        word: 'ein und zwanzig',
        number: '21'
    },
    {
        word: 'zwei und zwanzig',
        number: '22'
    },
    {
        word: 'drei und zwanzig',
        number: '23'
    },
    {
        word: 'vier und zwanzig',
        number: '24'
    },
    {
        word: 'fünf und zwanzig',
        number: '25'
    },
    {
        word: 'sechs und zwanzig',
        number: '26'
    },
    {
        word: 'sieben und zwanzig',
        number: '27'
    },
    {
        word: 'acht und zwanzig',
        number: '28'
    },
    {
        word: 'neun und zwanzig',
        number: '29'
    },
    {
        word: 'dreizig',
        number: '30'
    },
    {
        word: 'ein und dreizig',
        number: '31'
    },
    {
        word: 'zwei und dreizig',
        number: '32'
    },
    {
        word: 'drei und dreizig',
        number: '33'
    },
    {
        word: 'vier und dreizig',
        number: '34'
    },
    {
        word: 'fünf und dreizig',
        number: '35'
    },
    {
        word: 'sechs und dreizig',
        number: '36'
    },
    {
        word: 'sieben und dreizig',
        number: '37'
    },
    {
        word: 'acht und dreizig',
        number: '38'
    },
    {
        word: 'neun und dreizig',
        number: '39'
    },
    {
        word: 'vierzig',
        number: '40'
    }
];

/**
 * Erstellt aus zwei Zahlen eine Geldbetrag des Formats x,yy€.
 * Sollten entweder euro oder cent nicht definiert (undefined) sein, so werden sie zu 0 ausgewertet.
 * @param {int} euro Betrag in Euro
 * @param {int} cent Betrag in Cent
 */
function formatMoneyAmount(euro, cent) {
    if (!euro && !cent) return undefined;
    var formatCent = formatNumberLength(cent, 2);
    var answer = '';
    if (euro) {
        answer += `${euro}`;
        // Changed!
        (formatCent) ? answer += `,${formatCent}€` : answer += `,00€` ;
        /*if (formatCent) { 
            answer += `,${formatCent}€`;
        } else {
            answer += `,00€`;
        }*/
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

/**
 * Wandelt ein Wort von null bis vierzig in die dazugehörige Zahl um.
 * @param {string} word 
 */
function wordToNumber(word) {
    for (var i = 0; i < numbers.length; i++) {
        if (numbers[i].word == word) return numbers[i].number;
    }
    return '0';
 }

module.exports = {
    formatMoneyAmount,
    formatNumberLength,
    numberToOrdinal,
    printLog,
    printError,
    wordToNumber
};