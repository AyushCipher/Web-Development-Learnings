// In this file, weunderstand what is "type parameter" <T> and how typescript infers <T> from our arguments automatically

// Q. WHAT IS GENERICS?
// ANS - Generics (<T>) → writing reusable functions that preserve type information:


// It is a function -> the types are "blanks" -> we fill in later meaning:
// <T> is a placeholder for a type
// You don’t decide the type now, it will be decided later when function is called

function id<T>(x: T): T {
  return x;
}
// infers T
// id(5) -> T is a number
// id('string') -> T is string
// id<number>(5)

const xyzz = id(5);
console.log(xyzz + 1, id(["ayush"]));


function firstGen<T>(arr: T[]): T | undefined {
  return arr[1];
}

console.log(firstGen([1, 2, 3, 4]));

// Generics make the function work for any array type while preserving the element type

// Without generics:
function bad(x: unknown): unknown {
  return x;
}

const val = bad(5);        // unknown ❌

// With generics:
function good<T>(x: T): T {
  return x;
}

const val1 = good(5);     // val1 is inferred as number ✅



function wrap<T>(value: T): { value: T } {
  return { value };
}

// wrap(5)        → { value: number }
// wrap("hi")     → { value: string }
