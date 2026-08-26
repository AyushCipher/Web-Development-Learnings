"use strict";
function greetPersonOptional(name) {
    const upperRes = name ? name?.toUpperCase() : "Guest";
    return `Hello ${upperRes}`;
}
console.log(greetPersonOptional("sangam"));
console.log(greetPersonOptional());
function greetPersonDefault(name = "Default") {
    return `Hello ${name.toUpperCase()}`;
}
console.log(greetPersonDefault("Raj"));
console.log(greetPersonDefault());
function connect(host, port, secure) {
    const p = port ?? 80;
    const s = secure ?? false;
    return `Connect ${host} ${p} ${secure}`;
}
connect("localhost", 100, true);
