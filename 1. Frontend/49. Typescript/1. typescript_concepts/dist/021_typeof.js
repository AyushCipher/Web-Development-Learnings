"use strict";
//typeof for primitives
function describeTypeOf(x) {
    if (typeof x === "string") {
        return "string";
    }
    if (typeof x === "number") {
        return 10;
    }
    if (typeof x === "boolean") {
        return true;
    }
    if (typeof x === "bigint") {
        return "bigint";
    }
    if (typeof x === "symbol") {
        return "synbol";
    }
    if (typeof x === "undefined") {
        return "undefined";
    }
    if (typeof x === "function") {
        return () => { };
    }
    if (x === null)
        return null;
    return "object";
}
console.log(describeTypeOf("hi"), describeTypeOf(23), describeTypeOf(true), describeTypeOf(10n), describeTypeOf(Symbol("sangam")), describeTypeOf(undefined), describeTypeOf(() => { }), describeTypeOf(null), describeTypeOf({}));
function info(z) {
    if (Array.isArray(z)) {
        return z;
    }
    if (z instanceof Date) {
        return new Date();
    }
    if (z instanceof Error) {
        return new Error("hbhjg");
    }
    return "other";
}
console.log(info([1, 2, 3, 4, 5]), info(new Date()), info(new Error("oopss! Error occured")), info({ x: 1 }));
