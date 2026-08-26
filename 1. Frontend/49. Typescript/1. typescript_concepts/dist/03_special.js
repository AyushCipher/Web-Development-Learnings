"use strict";
//strictNullChecks
// let title : string = "intro"
// title = undefined
let subtitle = "sangam";
// void: function doesn't return a useful value
function log(msg) {
    console.log(msg);
}
//never returns
function fail(msg) {
    throw new Error(msg);
}
//DO NOT USE ANY  -> TRY TO IGNORE AS MUCH AS POSSIBLE
const valueAny = JSON.parse('{"x" : 1}');
valueAny.notThere.toFixed(2); // this compiles but can break/explode at runtime
