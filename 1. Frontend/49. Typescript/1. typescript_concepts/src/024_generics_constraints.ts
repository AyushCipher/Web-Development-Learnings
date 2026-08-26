// How to restrict what types <T> can be, and how to safely work with object keys:

// <T> -> constraint T so that only certain shapes are allowed
// <T extends X>
// key constraints -> <K extends keyof T> -> k must be a key of T
// .length

function lenN4<T extends { length: number }>(xN4: T): number {
  return xN4.length;
}

console.log(lenN4("hello"));
console.log(lenN4([1, 2, 3]));
console.log(lenN4({ length: 10, tag: "ok" }));

// console.log(lenN4(123));   -> no(123) doesn't work since it dont have length property

type UserN6 = { id: string; name: string; age?: number };

function userN6Extract<T, K extends keyof T>(arrN4: T[],keyN4: K): Array<T[K]> {
  return arrN4.map((item) => item[keyN4]);
}

const usersN6: UserN6[] = [
  {
    id: "1",
    name: "name1",
    age: 22,
  },
  {
    id: "2",
    name: "name2",
  },
];

console.log(userN6Extract(usersN6, "id"));          // ["1", "2"]
console.log(userN6Extract(usersN6, "name"));        // ["name1", "name2"]
// console.log(userN6Extract(usersN6, "address")); -> error, address is not a key of UserN6
