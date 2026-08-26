"use strict";
// <T> -> constraint T so that only certain shapes are allowed
// <T extends X>
// key constraints -> <K extends keyof T> -> k must be a key of T
//.length
function lenN4(xN4) {
    return xN4.length;
}
console.log(lenN4("hello"));
console.log(lenN4([1, 2, 3]));
console.log(lenN4({ length: 10, tag: "ok" }));
function userN6Extract(arrN4, keyN4) {
    return arrN4.map((item) => item[keyN4]);
}
const usersN6 = [
    {
        id: "1",
        name: "name1",
        age: 22,
    },
    {
        id: "2",
        name: "name2",
    },
];
console.log(userN6Extract(usersN6, "id"));
console.log(userN6Extract(usersN6, "name"));
