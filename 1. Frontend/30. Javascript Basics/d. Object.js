// Object Creation :- An object is a collection of properties, where each property is an association between a name (or key) and a value. 
let rectangle = {
    length: 1, // [key: value]
    breadth: 2,

    // Method under object
    draw: function() {
        console.log('draw');
    }
};

// IMPORTANT CONCEPT:-

let str1 = "";
let str2 = "";

console.log(str1 === str2); // true



let obj1 = {};
let obj2 = {};

console.log(obj1 === obj2); // false

// REASON:- 
// Strings and other primitives: When comparing primitive values, === compares the actual values.
// Objects: When comparing objects, === compares the references, not the contents.
// Even if two objects have the same properties and values, they will be considered different unless they reference the same object in memory.


// SOLUTION:-

// let obj1 = {};
// let obj2 = obj1;  // Now obj2 references the same object as obj1

// console.log(obj1 === obj2);  // true



// Factory Function :- It always use Camelcase -> noOfStudents (first letter of first word is small & first letter of next all the words are capital.)
function createRectangle(len,bre){
    let rectangle = {
        length: len,
        breadth: bre,
   
        //Method under object
        draw: function() {
            console.log('draw');
        }
    };
    return rectangle;
}

let rectangleObj1 = createRectangle(5,4);
let rectangleObj2 = createRectangle(3,6);
let rectangleObj3 = createRectangle(2,7);




// Constructor Function :- It only initializes methods/properties. It always uses Pascal Notation -> first letter of every word is capital.
// this keyword is used within functions to refer to the object that is being created or manipulated.
function Rectangle(len,bre){
    this.length = len;
    this.breadth = bre;
    this.draw = function(){
        console.log('drawing');
    }
}

// Object creation using Constructor Function (new keyword returns an empty object, after which this is used to refer the empty object)
let rectangleObject = new Rectangle(4,6);


// EXAMPLE 2 
const obj = {
  name: "Ayush",
  age: 28,
  hired: false,
  skills: ["reactjs", "nextjs"],
  greet: function () {
    return "Good Morning";
  }
};

console.log(obj.skills[1]); // Output: nextjs
console.log(obj.greet()); // Output: Good Morning


// EXAMPLE 3: [NESTED OBJECTS]
const objec1 = {
  hobbies: {
    chess: {
      maybe: "No",
      games: {
        COD: {
          lastOfUs: "Maybe I dont know"
        }
      }
    }
  }
};

console.log(objec1.hobbies.chess.games.COD.lastOfUs) // Output: Maybe I dont know






// # KEY DIFFERENCES BETWEEN THE USAGE OF BOTH CREATION TYPES:-

// 1. Syntax and Usage:
// * Factory Function: Easier syntax, simple function call.
// * Constructor Function: Requires new keyword and use of this.

// 2. Object Creation:
// * Factory Function: Explicitly returns a new object.
// * Constructor Function: Implicitly returns a new object when called with new.

// 3. Memory Efficiency:
// * Factory Function: Methods are created for each instance.
// * Constructor Function: Methods can be defined on the prototype and shared across instances.



// Adding and removing new properties:
rectangleObject.color = 'yellow';
console.log(rectangleObject);

delete rectangleObject.color;
console.log(rectangleObject);


// Note:- 1. Agr hm Rectangle ka b constructor find out krte ha to hume console pr ek function nzar ata ha jo ki inbuilt hota ha
// Internal Function niche likha gya code k jasa internally kam krta ha: Syntax - [let _x__ = new Function( Parameter, Parameter, Entire Code)];
// 2. Functions are also Objects since they also have some properties/key-value pairs

let Rectangle1 = new Function(
  'length','breadth',

  `this.length = length;
  this.breadth = breadth;A
  this.draw = function() {
    console.log('drawing');
  }`);

// Object creation using Rectangle1
let react = new Rectangle1(2,3);
console.log(react);




// Primitive data Types:- Number,Boolean,Strings,Symbol,Undefined,Null.
// Reference Data Types:- Objects,Arrays,Functions.

// let a = 10;                                                                                       
// let b = a;                          
// a++;
// console.log(a);
// console.log(b);

// Answer:- 11  --> This is because in primitive types if we assign b=a, it creates a seperate block with copied value.
//          10   --> Primitives are copied by their vales.


let av = {value:10};
let dv = av;
av.value++;
console.log(av.value);
console.log(dv.value);

// Answer:- 11 ----> This is because in non-primitive or reference types when av=dv, then bv points to the same address/ memory location where av is located.
//          11   --> References are copied by their address/reference.



// CONCEPTS OF Object.freeze() and Object.seal() :-

// 1. Object.freeze:- It can be useful you want to completely lock down an object, making it truly immutable meaning 
// if you neither want to change the existing values nor add a new value / delete any value.

// EXAMPLE:
const user = {
  name: "Alice",
  age: 25
};

Object.freeze(user);

user.age = 30;           // ❌ Will not change
user.city = "Delhi";     // ❌ Will not be added
delete user.name;        // ❌ Will not delete

console.log(user); 
// Output: { name: "Alice", age: 25 }


// 2. Object.seal: It can be used when you want to prevent the addition or removal of properties but still allow updates to existing properties.

// EXAMPLE:-
const student = {
  name: "Bob",
  grade: "A"
};

Object.seal(student);

