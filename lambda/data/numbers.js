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
        word: 'einundzwanzig',
        number: 21
    },
    {
        word: 'zweiundzwanzig',
        number: 22
    },
    {
        word: 'dreiundzwanzig',
        number: 23
    },
    {
        word: 'vierundzwanzig',
        number: 24
    },
    {
        word: 'fünfundzwanzig',
        number: 25
    },
    {
        word: 'sechsundzwanzig',
        number: 26
    },
    {
        word: 'siebenundzwanzig',
        number: 27
    },
    {
        word: 'achtundzwanzig',
        number: 28
    },
    {
        word: 'neunundzwanzig',
        number: 29
    },
    {
        word: 'dreizig',
        number: 30
    },
    {
        word: 'einunddreizig',
        number: 31
    },
    {
        word: 'zweiunddreizig',
        number: 32
    },
    {
        word: 'dreiunddreizig',
        number: 33
    },
    {
        word: 'vierunddreizig',
        number: 34
    },
    {
        word: 'fünfunddreizig',
        number: 35
    },
    {
        word: 'sechsunddreizig',
        number: 36
    },
    {
        word: 'siebenunddreizig',
        number: 37
    },
    {
        word: 'achtunddreizig',
        number: 38
    },
    {
        word: 'neununddreizig',
        number: 39
    },
    {
        word: 'vierzig',
        number: 40
    },
    {
        word: 'einundvierzig',
        number: 41
    },
    {
        word: 'zweiundvierzig',
        number: 42
    },
    {
        word: 'dreiundvierzig',
        number: 43
    },
    {
        word: 'vierundvierzig',
        number: 44
    },
    {
        word: 'fünfundvierzig',
        number: 45
    },
    {
        word: 'sechsundvierzig',
        number: 46
    },
    {
        word: 'siebenundvierzig',
        number: 47
    },
    {
        word: 'achtundvierzig',
        number: 48
    },
    {
        word: 'neunundvierzig',
        number: 49
    },
    {
        word: 'fünfzig',
        number: 50
    },
    {
        word: 'einundfünfzig',
        number: 51
    },
    {
        word: 'zweiundfünfzig',
        number: 52
    },
    {
        word: 'dreiundfünfzig',
        number: 53
    },
    {
        word: 'vierundfünfzig',
        number: 54
    },
    {
        word: 'fünfundfünfzig',
        number: 55
    },
    {
        word: 'sechsundfünfzig',
        number: 56
    },
    {
        word: 'siebenundfünfzig',
        number: 57
    },
    {
        word: 'achtundfünfzig',
        number: 58
    },
    {
        word: 'neunundfünfzig',
        number: 59
    },
    {
        word: 'sechzig',
        number: 60
    },
    {
        word: 'einundsechzig',
        number: 61
    },
    {
        word: 'zweiundsechzig',
        number: 62
    },
    {
        word: 'dreiundsechzig',
        number: 63
    },
    {
        word: 'vierundsechzig',
        number: 64
    },
    {
        word: 'fünfundsechzig',
        number: 65
    },
    {
        word: 'sechsundsechzig',
        number: 66
    },
    {
        word: 'siebenundsechzig',
        number: 67
    },
    {
        word: 'achtundsechzig',
        number: 68
    },
    {
        word: 'neunundsechzig',
        number: 69
    },
    {
        word: 'siebzig',
        number: 70
    },
    {
        word: 'einundsiebzig',
        number: 71
    },
    {
        word: 'zweiundsiebzig',
        number: 72
    },
    {
        word: 'dreiundsiebzig',
        number: 73
    },
    {
        word: 'vierundsiebzig',
        number: 74
    },
    {
        word: 'fünfundsiebzig',
        number: 75
    },
    {
        word: 'sechsundsiebzig',
        number: 76
    },
    {
        word: 'siebenundsiebzig',
        number: 77
    },
    {
        word: 'achtundsiebzig',
        number: 78
    },
    {
        word: 'neunundsiebzig',
        number: 79
    },
    {
        word: 'achtzig',
        number: 80
    },
    {
        word: 'einundachtzig',
        number: 81
    },
    {
        word: 'zweiundachtzig',
        number: 82
    },
    {
        word: 'dreiundachtzig',
        number: 83
    },
    {
        word: 'vierundachtzig',
        number: 84
    },
    {
        word: 'fünfundachtzig',
        number: 85
    },
    {
        word: 'sechsundachtzig',
        number: 86
    },
    {
        word: 'siebenundachtzig',
        number: 87
    },
    {
        word: 'achtundachtzig',
        number: 88
    },
    {
        word: 'neunundachtzig',
        number: 89
    },
    {
        word: 'neunzig',
        number: 90
    },
    {
        word: 'einundneunzig',
        number: 81
    },
    {
        word: 'zweiundneunzig',
        number: 82
    },
    {
        word: 'dreiundneunzig',
        number: 93
    },
    {
        word: 'vierundneunzig',
        number: 94
    },
    {
        word: 'fünfundneunzig',
        number: 95
    },
    {
        word: 'sechsundneunzig',
        number: 96
    },
    {
        word: 'siebenundneunzig',
        number: 97
    },
    {
        word: 'achtundneunzig',
        number: 98
    },
    {
        word: 'neunundneunzig',
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