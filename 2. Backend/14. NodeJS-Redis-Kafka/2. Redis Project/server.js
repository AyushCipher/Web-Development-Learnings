require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");

const connectDb = require("./src/config/db");
require("./src/config/redis"); // establishes the shared Redis connection used everywhere else

const authRoutes = require("./src/routes/auth.routes");
const productRoutes = require("./src/routes/product.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Run "npm run worker" in another terminal to process queued emails.`);
  });
}

start();
