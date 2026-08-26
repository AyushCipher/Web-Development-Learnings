"use strict";
// object shapes -> similar to interfaces
// union types (A | B)
// intersection types (A & B)
const person1 = {
    id: "1",
    address: "address",
    salary: 1234,
};
function nextActionCheck(s) {
    switch (s) {
        case "new":
            return "new";
        case "paid":
            return "paid";
        case "pending":
            return "pending";
        default:
            return "default";
    }
}
