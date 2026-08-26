// tuples in TypeScript and their features:

// tuples -> fixed length and fixed types and order matters

const userEntry: [string, number] = ["Ayush", 29];

// optional tuples
type ResponseRow = [status: number, message?: string];

const r11: ResponseRow = [200];

const corners: readonly [number, number] = [0, 0];
