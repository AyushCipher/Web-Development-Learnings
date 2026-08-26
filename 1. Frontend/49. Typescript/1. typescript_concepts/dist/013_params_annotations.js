"use strict";
function func1(a, b) {
    return a + b;
}
const nums12 = [1, 2, 3];
const doubled = nums12.map((n) => n * 2); // (n: number)
console.log(doubled);
function distanceFromOrigin(p) {
    return Math.hypot(p.x, p.y);
}
console.log(distanceFromOrigin({ x: 3, y: 2 }));
