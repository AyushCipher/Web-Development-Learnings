console.log('Hello Jee');

let lastName = 'Verma'; // A normal primitive string

let firstName = new String('Ayush'); // An Object string

let msg = 'This is my friend\'s book\n';
let msg1 = "He said, \"Hello\"";
console.log(msg);                       // This is my friend's book
console.log(msg1);                      // He said, "Hello"

// We cannot directly single or double quotes inside our string already initialized with "" or '' so we need to use \' & \" respectively."


// Escape Sequences:

//      \n → Newline
//      \' → Single quote
//      \" → Double quote
//      \\ → Backslash



// METHODS USED IN STRING:-

// Note: The methods that we are using here are just used to give a new result by doing which we can save the results into another variable
// but it does not change the actual value stored in the variable containing string.




// EXAMPLES OF METHODS WITHOUT ARGUMENT [Empty Bracket]:-

// const message = 'Hello World!';

// * If you want to obtain the length of the string message then just type message.length in console.
// * If you want to convert all letters of string under message to uppercase then just type message.toUpperCase() in console.
// * If you want to convert all letters of string under message to lowercase then just type message.toLowerCase() in console.




// const falseMessage = '    Hi, I am John!';
// const message1 = falseMessage.trim();

// * If you want to remove the extra space Before/After the string, then just type falseMessage.trim() in console and then can store the result in another variable.
// * trimStart() is used to trim the extra space Before the string whereas trimEnd() is used to trim the extra space After the string.




// EXAMPLES OF METHODS WITH ARGUMENT [No-Empty Bracket]:-

// const finalMessage = message1;       ---> creates a copy by value of msg const variable value declared above

// * If you want to check that in a big string a small part of string is present or not, then just type message1.includes('am') in console which will return true.
// * If you want to replace a part of string from the main string content then type message1.replace('Hi','Hello') then it return 'Hello, I am John!'. It will replace Hello when first occurrence of Hi is found.
// * message1.replaceAll('Hi','Hello') will replace Hello wherever Hi is found throughout the code.
// * If you want to find index of a character from the main string then type message1.indexOf(I) in console which will return 4 else if not present then -1.
// * message1.charAt(4) returns the character at the specified index in the string, i.e, I.
// * If you want to find ASCII Code of a character then just type message1.charCodeAt(11) which will return ASCII Code of n ,i.e, 110.
// * If we want to add/concatenate string inside message and msg together then just type message + '. ' +message1 and it will return 'Hello World!. Hi, I am John!
// OR type message.concat(message1); to obtain same result.




// String Slicing Methods:

// slice(startIndex, endIndex) — extracts substring from startIndex to endIndex (exclusive)
console.log(message1.slice(0, 5));  
// Output: 'Hi, I'

// substring(startIndex, endIndex) — similar to slice but doesn't accept negative indexes
console.log(message1.substring(0, 5));  
// Output: 'Hi, I'





// const lastFourDigits =  '7856';
// const maskedAccNo = lastFourDigits.padstart(5,'*');

// * If you want to generate OTP of our account no. sent by Banks then use the method lastFourDigits.padStart(5,'*') which will add 5 * in front of stored string and return '*****7856' automatically.
// * The method lastFourDigits.padEnd(5,'*') will add 5 * in back of stored string and return '7856*****' automatically.

// TEMPLATE LITERALS can be used in place of concat method for smooth addition of strings 
// const templateString  = `My Account Number is ${lastFourDigits.padStart(5,'*')}`;
// RESULT:- 'My Account Number is *****7856'




// Template Literal:-

// But on writing our string under back-ticks symbol, we get our string as we write under it[addition of new line, '', "" can be done in the same way where we use it inside our string.]
let psg = `This
is the

second
paragraph
of ${lastName}` // Template Strings: Upon using $ with variable name, the content of variable gets displayed, we dynamically brought the name.
console.log(psg);



let words = msg.split(' ');
console.log(words);         // ["Hi,", "I", "am", "John!"]




// DATES IN JAVASCRIPT:

let date1 = new Date(); 
console.log(date1);                 // Mon May 26 2025 05:41:43 GMT+0530 (India Standard Time)
// Creates a Date object with the current date and time.


let date2 = new Date(' June 20 1998 07:15');
console.log(date2);                 // Sat Jun 20 1998 07:15:00 GMT+0530 (India Standard Time)

// Creates a Date object from the string, representing June 20, 1998 at 7:15 AM.


let date3 = new Date(2004, 8, 28, 3);
console.log(date3);                 // Tue Sep 28 2004 03:00:00 GMT+0530 (India Standard Time)

// Creates a Date object with: {Year, Month, Day, Hour}



date3.setFullYear(1998);
console.log(date3);                 // Mon Sep 28 1998 03:00:00 GMT+xxxx (your timezone)
// Changes the year of date3 from 2004 to 1998, keeping month, day, and time the same.

 