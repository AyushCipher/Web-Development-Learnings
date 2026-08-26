"use strict";
const xss = [1, 2, 34];
const ys = [1, 2, 3];
const yss = [1, 2, 3];
xss[0] = 9; //mutable
// yss.push(3)
//
function sum(nums) {
    let s = 0;
    for (const n of nums)
        s += n;
    return s;
}
console.log(sum(xss)); //passing mutable array in readonly param is allowed
const res = yss.map((n) => n * 8);
