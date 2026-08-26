// ARRAY: An array is a special variable that can hold multiple values at once.


// Creation of Array
let numbers = [1,4,5,7]; 
console.log(numbers);




// INSERTION:-

// 1. Insert at the end
numbers.push(9);
console.log(numbers); 
// Output: [1, 4, 5, 7, 9]


// 2. Insert at the beginning
numbers.unshift(8);
console.log(numbers); 
// Output: [8, 1, 4, 5, 7, 9]


// 3. Insert in the middle
// [which index to insert, whether delete any existing element, elements to be inserted]
numbers.splice(2, 0, 'a', 'b', 'c');
console.log(numbers);
// Output: [8, 1, 'a', 'b', 'c', 4, 5, 7, 9]

numbers.splice(2, 2, 'x', 'y');
console.log(numbers);
// Output: [8, 1, 'x', 'y', 'c', 4, 5, 7, 9]





// SEARCHING:-  [In case of Primitives/Non-primitives]

console.log(numbers);  // [8, 1, 'x', 'y', 'b', 'c', 4, 5, 7, 9]


// 1. Basic search using indexOf :- If element is not found, it returns -1
console.log(numbers.indexOf(4));  
// Output: 6 (index of 4)



// 2. Bad Practice (old way to check existence)
if (numbers.indexOf(4) !== -1) {
    console.log("present");  
    // Output: present
}



// 3. Good Practice using includes()
console.log(numbers.includes(7));  
// Output: true



// 4. Advanced indexOf — start searching from a specific index
console.log(numbers.indexOf(4, 2));  
// Output: 6 — searches from index 2, and finds 4 at index 6.




// 5. In case of Objects:
let courses=[
    {no:1, name: 'Ayush'},
    {no:2, name: 'Anish'}
];

console.log(courses);
// Output: [ { no: 1, name: 'Ayush' }, { no: 2, name: 'Anish' } ]

console.log(courses.indexOf({no:1, name:'Ayush'})); // -1
// Gives -1 not found both cases since, and -1 if found as it's a different object in memory than the one in the array.
// JS first creates a new object literal {no:1, name:'Ayush'} at another memory address. Even though they look identical in value,
// they are not the same reference in memory.



// Correct Way of searching an element:-

let course = courses.find(function(course){  // [ arrayName.find( callback/predicate function)] --> returns object to be found
  return course.name == 'Ayush';
})
console.log(course);            
// Output: { no: 1, name: 'Ayush' }



// Alternate way of using previous syntax: [Arrow Functions]
let course1 = courses.find(course1 => course1.name === 'Ayush');
console.log(course1);
// Output: { no: 1, name: 'Ayush' }

// If we want index of object to be found then use findIndex() method instead of find() method




// DELETION:-

let nos = [1, 2, 3, 4, 5, 6, 7];

// 1. From the End   -   Removes 7 from array
nos.pop();  
console.log(nos); 
// Result: [1, 2, 3, 4, 5, 6]



// 2. From the Beginning   -   Removes 1 from array
nos.shift();  
console.log(nos); 
// Result: [2, 3, 4, 5, 6]



// 3. From the Middle: Most recommended as it Modifies the orginal array 
nos.splice(2, 3);  
// [from which index element to start deletion, how many elements to be deleted]
console.log(nos);  
// Output: [1, 2, 6, 7]



// 4. With slice method:  Not recommended as it does NOT modify the original array and 
// returns a new array containing a shallow copy of a portion of the original array.
let array1 = [1, 2, 3, 4, 5];
let newArr = arr.slice(1, 3); 
console.log(arr);            // [2, 3]
// Original array unchanged: [1, 2, 3, 4, 5]




// Emptying an Array:-
let no = [1,2,3,4,5];
let no1 = no;
no = [];


// no.length = 0; ---> This line is particularly used to empty both arrays 
// no.splice(0,no.length); ---> Deletion by using splice method

console.log(no); //  Gives an empty array as result
console.log(no1); // Gives [1,2,3,4,5] as result, which was considered to be deleted by no=[] 
// but since it is a reference type so both point to same values and the array, no becomes empty while no1 does not.





// FOR PRIMITIVES --

// Combine two Strings: 
let str1 = "Hello";
let str2 = "World";

let combined1 = str1 + " " + str2;  // Using + operator
console.log(combined1);  // Output: "Hello World"


// Combine two Arrays:
let first = [1,2,3];
let second = [4,5,6];

let combined  = first.concat(second);
console.log(combined);
// Output: [1, 2, 3, 4, 5, 6]


