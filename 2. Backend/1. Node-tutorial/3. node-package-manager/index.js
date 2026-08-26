// NPM (Node Package Manager) demo: `lodash` here is a THIRD-PARTY package,
// not a Node.js built-in - it was fetched from the npm registry via
// `npm install lodash` and is now listed under "dependencies" in
// package.json. Anyone who clones this project just runs `npm install` and
// package.json's dependency list tells npm exactly what to download to
// recreate the same node_modules/ folder (no need to commit node_modules
// itself to git - that's what package.json + package-lock.json are for).
const lodash = require("lodash");

const names = ["sangam", "john", "terry", "alex", "mia"];

// lodash.map(collection, fn) - same idea as Array.prototype.map, but part of
// lodash's utility library (useful when working with older JS environments,
// or objects/array-likes that don't have the native method).
// lodash.capitalize(str) - uppercases the first letter, lowercases the rest.
const capitalize = lodash.map(names, lodash.capitalize);

console.log(capitalize);
