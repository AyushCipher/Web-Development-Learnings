// Array types of defining in TypeScript:


const a11: number[] = [1, 2, 3]; // T[]
const a22: Array<number> = [1, 2, 3]; // Array<T>

const scores = [10, 20, 30];
// scores.push('40')  -> error since scores is number[] and '40' is string

const mix: (string | number)[] = [1, "2", 3, "4"];
