// Q. Why does this file import "./routes/productRoutes.js" (a .js extension)
// when the actual source file on disk is productRoutes.ts?
// ANS: This project compiles with TypeScript's ESM output ("module": "ESNext"
// in tsconfig.json + "type": "module" in package.json). Node's native ESM
// resolver requires the *runtime* extension in relative imports, and after
// `tsc` compiles this file, productRoutes.ts becomes productRoutes.js - so
// the import has to reference the output filename, not the source filename,
// even though TypeScript is happy resolving it against the .ts file at
// build/typecheck time.
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import productRouter from "./routes/productRoutes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI || "";

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("MERN demo backend is running");
});

// Simple liveness/readiness endpoint for the Docker/Compose section of the
// course - useful for a container HEALTHCHECK or a load balancer probe later.
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    message: "Server is healthy",
  });
});

app.use("/api/products", productRouter);

// Q. Why connect to MongoDB before calling app.listen(), instead of starting
// the HTTP server immediately and connecting in the background?
// ANS: Every route here (see productRoutes.ts) hits the database directly
// with no "is Mongo ready?" guard. If the server started accepting requests
// before the connection was live, the very first request could crash or hang
// on a not-yet-connected mongoose call. Awaiting the connection first means
// the server only ever starts listening once it's actually able to serve
// requests - and if Mongo is unreachable, this fails loudly and exits
// instead of silently listening on a backend that can't do anything.
const startServer = async () => {
  try {
    if (!mongoUri) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(mongoUri);

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server");
    console.error(error);
    process.exit(1);
  }
};

startServer();