// Combine two arrays:
let arr1 = [1, 2, 3];
let arr2 = [4, 5, 6];

let combinedArray = [...arr1, ...arr2];
console.log(combinedArray); // [1, 2, 3, 4, 5, 6]



// FOR REFERENCES -- [FIND OUT]

// Combine two arrays:





// Slicing Object:

let obj = { 
  a: 1, 
  b: 2, 
  c: 3, 
  d: 4 
};

// Destructuring example to extract part of an object (shallow copy)
let { a, b } = obj;

// Create a new object using the extracted variables
let newObj = { a, b };

console.log(newObj);  // Output: { a: 1, b: 2 }




// Spread Operator: It is another way of combining two arrays other than concat.
let one = [1,2,3];
let two = [4,5,6];
let combine = [...one,...two];
console.log(combine);
// Output: [1, 2, 3, 4, 5, 6]


// CREATING SHALLOW COPY USING SPREAD OPERATOR:-

// * A shallow copy copies only the first level of an object/array and Nested objects/arrays are still shared between the original and the copy.
// * Modifying nested elements affects both original and copied object.

let another = [...combine];
// Output: [1, 2, 3, 4, 5, 6]


// CREATING DEEP COPY:- A deep copy creates a completely independent copy, including all nested objects/arrays.
let deepCopy = JSON.parse(JSON.stringify(combine));
let deepCopy1 = structuredClone(combine);





// ITERATING IN AN ARRAY:
let arr = [10, 20, 30, 40];


// 1. Traditional for loop:     Through for loop, we control start, end, and increment explicitly using an index counter.
for (let i = 0; i < arr.length; i++) {
  console.log(`Index: ${i}, Value: ${arr[i]}`);
}


// 2. for...of loop:    Simplified syntax to iterate directly over values of iterable objects (like arrays, strings, Sets).
for (let value of arr) {
  console.log(`Value: ${value}`);
}


// 3. For-each loop:-   An array method that executes a provided function once per array element.
arr.forEach(function(value, index) {
  console.log(`Index: ${index}, Value: ${value}`);
});


// Using arrow function:
arr.forEach((value, index) => {
  console.log(`Index: ${index}, Value: ${value}`);
});





// Joins two arrays:
let numb = [10,20,30,40,50];
const joined = numb.join(',');  //--> (',') indicates on what basis the elements should be joined
console.log(joined);
// Output: 10,20,30,40,50




// Splits an array:
let message = 'This is my first message';
let parts = message.split('');
console.log(parts);
// Output: [ 'T', 'h', 'i', 's', ' ', 'i', 's', ' ', 'm', 'y', ' ', 'f', 'i', 'r', 's', 't', ' ', 'm', 'e', 's', 's', 'a', 'g', 'e' ]




// Sorting An Array:
let elements = [5,10,4,40];
elements.sort();
console.log(elements); // Result: [10,4,40,5];  
// 1:- It first converts numbers into their string format then sort it.
// 2:- Lexicographic sorting: Strings are compared character by character in lexicographic order (like a dictionary):
// "10" comes before "4" because lexicographically "1" is smaller than "4".

 



// Reversing an Array:
elements.reverse();
console.log(elements);




// Sorting with help of predicate method [FIND OUT]
let number = [5, 2, 9, 1, 7];


// Ascending
number.sort((a, b) => a - b);
console.log(number);        // [1, 2, 5, 7, 9]


// Descending
number.sort((a, b) => b - a);
console.log(number);        // [9, 7, 5, 2, 1]






// FILTERING ARRAYS:- The filter() method takes each element in an array and it applies a conditional statement against it. 
// If this conditional returns true, the element gets pushed to the output array. If the condition returns false, 
// the element does not get pushed to the output array.
 
let ani = [1,2,-1,-4];
let filtered = ani.filter(function(value){      
    return value>=0;
});
console.log(filtered);      // [1, 2]

// Alternate way of writing above code with arrow method:-
let filtering = ani.filter(value => value>=0);
console.log(filtering);



// 1. Basic: Filter positive numbers
const no2 = [1, -2, 3, -4, 5];
const positives = no2.filter(n => n > 0);
console.log(positives);     // [1, 3, 5]



// 2. Filter strings by length
const naming = ['Anna', 'Bob', 'Christopher', 'Eve'];
const shortNames = naming.filter(name => name.length <= 4);
console.log(shortNames);    // ['Anna', 'Bob', 'Eve']



