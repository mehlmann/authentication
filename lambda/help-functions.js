'use strict'

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
    formatNumberLength,
    formatMoneyAmount,
    printLog,
    printError
};