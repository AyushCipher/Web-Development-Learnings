const redis = require("../config/redis");
const Product = require("../models/Product");

const PRODUCTS_LIST_KEY = "products:all";
const PRODUCT_TTL_SECONDS = 60;

function productKey(id) {
  return `product:${id}`;
}

// Q. WHAT IS "CACHE-ASIDE" AND WHY DOES THE APP CODE CHECK REDIS ITSELF
//    INSTEAD OF SOMETHING DOING IT AUTOMATICALLY?
// ANS: Cache-aside just means: on a read, check the cache first; if it's
// there (a "hit") return it and skip the database entirely; if it's not (a
// "miss") read from the real database, THEN write that result into the
// cache so the next read is a hit. The app has to do this explicitly
// because only the app knows what a "product list" or "one product" even
// means - Redis is just a key/value store, it has no idea what Mongo's
// data looks like.
async function listProducts(req, res) {
  try {
    const cached = await redis.get(PRODUCTS_LIST_KEY);
    if (cached) {
      console.log("[CACHE HIT] products:all");
      return res.json({ success: true, products: JSON.parse(cached) });
    }

    console.log("[CACHE MISS] products:all - querying MongoDB");
    const products = await Product.find({});
    await redis.set(PRODUCTS_LIST_KEY, JSON.stringify(products), "EX", PRODUCT_TTL_SECONDS);

    return res.json({ success: true, products });
  } catch (error) {
    console.error("List products error", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function getProduct(req, res) {
  try {
    const { id } = req.params;
    const key = productKey(id);

    const cached = await redis.get(key);
    if (cached) {
      console.log(`[CACHE HIT] ${key}`);
      return res.json({ success: true, product: JSON.parse(cached) });
    }

    console.log(`[CACHE MISS] ${key} - querying MongoDB`);
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await redis.set(key, JSON.stringify(product), "EX", PRODUCT_TTL_SECONDS);
    return res.json({ success: true, product });
  } catch (error) {
    console.error("Get product error", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// A write needs to invalidate the cache it affects, or callers would keep
// seeing stale data until the TTL happens to run out. Only the LIST key
// needs invalidating here - a brand new product has no individual
// product:<id> cache entry yet for anyone to see stale.
async function createProduct(req, res) {
  try {
    const { name, description, price, stock } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: "name and price are required" });
    }

    const product = await Product.create({ name, description, price, stock });

    await redis.del(PRODUCTS_LIST_KEY);
    console.log("[CACHE INVALIDATED] products:all");

    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("Create product error", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { listProducts, getProduct, createProduct };
