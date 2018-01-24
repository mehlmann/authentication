var StateMachine = require('javascript-state-machine')


var alexa_state = new StateMachine({
    init = 'start',
    transitions: [
        { name: 'answer', from: 'start', to: 'end'},
        { name: 'again',    from: 'end', to: 'start'}
    ],
    methods: {
        onAnswer: function() {

        },
        onAgain:  function() {

        }     
    }
});

module.exports = alexa_state
