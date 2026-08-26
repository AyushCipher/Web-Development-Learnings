// Diving into function typing, inference in callbacks, and object types as parameters

function func1(a: number, b: number): number {
  return a + b;
}

const nums12 = [1, 2, 3];

const doubled = nums12.map((n) => n * 2); // (n: number)
console.log(doubled);

// const times2 = (n : number) => n*2 
// always prefer to give annotations, if tsconfig.json has strict: false  then ts will assume any type for n leading to bugs

type Point = { x: number; y: number };

function distanceFromOrigin(p: Point): number {
  return Math.hypot(p.x, p.y);
}

console.log(distanceFromOrigin({ x: 3, y: 2 }));
