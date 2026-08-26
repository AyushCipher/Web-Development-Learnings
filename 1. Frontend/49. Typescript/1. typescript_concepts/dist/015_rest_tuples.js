"use strict";
function sumAllNumbers(...xs) {
    return xs.reduce((s, n) => s + n, 0);
}
console.log(sumAllNumbers(1, 2, 3, 4));
//Tuple rest
function makeRange(...args) {
    const [start, end, step = 1] = args;
    const out = [];
    for (let n = start; n <= end; n += step)
        out.push(n);
    return out;
}
console.log(makeRange(1, 5));
console.log(makeRange(2, 10, 2));
console.log(makeRange(1, 5, 2));
function draw(x, y) {
    console.log(x, y);
}
const points = [10, 20];
// draw(...points) // not a fixed [number, number] tuple
const pointsFixed = [10, 20]; //readonly
draw(...pointsFixed);
