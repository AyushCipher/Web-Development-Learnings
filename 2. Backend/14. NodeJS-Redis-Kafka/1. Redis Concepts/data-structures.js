const redis = require("redis");

const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

// event listener
client.on("error", (error) =>
  console.log("Redis client error occured!", error)
);

async function redisDataStructures() {
  try {
    await client.connect();

    console.log("\n REDIS DATA STRUCTURES - INTERMEDIATE LEVEL \n");



    // 1. STRINGS - Intermediate Operations
    console.log("1. STRINGS - Basic and Intermediate Operations");

    // SET & GET
    await client.set("user:name", "Ayush Verma");
    const name = await client.get("user:name");
    console.log("GET user:name =>", name);

    // APPEND - Add to existing string
    await client.append("user:name", " - Developer");
    const appendedName = await client.get("user:name");
    console.log("APPEND result =>", appendedName);

    // STRLEN - Get length of string
    // strLen (camelCase), not strlen - same convention as hGet/lPush/sAdd
    // elsewhere in this file (redis v4's client camelCases every
    // multi-word command; only single-word ones like get/set stay lowercase).
    const nameLength = await client.strLen("user:name");
    console.log("STRLEN =>", nameLength);

    // GETRANGE - Get substring
    const substring = await client.getRange("user:name", 0, 4);
    console.log("GETRANGE (0-4) =>", substring);

    // SETRANGE - Replace part of string
    await client.setRange("user:name", 0, "Raj");
    const replacedName = await client.get("user:name");
    console.log("SETRANGE result =>", replacedName);

    // MSET & MGET - Multiple operations
    await client.mSet([
      "user:email", "ayush@gmail.com",
      "user:age", "21",
      "user:country", "India",
    ]);
    const [email, age, country] = await client.mGet([
      "user:email", "user:age", "user:country",
    ]);
    console.log("MGET result =>", { email, age, country });

    // INCR & DECR - Numeric operations
    await client.set("page:views", "100");
    await client.incr("page:views");
    const viewsAfterIncr = await client.get("page:views");
    console.log("INCR page:views =>", viewsAfterIncr);

    // INCRBY & DECRBY - Increment/decrement by value
    await client.incrBy("page:views", 5);
    const viewsAfterIncrBy = await client.get("page:views");
    console.log("INCRBY (5) =>", viewsAfterIncrBy);

    await client.decrBy("page:views", 3);
    const viewsAfterDecrBy = await client.get("page:views");
    console.log("DECRBY (3) =>", viewsAfterDecrBy);

    // INCRBYFLOAT - Increment by floating point
    await client.set("product:price", "99.99");
    await client.incrByFloat("product:price", 10.50);
    const newPrice = await client.get("product:price");
    console.log("INCRBYFLOAT result =>", newPrice);

    // GETEX - Get with expiration
    await client.set("session:token", "abc123xyz");
    await client.expire("session:token", 60); // Expire in 60 seconds
    const ttl = await client.ttl("session:token");
    console.log("TTL (Time To Live) =>", ttl, "seconds");

    // SETNX - Set if not exists
    const setResult = await client.setNX("unique:key", "value1");
    console.log("SETNX (first time) =>", setResult);
    const setResult2 = await client.setNX("unique:key", "value2");
    console.log("SETNX (second time - fails) =>", setResult2);

    await client.del("user:name", "page:views", "product:price", "session:token", "unique:key");
    console.log("\n");




    // 2. LISTS - Intermediate Operations
    console.log("2. LISTS - Basic and Intermediate Operations");

    // LPUSH & RPUSH - Push from left and right
    await client.lPush("tasks", ["Task 1", "Task 2", "Task 3"]);
    await client.rPush("tasks", "Task 4", "Task 5");
    const allTasks = await client.lRange("tasks", 0, -1);
    console.log("List after LPUSH & RPUSH =>", allTasks);

    // LLEN - Get list length
    const listLength = await client.lLen("tasks");
    console.log("LLEN =>", listLength);

    // LINDEX - Get element at index
    const firstTask = await client.lIndex("tasks", 0);
    console.log("LINDEX (0) =>", firstTask);

    const lastTask = await client.lIndex("tasks", -1);
    console.log("LINDEX (-1) =>", lastTask);

    // LSET - Set value at index
    await client.lSet("tasks", 0, "Updated Task 1");
    const updatedList = await client.lRange("tasks", 0, -1);
    console.log("After LSET =>", updatedList);

    // LINSERT - Insert before/after element
    await client.lInsert("tasks", "BEFORE", "Task 4", "Task 3.5");
    const listAfterInsert = await client.lRange("tasks", 0, -1);
    console.log("After LINSERT =>", listAfterInsert);

    // LPOP & RPOP - Remove from left and right
    const poppedLeft = await client.lPop("tasks");
    console.log("LPOP =>", poppedLeft);

    const poppedRight = await client.rPop("tasks");
    console.log("RPOP =>", poppedRight);

    // LTRIM - Keep only range
    await client.lPush("queue", ["Job1", "Job2", "Job3", "Job4", "Job5"]);
    await client.lTrim("queue", 0, 2);
    const trimmedList = await client.lRange("queue", 0, -1);
    console.log("After LTRIM (keep 0-2) =>", trimmedList);

    // LRANGE with pagination
    await client.del("items");
    await client.rPush("items", "Item1", "Item2", "Item3", "Item4", "Item5");
    const page1 = await client.lRange("items", 0, 1);
    const page2 = await client.lRange("items", 2, 3);
    console.log("Pagination - Page 1 =>", page1);
    console.log("Pagination - Page 2 =>", page2);

    await client.del("tasks", "queue", "items");
    console.log("\n");




    // 3. SETS - Intermediate Operations
    console.log("3. SETS - Basic and Intermediate Operations");

    // SADD & SMEMBERS - Add to set and get all members
    await client.sAdd("user:interests", ["JavaScript", "Python", "NodeJS"]);
    const interests = await client.sMembers("user:interests");
    console.log("SADD & SMEMBERS =>", interests);

    // SCARD - Count members in set
    const interestCount = await client.sCard("user:interests");
    console.log("SCARD =>", interestCount);

    // SISMEMBER - Check if member exists
    const hasJavaScript = await client.sIsMember("user:interests", "JavaScript");
    console.log("SISMEMBER (JavaScript) =>", hasJavaScript);

    const hasPHP = await client.sIsMember("user:interests", "PHP");
    console.log("SISMEMBER (PHP) =>", hasPHP);

    // SREM - Remove member
    await client.sRem("user:interests", "Python");
    const afterRemove = await client.sMembers("user:interests");
    console.log("After SREM =>", afterRemove);

    // SPOP - Remove and return random member
    await client.sAdd("lottery:tickets", ["T1", "T2", "T3", "T4", "T5"]);
    const winner = await client.sPop("lottery:tickets");
    console.log("SPOP (random) =>", winner);

    // SRANDMEMBER - Get random members without removing
    const randomTickets = await client.sRandMember("lottery:tickets", 2);
    console.log("SRANDMEMBER (2 random) =>", randomTickets);

    // Set operations - SUNION (union of sets)
    await client.sAdd("fruits:red", ["apple", "strawberry"]);
    await client.sAdd("fruits:yellow", ["banana", "lemon"]);
    const allFruits = await client.sUnion(["fruits:red", "fruits:yellow"]);
    console.log("SUNION =>", allFruits);

    // SINTER - Intersection
    await client.sAdd("online:users", ["user1", "user2", "user3"]);
    await client.sAdd("active:users", ["user2", "user3", "user4"]);
    const activeOnline = await client.sInter(["online:users", "active:users"]);
    console.log("SINTER (both online AND active) =>", activeOnline);

    // SDIFF - Difference
    const onlineNotActive = await client.sDiff(["online:users", "active:users"]);
    console.log("SDIFF (online but NOT active) =>", onlineNotActive);

    // SMOVE - Move member between sets
    await client.sMove("fruits:red", "fruits:yellow", "apple");
    const yellowFruits = await client.sMembers("fruits:yellow");
    console.log("After SMOVE =>", yellowFruits);

    await client.del("user:interests", "lottery:tickets", "fruits:red", "fruits:yellow", "online:users", "active:users");
    console.log("\n");




    // 4. SORTED SETS - Intermediate Operations
    console.log("4. SORTED SETS - Basic and Intermediate Operations");

    // ZADD & ZRANGE - Add to sorted set and retrieve
    await client.zAdd("leaderboard", [
      { score: 100, value: "Player1" },
      { score: 150, value: "Player2" },
      { score: 80, value: "Player3" },
      { score: 200, value: "Player4" },
    ]);
    const leaderboard = await client.zRange("leaderboard", 0, -1);
    console.log("ZRANGE =>", leaderboard);

    // ZRANGE with scores
    const leaderboardWithScores = await client.zRangeWithScores("leaderboard", 0, -1);
    console.log("ZRANGE with scores =>", leaderboardWithScores);

    // ZREVRANGE - Reverse order. ZREVRANGE was deprecated in favor of
    // `ZRANGE key min max REV` starting Redis 6.2, so node-redis v4 dropped
    // the zRevRange() wrapper entirely - on a Redis server older than 6.2
    // (this one included; check with `INFO server`), the REV option to
    // zRange() isn't understood either, so sendCommand() is the only way
    // left to reach it: an escape hatch for any raw command the wrapper
    // doesn't (or, here, no longer) expose as its own method.
    const topPlayers = await client.sendCommand(["ZREVRANGE", "leaderboard", "0", "2"]);
    console.log("ZREVRANGE (top 3) =>", topPlayers);

    // ZSCORE - Get score of member
    const playerScore = await client.zScore("leaderboard", "Player2");
    console.log("ZSCORE (Player2) =>", playerScore);

    // ZRANK - Get rank of member (ascending)
    const playerRank = await client.zRank("leaderboard", "Player2");
    console.log("ZRANK (Player2) =>", playerRank + 1); // +1 because rank is 0-based

    // ZREVRANK - Get rank in reverse order
    const playerRevRank = await client.zRevRank("leaderboard", "Player2");
    console.log("ZREVRANK (Player2) =>", playerRevRank + 1);

    // ZCARD - Count members
    const playerCount = await client.zCard("leaderboard");
    console.log("ZCARD =>", playerCount);

    // ZCOUNT - Count by score range
    const countInRange = await client.zCount("leaderboard", 100, 150);
    console.log("ZCOUNT (100-150) =>", countInRange);

    // ZRANGEBYSCORE - Get members in score range
    const playersInRange = await client.zRangeByScore("leaderboard", 100, 150);
    console.log("ZRANGEBYSCORE (100-150) =>", playersInRange);

    // ZINCRBY - Increment score
    await client.zIncrBy("leaderboard", 50, "Player3");
    const updatedScore = await client.zScore("leaderboard", "Player3");
    console.log("After ZINCRBY (50) =>", updatedScore);

    // ZREM - Remove member
    await client.zRem("leaderboard", "Player1");
    const afterZRem = await client.zCard("leaderboard");
    console.log("After ZREM - Total members =>", afterZRem);

    // Real-world example: Product ratings by score
    await client.zAdd("products:ratings", [
      { score: 4.5, value: "Product A" },
      { score: 3.8, value: "Product B" },
      { score: 4.9, value: "Product C" },
      { score: 4.2, value: "Product D" },
    ]);
    // zRevRangeWithScores() doesn't exist either (same ZREVRANGE deprecation
    // as above) - sendCommand's raw WITHSCORES reply is a flat
    // [member, score, member, score, ...] array, so it's paired back up here
    // into the {value, score} shape zRangeWithScores() normally returns, to
    // stay consistent with that shape used earlier in this file.
    const topRatedRaw = await client.sendCommand(["ZREVRANGE", "products:ratings", "0", "1", "WITHSCORES"]);
    const topRated = [];
    for (let i = 0; i < topRatedRaw.length; i += 2) {
      topRated.push({ value: topRatedRaw[i], score: Number(topRatedRaw[i + 1]) });
    }
    console.log("Top 2 rated products =>", topRated);

    await client.del("leaderboard", "products:ratings");
    console.log("\n");




    // 5. HASHES - Intermediate Operations
    console.log("5. HASHES - Basic and Intermediate Operations");

    // HSET - Set hash fields
    await client.hSet("product:1", {
      name: "Laptop",
      description: "High-performance laptop",
      rating: "5",
      price: "899.99",
      inStock: "true",
    });
    console.log("HSET - Product created");

    // HGET - Get single field
    const productRating = await client.hGet("product:1", "rating");
    console.log("HGET (rating) =>", productRating);

    // HGETALL - Get all fields
    const productDetails = await client.hGetAll("product:1");
    console.log("HGETALL =>", productDetails);

    // HMGET - Get multiple fields
    // Named productName/price here (not name/price) - `name` was already
    // declared earlier in this same function scope (STRINGS section, line
    // ~26); JS doesn't allow redeclaring a const/let in the same scope, so
    // reusing "name" here was a SyntaxError that failed to even parse, let
    // alone run, this entire file.
    // hmGet (lowercase "m"), not hMGet - an inconsistency in this client's
    // own naming scheme (most multi-word commands are fully camelCased, but
    // this one isn't) worth knowing about rather than guessing.
    const [productName, price] = await client.hmGet("product:1", ["name", "price"]);
    console.log("HMGET (name, price) =>", { productName, price });

    // HKEYS - Get all field names
    const fieldNames = await client.hKeys("product:1");
    console.log("HKEYS =>", fieldNames);

    // HVALS - Get all values
    const fieldValues = await client.hVals("product:1");
    console.log("HVALS =>", fieldValues);

    // HLEN - Count fields
    const fieldCount = await client.hLen("product:1");
    console.log("HLEN =>", fieldCount);

    // HEXISTS - Check if field exists
    const hasName = await client.hExists("product:1", "name");
    console.log("HEXISTS (name) =>", hasName);

    const hasDiscount = await client.hExists("product:1", "discount");
    console.log("HEXISTS (discount) =>", hasDiscount);

    // HDEL - Delete field
    await client.hDel("product:1", "inStock");
    const afterDelete = await client.hGetAll("product:1");
    console.log("After HDEL =>", afterDelete);

    // HINCRBY - Increment numeric field
    await client.hSet("product:reviews", "count", "100");
    await client.hIncrBy("product:reviews", "count", 5);
    const reviewCount = await client.hGet("product:reviews", "count");
    console.log("After HINCRBY (5) =>", reviewCount);

    // HINCRBYFLOAT - Increment float field
    await client.hSet("product:stats", "avgRating", "4.5");
    await client.hIncrByFloat("product:stats", "avgRating", 0.3);
    const avgRating = await client.hGet("product:stats", "avgRating");
    console.log("After HINCRBYFLOAT (0.3) =>", avgRating);

    // HSETNX - Set if field not exists
    const setResult1 = await client.hSetNX("product:1", "category", "Electronics");
    console.log("HSETNX (new field) =>", setResult1);

    // Named existingFieldResult here, not setResult2 - that name was already
    // used earlier in this function (STRINGS/SETNX section, line ~88), and
    // JS doesn't allow redeclaring a const in the same scope.
    const existingFieldResult = await client.hSetNX("product:1", "name", "Desktop");
    console.log("HSETNX (existing field) =>", existingFieldResult);

    // Real-world example: User profile hash
    await client.hSet("user:100", {
      username: "john_doe",
      email: "john@example.com",
      createdAt: "2024-01-15",
      lastLogin: "2024-01-20",
      followerCount: "150",
      postCount: "45",
    });

    const userProfile = await client.hGetAll("user:100");
    console.log("User profile (complete) =>", userProfile);

    // Get specific user info
    const userName = await client.hGet("user:100", "username");
    const followers = await client.hGet("user:100", "followerCount");
    console.log("User info =>", { username: userName, followers });

    // Increment follower count
    await client.hIncrBy("user:100", "followerCount", 10);
    const updatedFollowers = await client.hGet("user:100", "followerCount");
    console.log("After gaining 10 followers =>", updatedFollowers);

    await client.del("product:1", "product:reviews", "product:stats", "user:100");
    console.log("\n");




    // 6. PRACTICAL EXAMPLES - Real-world scenarios
    console.log("6. PRACTICAL EXAMPLES - Real-world Scenarios");

    // Example 1: Shopping Cart (Hash)
    console.log("Example 1: Shopping Cart");
    await client.hSet("cart:user123", {
      item1: "MacBook",
      item2: "iPhone",
      item3: "AirPods",
      total: "2999",
    });
    const cart = await client.hGetAll("cart:user123");
    console.log("Cart items =>", cart);

    // Example 2: Message Queue (List)
    console.log("\nExample 2: Message Queue");
    await client.rPush("message:queue", 
      "Message 1", 
      "Message 2", 
      "Message 3"
    );
    const queueLength = await client.lLen("message:queue");
    console.log("Queue length =>", queueLength);
    const firstMessage = await client.lIndex("message:queue", 0);
    console.log("First message =>", firstMessage);

    // Example 3: Tags/Categories (Set)
    console.log("\nExample 3: Blog Tags");
    await client.sAdd("blog:post123:tags", ["JavaScript", "NodeJS", "Database"]);
    const blogTags = await client.sMembers("blog:post123:tags");
    console.log("Blog tags =>", blogTags);

    // Example 4: Real-time Scores (Sorted Set)
    console.log("\nExample 4: Live Game Scores");
    await client.zAdd("game:scores", [
      { score: 1250, value: "Alice" },
      { score: 1100, value: "Bob" },
      { score: 980, value: "Charlie" },
    ]);
    // Same ZREVRANGE-via-sendCommand pattern as the "top rated products"
    // example above.
    const topScoreRaw = await client.sendCommand(["ZREVRANGE", "game:scores", "0", "0", "WITHSCORES"]);
    const topScore = [{ value: topScoreRaw[0], score: Number(topScoreRaw[1]) }];
    console.log("Current leader =>", topScore);

    await client.del("cart:user123", "message:queue", "blog:post123:tags", "game:scores");
    console.log("\n END OF INTERMEDIATE EXAMPLES \n");

  } catch (e) {
    console.error("Error occurred:", e);
  } finally {
    await client.quit();
  }
}

redisDataStructures();
