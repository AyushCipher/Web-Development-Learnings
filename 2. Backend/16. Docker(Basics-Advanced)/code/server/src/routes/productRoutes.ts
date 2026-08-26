import { Router, Request, Response } from "express";
import { Product } from "../models/Product.js";

const productRouter = Router();

// Newest first, so a freshly added product appears at the top of the list
// the client renders.
productRouter.get("/", async (_req: Request, res: Response) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// Q. Why re-parse/validate name/price/category here when the Mongoose schema
// (models/Product.ts) already marks them required?
// ANS: A schema-level `required: true` only rejects `undefined`/missing
// fields - it wouldn't catch an empty string "" for name/category, and
// Number(req.body.price) would need to happen somewhere anyway since JSON
// body values arrive as whatever type the client sent (a numeric-looking
// string, for instance). Doing the coercion and the "is it actually usable"
// check here means a bad request gets a clear 400 with a specific message
// instead of falling through to Mongoose's own (less friendly) validation
// error.
productRouter.post("/", async (req: Request, res: Response) => {
  const name = String(req.body.name || "").trim();
  const price = Number(req.body.price);
  const category = String(req.body.category || "").trim();

  if (!name) {
    return res.status(400).json({ message: "Product name is required" });
  }

  if (Number.isNaN(price) || price < 0) {
    return res.status(400).json({ message: "Valid price is required" });
  }

  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  const product = await Product.create({
    name,
    price,
    category,
  });

  res.status(201).json(product);
});

productRouter.delete("/:id", async (req: Request, res: Response) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  if (!deletedProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json({ message: "Product deleted successfully" });
});

export default productRouter;
