/**
 * Der Verlauf einer Authentifizierung kann als State-Machine gesehen werden. 
 * Dies soll die Variable alexa_state implementieren.
 * Ein Beispiel einer Fragen-State-Machine könnte sein:
 * 
 *  ------   Antwort korrekt   ------   Antwort korrekt   -------
 * |quest1|------------------>|quest2|------------------>|authen.|
 *  ------                     ------                     -------
 *    |                           |
 *    |                           v Antwort falsch
 *    |      Antwort falsch    -------
 *    |---------------------->| abort |
 *                             -------
 */

var StateMachine = require('./includes/javascript-state-machine')


var alexa_state = new StateMachine({
    init : 'quest1',
    transitions: [
        { name: 'answer_correct', from: 'quest1', to: 'quest2'},
        { name: 'answer_correct', from: 'quest2', to: 'authenticated'},
        { name: 'answer_wrong',    from: 'quest1', to: 'abort'},
        { name: 'answer_wrong',    from: 'quest2', to: 'abort'}
    ],
    methods: {
        onAnswerCorrect: function() {
            console.log('Answer was correct.');
        },
        onAnswerWrong:  function() {
            console.log('Answer was wrong!');
        }     
    }
});

module.exports = alexa_state
