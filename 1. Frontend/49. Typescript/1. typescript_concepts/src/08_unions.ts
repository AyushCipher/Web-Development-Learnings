// Union Types + Type Narrowing:


// UNION -> A union type allows a value to be one of multiple types meaning value -> this OR that

function printId(id: string | number) {
  // if(typeof id === 'string'){
  //   id.toUpperCase()
  // } else {
  //     id.toFixed(2)
  // }
}

// Object union
type Admin = { role: "Admin"; permissions: string[] };
type Customer = { role: "Customer"; loyaltyPoints: number };

function describeUser(u: Admin | Customer) {
  if (u.role === "Admin") {
    console.log(u.permissions);
  } else {
    console.log(u.loyaltyPoints);
  }
}

function describeUserWithInOperator(u: Admin | Customer) {
  if ("permissions" in u) {
    console.log(u.role, "Admin user");
  } else {
    console.log(u.loyaltyPoints);
  }
}

// Array of unions and union of arrays
const arrOfUnion: (string | number)[] = ["a", 1, "b", "2"]; // Each element can be string or number


const unionOfArrays: string[] | number[] =
  Math.random() > 0.1 ? ["x", "3"] : [1, 2];                // Either array of strings or array of numbers

// unionOfArrays.push("z") // error since TS does not know if unionOfArrays is string[] or number[] 
