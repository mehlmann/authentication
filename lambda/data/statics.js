var STATIC_THRESHOLD = 1;
var DYNAMIC_THRESHOLD = 1;

/** 
 * Erhöht die Anzahl an statischen Fragen um 1.
*/
function increaseStaticThreshold() {
        STATIC_THRESHOLD++;
}

/** 
 * Verringert die Anzahl an statischen Fragen um 1.
*/
function decreaseStaticThreshold() {
        if (STATIC_THRESHOLD > 1) STATIC_THRESHOLD--;
}

/** 
 * Setzt die Anzahl an statischen Fragen wieder auf 1.
*/
function resetStaticThreshold() {
        STATIC_THRESHOLD = 1;
}

/** 
 * Erhöht die Anzahl an dynamischen Fragen um 1.
*/
function increaseDynamicThreshold() {
        DYNAMIC_THRESHOLD++;
}

/** 
 * Verringert die Anzahl an dynamischen Fragen um 1.
*/
function decreaseDynamicThreshold() {
        if (DYNAMIC_THRESHOLD > 1) DYNAMIC_THRESHOLD--;
}

/** 
 * Setzt die Anzahl an dynamischen Fragen wieder auf 1.
*/
function resetDynamicThreshold() {
        DYNAMIC_THRESHOLD = 1;
}

module.exports = {
        STATIC_THRESHOLD,
        DYNAMIC_THRESHOLD,
        increaseStaticThreshold,
        decreaseStaticThreshold,
        resetStaticThreshold,
        increaseDynamicThreshold,
        decreaseDynamicThreshold,
        resetDynamicThreshold
};