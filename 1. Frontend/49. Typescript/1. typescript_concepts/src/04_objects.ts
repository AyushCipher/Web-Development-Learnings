// Understanding TypeScript Object Types: Optional Properties, Readonly Fields, and Key Mapping:

// email? : string  -> email may be absent , if its present it will be string
// it is not same as email : string | undefined


// type is used to create a custom name for a data structure
type User = {
  id: number; // required
  name: string;
  email?: string; // optional (could be absent but not undefined), if present it will be string
  readonly createdAt: Date; // can not be reassigned
};

const user1: User = { id: 1, name: "ayush", createdAt: new Date() };
const user2: User = {
  id: 2,
  name: "anish",
  createdAt: new Date(),
  email: "email",
};

// user1.createdAt = new Date()     -> gives error since createdAt is readonly

type User2 = { email?: string };    
type User3 = { email: string | undefined };     

type Count = { [k: string]: number };    // index signature - we can use ANY string as key, and value must be a number       
type Count1 = Record<"likes" | "views" | "shares" | "random", number>;    // Record is a utility type telling these EXACT keys must exist, and each must have number value

const c1: Count = { whatever: 1 };
const c2: Count1 = { likes: 1, views: 2, shares: 3, random: 5 };
