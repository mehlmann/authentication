'use strict';

var numbers = require('./data/numbers')


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



module.exports = {stringToInteger
                  };