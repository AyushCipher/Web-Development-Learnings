// When to rely on type inference vs when to explicitly write types:

// GOAL -> understand when to let TypeScript infer types
// TS -> knows JS very well
// when ts will writes the types / u r going to write

let count = 0; // ts sees number
const site = "acedevhub"; // ts sees the exact literal "acedevhub"
const scors = [10, 20, 30];

// over annonation isnt bad -> just noisy

export function add(a: number, b: number): number {
  return a + b;
}

console.log(add(5, 2));

// we should also annotate when the type is not obvious

let maybe: string | number;
maybe = Math.random() > 0.5 ? "test" : 10;

// Type inference is when TypeScript automatically detects the type without you writing it.