// 3. Filter objects by property
const userObj = [
  { name: 'Ayush', active: true },
  { name: 'John', active: false },
  { name: 'Emma', active: true }
];
const activeUsers = userObj.filter(user => user.active);
console.log(activeUsers);
// [ { name: 'Ayush', active: true }, { name: 'Emma', active: true } ]



// 4. Filter even numbers
const arrNum = [1, 2, 3, 4, 5, 6];
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens);         // [2, 4, 6]



// 5. Filter by complex condition
const products = [
  { id: 1, name: 'Laptop', price: 1200 },
  { id: 2, name: 'Mouse', price: 25 },
  { id: 3, name: 'Monitor', price: 300 }
];
const expensive = products.filter(product => product.price > 100);
console.log(expensive);
// [ { id: 1, name: 'Laptop', price: 1200 }, { id: 3, name: 'Monitor', price: 300 } ]






// MAPPING ARRAYS:- The map() method is used for creating a new array of same length from an existing one, applying a function to each one of the elements of the first array.

let ayush = [7,8,9,10];
let items = ayush.map(function(value){
    return 'student_no' + value;
});
console.log(items);         // [ 'student_no7', 'student_no8', 'student_no9', 'student_no10' ]

// Alternate way of writing with Arrow Method:-
let items1 = ayush.map(value => 'student_no' + value);
console.log(items1);



// 2. Basic Number Transformation
const num = [1, 2, 3, 4];
const doubled = num.map(no => no * 2);
console.log(doubled);       // [2, 4, 6, 8]



// 3. Convert ayush array elements to their binary format
const output = ayush.map(function binary(m){
    return m.toString(2);
})



// 4. Converting String Numbers to Integers
const strNums = ["10", "20", "30"];
const nums = strNums.map(Number);           // or x => parseInt(x)
console.log(nums);          // [10, 20, 30]



// 5. Mapping with Conditional Logic
const scores = [45, 75, 90];
const grades = scores.map(score => score >= 60 ? "Pass" : "Fail");
console.log(grades);        // ['Fail', 'Pass', 'Pass']



// 6. Extracting Specific Property from Array of Objects
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 }
];

const names = users.map(user => user.name);
console.log(names);         // ['Alice', 'Bob']



// 7. Composing .map() with .filter():-
let number1 = [1,2,-6,-9];
let filtered1 = number1.filter(value => value>=0);

let items2 = filtered1.map(function(nums){
    return {value: nums};
})
console.log(items2);    // [ { value: 1 }, { value: 2 } ]



var new_array = arr.map(function callback(element, index, array) {
    // Return value for new_array
}[ thisArg]) 



// In the callback, only the array element is required. Usually some action is performed on the value and then a new value is returned.










// Concept Of Chaining:-

// let items2 = number1.filter(value => value>=0).map(nums => {value: nums}); ---> It will give the same result as above.

// Reduction of Arrays:- [FOR TAKING OUT SUM OF ARRAY ELEMENTS]
let array = [1,2,3,4];

// let total = 0;
// for(let value of arr)
//     total= total + value;
// console.log(total);   ---> RESULT:- 10


// Purpose: Reduce an array to a single value (sum, product, concatenation, object, etc.).


// Alternate Way of writing the above code of finding sum of elements of array code:-
let totalSum = array.reduce((accumulator, currentValue) => accumulator + currentValue,0); // RESULT:- 10

// acccumulator behaves as running total and currentValue behaves as value
// accumulator = 0
// currentValue = 1
// accumulator = accumulator + currentValue = 0+1 = 1
// cuurentValue = 2
// accumulator = accumulator + currentVlue = 1+2 = 3
// cuurentValue = 3
// accumulator = accumulator + currentVlue = 3+3 = 6
// cuurentValue = 4
// accumulator = accumulator + currentVlue = 6+4 = 10

console.log(" PRINTING TOTAL SUM:");
console.log(totalSum);      // 10


// EXAMPLE 2:
let no3 = [3, 7, 2, 9, 5];
let max = no3.reduce((acc, curr) => curr > acc ? curr : acc);
console.log(max);           // Output: 9


//  EXAMPLE 3:
const userName = [
  { firstName: "ayush", lastName: "verma", age: 20 },
  { firstName: "donald", lastName: "trump", age: 75 },
  { firstName: "elon", lastName: "musk", age: 50 },
  { firstName: "ansh", lastName: "chawla", age: 26 },
];

const ageCount = userName.reduce((acc, user) => {
if(acc[curr.age]) {
    acc[curr.age] = ++ acc[curr.age]
}
else{
    acc[curr.age] = 1;
}
  return acc;
}, {});

console.log(ageCount);      // { 26: 2, 75: 1, 50 :1 }


