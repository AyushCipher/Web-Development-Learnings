"use strict";
let username = "sangam";
let age = 40;
let isCreator = true;
const big = 2n ** 63n - 1n;
//Operator '+' cannot be applied to types 'bigint' and 'number'.
// const mixed = big + age
const TOKEN = Symbol("TOKEN");
function yearsToDay(years) {
    return years * 365;
}
console.log(username.toUpperCase());
console.log(yearsToDay(2));
