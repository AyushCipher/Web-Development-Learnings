// Function typing + return type inference + async behavior:

// inference example
const doubleFunc = (n: number) => n * 2;        // return type → inferred automatically

// explicit return for exported/public functions
export function toTitle(s: string): string {
  return `Hello ${s}`;
}

function booleanToNumber(flag: boolean): number {
  if (flag) {
    return 1;
  } else {
    return 0;
  }
}

// An async function ALWAYS returns a Promise
async function loadCountInfered() {
  return 42;        // BTS: Promise.resolve(42)
}

// So actual behavior is:
// function loadCountInfered(): Promise<number> {
//   return Promise.resolve(42);
// }

loadCountInfered().then((n) => console.log(n));
