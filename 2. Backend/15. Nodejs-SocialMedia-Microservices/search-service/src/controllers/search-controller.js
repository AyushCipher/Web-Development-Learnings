const Search = require("../models/Search");
const logger = require("../utils/logger");

const searchPostController = async (req, res) => {
  logger.info("Search endpoint hit!");
  try {
    const { query } = req.query;

    // Q. Why cache search results at all, given they come from a MongoDB $text index query rather
    // than a slow external call?
    // ANS: Re-running a text-index search for the same popular query on every request still adds
    // up, and unlike something like a like count, search results don't need to be instantaneously
    // fresh — a few minutes of staleness is a fine tradeoff for the reduced query load, hence the
    // short cache-aside TTL below.
    const cacheKey = `search:${query}`;
    const cachedResults = await req.redisClient.get(cacheKey);

    if (cachedResults) {
      return res.json(JSON.parse(cachedResults));
    }

    const results = await Search.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    // cache the results for 5 minutes
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(results));

    res.json(results);
  } catch (e) {
    logger.error("Error while searching post", e);
    res.status(500).json({
      success: false,
      message: "Error while searching post",
    });
  }
};

module.exports = { searchPostController };
