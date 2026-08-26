// Ways to store key–value data in TypeScript:

// 1. Index Signature (Flexible object) 
type NumberDict = { [k: string]: number };

const counters: NumberDict = {};

counters["Likes"] = 1;
counters["Comments"] = 2;
counters["shares"] = 100;

// Usage of Index signature = dynamic object (keys unknown in advance)

// Alternative way to index signatures using Record utility type:
type Metrices = Record<"likes" | "views" | "shares", number>; // more tight and safer
const mm: Metrices = { likes: 1, views: 100, shares: 23 };

// Usage of Record = fixed keys → safer than index signature

const priceMap = new Map<string, number>();
priceMap.set("likes", 1);

type LooseMap = Record<string, number | undefined>;
const lm: LooseMap = {};
lm["x"] = undefined;
lm["y"] = 100;

// Usage of LooseMap = When values may or may not exist

