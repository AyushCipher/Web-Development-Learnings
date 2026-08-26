// goal -> understand when to let TypeScript infer types
// ts -> js very well
// when ts will writes the types / u r going to write
let count = 0; //ts sees number
const site = "acedevhub"; // ts sees the exact literal "acedevhub"
const scors = [10, 20, 30];
//over annonation isnt bad -> just noisy
export function add(a, b) {
    return a + b;
}
console.log(add(5, 2));
//you should also annotate when the type is not obvious
let maybe;
maybe = Math.random() > 0.5 ? "test" : 10;
