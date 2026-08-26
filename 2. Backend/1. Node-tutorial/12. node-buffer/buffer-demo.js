// Buffer is a global object in Node.js that provides a way to work with binary data. 
// Since JavaScript normally works with strings, objects, arrays but computers internally work with bytes, binary data so Node.js provides: Buffer 
// It is used to handle raw binary data, such as files, network streams, and other types of data that are not necessarily in a string format. 

// Buffers are particularly useful for tasks like:
// * file system operations
// * cryptography, 
// * image,video,audio processing


const fs = require("fs");
const crypto = require("crypto");

// 1. Buffer.alloc() -> Safe Memory Allocation
// * Creates a buffer of fixed size.
// * Memory is initialized with zeros.

const buffOne = Buffer.alloc(10);
console.log("1. Buffer.alloc():", buffOne);


// 2. Buffer.allocUnsafe() -> Faster but Unsafe
// * Creates buffer quickly without clearing memory.
// * May contain old garbage values.
// * Used when performance matters.

const unsafeBuff = Buffer.allocUnsafe(10);
console.log("2. Buffer.allocUnsafe():", unsafeBuff);


// 3. Buffer.from(string): Converts string into binary bytes.
const buffFromString = Buffer.from("Hello");
console.log("3. Buffer.from(string):", buffFromString);


// 4. Buffer.from(array): Creates buffer directly from byte values.
const buffFromArray = Buffer.from([65, 66, 67, 68]);
console.log("4. Buffer.from(array):", buffFromArray);
console.log("Converted to String:", buffFromArray.toString());


// 5. Writing Data into Buffer: Writes text into existing memory.
buffOne.write("Ayush");
console.log("5. After write():", buffOne.toString());


// 6. Accessing Individual Bytes: Buffer behaves like byte array.
console.log("6. First byte of Hello:", buffFromString[0]);

// ASCII value of H = 72


// 7. Modifying Individual Bytes: Buffers are mutable. We can directly change bytes.
buffFromString[0] = 89; // Y
console.log("7. Modified Buffer:", buffFromString.toString());

// Hello becomes Yello


// 8. Buffer Length: Returns total bytes stored.
console.log("8. Buffer Length:", buffFromString.length);


// 9. Buffer Slice: Extracts portion of buffer.
const sliced = buffFromString.slice(0, 3);
console.log("9. Slice:", sliced.toString());


// 10. Buffer Concatenation: Combines multiple buffers.
const concatBuff = Buffer.concat([buffOne, buffFromString]);
console.log("10. Concatenated Buffer:", concatBuff.toString());


// 11. Buffer to JSON: Converts buffer into serializable JSON object.
console.log("11. Buffer JSON:", concatBuff.toJSON());


// 12. Encoding Conversion: Convert buffer data into different encodings like hex, base64, etc.
const nameBuff = Buffer.from("Ayush");

// Convert into hexadecimal
console.log("12. Hex Encoding:", nameBuff.toString("hex"));

// Convert into Base64
console.log("Base64 Encoding:", nameBuff.toString("base64"));


// 13. Buffer.fill(): Fills entire buffer with specified value.
const fillBuff = Buffer.alloc(5);
fillBuff.fill("A");

console.log("13. Filled Buffer:", fillBuff.toString());

// 14. Buffer.includes(): Checks whether buffer contains data.
const helloBuff = Buffer.from("Hello World");
console.log("14. Includes 'World':", helloBuff.includes("World"));


// 15. Buffer.indexOf(): Finds position of substring.
console.log("15. Index Of 'World':", helloBuff.indexOf("World"));


// 16. Buffer.equals(): Compares two buffers.
const b1 = Buffer.from("Node");
const b2 = Buffer.from("Node");
console.log("16. Buffer Equals:", b1.equals(b2));


// 17. Buffer.copy(): Copies one buffer into another.
const source = Buffer.from("CopyMe");
const target = Buffer.alloc(20);

source.copy(target);

console.log("17. Copied Buffer:", target.toString());


// 18. Reading Unsigned Integers: Useful in binary protocols.
const intBuff = Buffer.from([0x48]);
console.log("18. Read UInt8:", intBuff.readUInt8(0));

// 0x48 = 72


// 19. Writing Unsigned Integers
const writeIntBuff = Buffer.alloc(1);
writeIntBuff.writeUInt8(65, 0);
console.log("19. Write UInt8:", writeIntBuff.toString());

// 65 = ASCII of A


// 20. Unicode Character Storage: Some Unicode characters take multiple bytes.

const emojiBuff = Buffer.from("😊");

console.log("20. Emoji Buffer:", emojiBuff);
console.log("Emoji Byte Length:", emojiBuff.length);

// Emoji takes 4 bytes in UTF-8


// 21. Buffer.byteLength(): Returns exact byte size of string.
console.log(
  "21. Byte Length of 'Hello':",
  Buffer.byteLength("Hello")
);


// 22. File Reading using Buffers: By default fs.readFileSync returns Buffer.
const currentFile = fs.readFileSync(__filename);
console.log("22. File Read Buffer Type:", Buffer.isBuffer(currentFile));


// 23. Buffer.isBuffer(): Checks whether object is a buffer.
console.log("23. Is Buffer:", Buffer.isBuffer(buffOne));
console.log("Is Buffer:", Buffer.isBuffer("Hello"));


// 24. Cryptography with Buffers: Hashing internally works with binary data.
const hash = crypto
  .createHash("sha256")
  .update(Buffer.from("secret"))
  .digest("hex");

console.log("24. SHA256 Hash:", hash);


// 25. Streams Internally Use Buffers: Streams transfer data chunk-by-chunk using buffers.
const readStream = fs.createReadStream(__filename);

readStream.on("data", (chunk) => {
  console.log("25. Stream Chunk is Buffer:", Buffer.isBuffer(chunk));

  // Closing stream after first chunk
  readStream.destroy();
});