student.grade = "A+";     // ✅ Allowed
student.age = 20;         // ❌ Not added
delete student.name;      // ❌ Not deleted

console.log(student); 
// Output: { name: "Bob", grade: "A+" }



// LOOPS THAT CAN BE USED ON INTERATING OBJECTS:

// 1. For-in loop:- Iterates over enumerable properties (keys) of an object.

// EXAMPLE 1:
let rctngl = {
  length: 2,
  breadth: 4
};

for(let key in rctngl) {
    // keys are reflected through key variable
    // values are reflected through rctngl[key]
    console.log(key, rctngl[key]);
}

// RESULT: length 2
//         breadth 4



// EXAMPLE 2:
let person = {
    name: "Ayush",
    age: 25,
    city: "Delhi"
};

for (let key in person) {
    console.log(key, person[key]);
}




// For-of loop :- Can be applied only on iterables values like Arrays,Maps,etc.

let person1 = {
    name: "Ayush",
    age: 25,
    city: "Delhi"
};

for(let key of person1) {
    console.log(key);    //--> It will give error since we cannot apply this loop in non-iterables like objects
}

// RESULT: TypeError: person1 is not iterable




// WAYS OF LOOPING OBJECTS THROUGH FOR-OF LOOP: 

// 1. Object.keys():- Object.keys(person1) returns an array of keys: ["name", "age", "city"], which is iterable.

for (let key of Object.keys(person1)) {
    console.log(key);           
}

// RESULT: name
//         age
//         city




// 2. Object.entries():- Object.entries(person1) returns an array of key-value pair arrays.

for (let key of Object.entries(person1)) {  
    console.log(key);    
}

// RESULT: [ 'name', 'Ayush' ]
//         [ 'age', 25 ]
//         [ 'city', 'Delhi' ]






// What is the difference between ‘for-of’ and ‘for-in’ and forEach()?

// For Of: It loops over the iterable values.
// For In: Loops over the Keys.
// forEach(): It only iterates over arrays, it can access both the value and the index of each element while iterating.




// To find out that key is present or not
let rectangl = {
    length: 2,
    breadth: 4
};

if ('color' in rectangl) {
    console.log('Present');
} else {
    console.log('Absent');
}

// RESULT:- Absent





// CONCEPT OF DESTRUCTURING:- 

// It is a special syntax that allows us to "unpack" values from arrays or properties from objects into distinct variables.


//EXAMPLE - 1:-

// const person = {
//     fName: "Shivani",
//     age: 28,
//     role: "Sr. Team Lead",
//     skills: {
//         frontend: "Reactjs",
//         backend: {
//             API:"Fasify",
//         }
//     }
// }


const {fName, skills: { frontend, backend: { API },},} = person;
// const { fName: name, skills: { frontend: frontTech, backend: { API: backTech } } } = person;


// console.log(fName);     // "Shivani"
// console.log(frontend);  // "Reactjs"
// console.log(API);       // "Fasify"

// console.log(name);      // "Shivani"
// console.log(frontTech); // "Reactjs"
// console.log(backTech);  // "Fastify"



// EXAMPLE - 2:-

// const student = {
//     id: 101,
//     personal: {
//         name: "Shivani",
//         age: 28,
//         address: {
//             city: "Delhi",
//             zip: 110001
//         }
//     },
//     courses: ['React', 'Node', 'JavaScript']
// };

// // Nested destructuring
// const {
//     personal: { name, address: { city } },
//     courses: [firstCourse, secondCourse]
// } = student;

// console.log(name);        // "Shivani"
// console.log(city);        // "Delhi"
// console.log(firstCourse); // "React"
// console.log(secondCourse);// "Node"




// GARBAGE COLLECTOR:- Garbage Collector is a tool which find variables that are not in use and deallocate/free their memory.
// No need of writing free function sperately like C/C++.



// OBJECT CLONING :-

//  1. Through Iteration
let src={
    p: 10,
    q: 20,
    r: 30
};
for(let key in src) {
    dest[key] = src[key];
}



// 2. Through Assignment by object-assign function
let pest = Object.assign ({ },src);   // [empty object, key-value pairs of src]



// 3. Through Spread : SHALLOW COPIES meaning Copies only the top-level elements.
// If elements are reference types (e.g., objects), only the reference is copied, not the actual object.
let dest = {...src};




// 4. Deep copy using JSON:
let object1 = { x: 1, y: { z: 2 } };
let object2 = JSON.parse(JSON.stringify(object1));

object2.y.z = 100;

console.log(obj1); // { x: 1, y: { z: 2 } } ✅ Unaffected
console.log(obj2); // { x: 1, y: { z: 100 } }



// Shallow Copy: Copies only the top-level elements. If elements are reference types (e.g., objects), only the reference is copied, not the actual object.
// Deep Copy: Recursively copies all levels of the original structure. The new object/array is completely independent.





// CONCEPT OF OPTIONAL CHAINING:-

// Optional chaining is a feature in JavaScript that allows us to safely access deeply nested properties of an object 
// without having to check if each reference in the chain exists.
// If any part of the chain is null or undefined, it returns undefined instead of throwing an error.

// EXAMPLE:

const student = {
  name: 'Ayush',
  address: {
    city: 'Delhi'
  }
};

console.log(student.address.city);         // ✅ "Delhi"
console.log(student.contact.phone);        // ❌ Error (contact doesn't exist)
console.log(student.contact?.phone);       // ✅ undefined (safe)




