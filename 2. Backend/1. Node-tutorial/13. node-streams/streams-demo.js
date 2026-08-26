// A stream is a mechanism in Node.js used to process data piece-by-piece (chunk-by-chunk) instead of loading the entire data into memory at once.
// Suppose you want to read: 10 GB video file, Without streams: Entire file loads into RAM first creating problems such as huge memory usage, slower performance, application crash risk.

// Streams Solve this by providing data gradually in small chunks, allowing you to start processing immediately without waiting for the entire file to load. 
// This is especially beneficial for large files, real-time data processing, and network communication.

// FOUR TYPES OF STREAMS IN NODE.JS:
// * readable -> use to read data (reading files)
// * writable -> use to write data (writing files)
// * duplex -> can be used for both read and write (TCP sockets)
// * transform -> zlib steams


const fs = require("fs");
const zlib = require("zlib");               // imports compression module:  gzip compression, decompression
const crypto = require("crypto");           // imports cryptography module: encryption, decryption, hashing
const { Transform } = require("stream");    // imports Transform stream class: used to create custom transform streams for data manipulation (encryption, compression, etc.)


class EncryptStream extends Transform {
  constructor(key, vector) {
    super();
    this.key = key;
    this.vector = vector;
  }

  // Node automatically calls this method whenever new chunk arrives
  _transform(chunk, encoding, callback) {
    const cipher = crypto.createCipheriv("aes-256-cbc", this.key, this.vector);       // create cipher object(encryption machine) for encryption using AES-256-CBC algorithm(AES-Advanced Encryption Standard.)
    const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]);          // encrypt the current chunk data
    this.push(encrypted);     // Sends encrypted chunk to next stream. (next stream is writableStream - which saves encrypted chunk into output file.)
    callback(); 
  }
}

const key = crypto.randomBytes(32);
const vector = crypto.randomBytes(16);

const readableStream = fs.createReadStream("input.txt");

// new gzip object to compress the stream of data
const gzipStream = zlib.createGzip();

const encryptStream = new EncryptStream(key, vector);

const writableStream = fs.createWriteStream("output.txt.gz.enc");

// read -> compress -> encrypt -> write
readableStream.pipe(gzipStream).pipe(encryptStream).pipe(writableStream);     // Takes output from one streamand feeds it into next stream automatically.

console.log("Streaming -> compressing -> writing data");
