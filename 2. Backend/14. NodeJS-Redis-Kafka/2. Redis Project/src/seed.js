require("dotenv").config();
const mongoose = require("mongoose");
const connectDb = require("./config/db");
const Product = require("./models/Product");

// One-off script (run via `npm run seed`) to populate demo products - not
// mounted anywhere in server.js, so it never runs as part of the app itself.

const demoProducts = [
  { name: "Wireless Mouse", description: "2.4GHz wireless mouse", price: 799, stock: 50 },
  { name: "Mechanical Keyboard", description: "Hot-swappable, RGB", price: 3499, stock: 20 },
  { name: "USB-C Hub", description: "7-in-1 adapter", price: 1299, stock: 35 },
  { name: "Webcam 1080p", description: "Autofocus, built-in mic", price: 2199, stock: 15 },
  { name: "Laptop Stand", description: "Aluminum, adjustable", price: 999, stock: 40 },
];

async function seed() {
  await connectDb();
  await Product.deleteMany({});
  await Product.insertMany(demoProducts);
  console.log(`Seeded ${demoProducts.length} products.`);
  await mongoose.disconnect();
}

seed();
