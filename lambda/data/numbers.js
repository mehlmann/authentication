'use strict';

/**
 * Die wörtlichen Zahlen von 0-50 und ihre integer Äquivalente
 */
const numbers = [
    {
        word: 'null',
        number: 0
    },
    {
        word: 'eins',
        number: 1
    },
    {
        word: 'ein',
        number: 1
    },
    {
        word: 'zwei',
        number: 2
    },
    {
        word: 'drei',
        number: 3
    },
    {
        word: 'vier',
        number: 4
    },
    {
        word: 'fünf',
        number: 5
    },
    {
        word: 'sechs',
        number: 6
    },
    {
        word: 'sieben',
        number: 7
    },
    {
        word: 'acht',
        number: 8
    },
    {
        word: 'neun',
        number: 9
    },
    {
        word: 'zehn',
        number: 10
    },
    {
        word: 'elf',
        number: 11
    },
    {
        word: 'zwölf',
        number: 12
    },
    {
        word: 'dreizehn',
        number: 13
    },
    {
        word: 'vierzehn',
        number: 14
    },
    {
        word: 'fünfzehn',
        number: 15
    },
    {
        word: 'sechzehn',
        number: 16
    },
    {
        word: 'siebzehn',
        number: 17
    },
    {
        word: 'achtzehn',
        number: 18
    },
    {
        word: 'neunzehn',
        number: 19
    },
    {
        word: 'zwanzig',
        number: 20
    },
    {
        word: 'ein und zwanzig',
        number: 21
    },
    {
        word: 'zwei und zwanzig',
        number: 22
    },
    {
        word: 'drei und zwanzig',
        number: 23
    },
    {
        word: 'vier und zwanzig',
        number: 24
    },
    {
        word: 'fünf und zwanzig',
        number: 25
    },
    {
        word: 'sechs und zwanzig',
        number: 26
    },
    {
        word: 'sieben und zwanzig',
        number: 27
    },
    {
        word: 'acht und zwanzig',
        number: 28
    },
    {
        word: 'neun und zwanzig',
        number: 29
    },
    {
        word: 'dreizig',
        number: 30
    },
    {
        word: 'ein und dreizig',
        number: 31
    },
    {
        word: 'zwei und dreizig',
        number: 32
    },
    {
        word: 'drei und dreizig',
        number: 33
    },
    {
        word: 'vier und dreizig',
        number: 34
    },
    {
        word: 'fünf und dreizig',
        number: 35
    },
    {
        word: 'sechs und dreizig',
        number: 36
    },
    {
        word: 'sieben und dreizig',
        number: 37
    },
    {
        word: 'acht und dreizig',
        number: 38
    },
    {
        word: 'neun und dreizig',
        number: 39
    },
    {
        word: 'vierzig',
        number: 40
    },
    {
        word: 'ein und vierzig',
        number: 41
    },
    {
        word: 'zwei und vierzig',
        number: 42
    },
    {
        word: 'drei und vierzig',
        number: 43
    },
    {
        word: 'vier und vierzig',
        number: 44
    },
    {
        word: 'fünf und vierzig',
        number: 45
    },
    {
        word: 'sechs und vierzig',
        number: 46
    },
    {
        word: 'sieben und vierzig',
        number: 47
    },
    {
        word: 'acht und vierzig',
        number: 48
    },
    {
        word: 'neun und vierzig',
        number: 49
    },
    {
        word: 'fünfzig',
        number: 50
    },
    {
        word: 'ein und fünfzig',
        number: 51
    },
    {
        word: 'zwei und fünfzig',
        number: 52
    },
    {
        word: 'drei und fünfzig',
        number: 53
    },
    {
        word: 'vier und fünfzig',
        number: 54
    },
    {
        word: 'fünf und fünfzig',
        number: 55
    },
    {
        word: 'sechs und fünfzig',
        number: 56
    },
    {
        word: 'sieben und fünfzig',
        number: 57
    },
    {
        word: 'acht und fünfzig',
        number: 58
    },
    {
        word: 'neun und fünfzig',
        number: 59
    },
    {
        word: 'sechzig',
        number: 60
    },
    {
        word: 'ein und sechzig',
        number: 61
    },
    {
        word: 'zwei und sechzig',
        number: 62
    },
    {
        word: 'drei und sechzig',
        number: 63
    },
    {
        word: 'vier und sechzig',
        number: 64
    },
    {
        word: 'fünf und sechzig',
        number: 65
    },
    {
        word: 'sechs und sechzig',
        number: 66
    },
    {
        word: 'sieben und sechzig',
        number: 67
    },
    {
        word: 'acht und sechzig',
        number: 68
    },
    {
        word: 'neun und sechzig',
        number: 69
    },
    {
        word: 'siebzig',
        number: 70
    },
    {
        word: 'ein und siebzig',
        number: 71
    },
    {
        word: 'zwei und siebzig',
        number: 72
    },
    {
        word: 'drei und siebzig',
        number: 73
    },
    {
        word: 'vier und siebzig',
        number: 74
    },
    {
        word: 'fünf und siebzig',
        number: 75
    },
    {
        word: 'sechs und siebzig',
        number: 76
    },
    {
        word: 'sieben und siebzig',
        number: 77
    },
    {
        word: 'acht und siebzig',
        number: 78
    },
    {
        word: 'neun und siebzig',
        number: 79
    },
    {
        word: 'achtzig',
        number: 80
    },
    {
        word: 'ein und achtzig',
        number: 81
    },
    {
        word: 'zwei und achtzig',
        number: 82
    },
    {
        word: 'drei und achtzig',
        number: 83
    },
    {
        word: 'vier und achtzig',
        number: 84
    },
    {
        word: 'fünf und achtzig',
        number: 85
    },
    {
        word: 'sechs und achtzig',
        number: 86
    },
    {
        word: 'sieben und achtzig',
        number: 87
    },
    {
        word: 'acht und achtzig',
        number: 88
    },
    {
        word: 'neun und achtzig',
        number: 89
    },
    {
        word: 'neunzig',
        number: 90
    },
    {
        word: 'ein und neunzig',
        number: 81
    },
    {
        word: 'zwei und neunzig',
        number: 82
    },
    {
        word: 'drei und neunzig',
        number: 93
    },
    {
        word: 'vier und neunzig',
        number: 94
    },
    {
        word: 'fünf und neunzig',
        number: 95
    },
    {
        word: 'sechs und neunzig',
        number: 96
    },
    {
        word: 'sieben und neunzig',
        number: 97
    },
    {
        word: 'acht und neunzig',
        number: 98
    },
    {
        word: 'neun und neunzig',
        number: 99
    },
    {
        word: 'einhundert',
        number: 100
    },
    {
        word: 'hundert',
        number: 100
    }
];

module.exports = numbers;