// Unsafe type assertion vs Safe type checking (type guards):


// Type assertion tells TypeScript: “Trust me, I know the type better than you.” Type assertion overrides TypeScript’s inferred type.

const raw = '{"id" : 1, "name" : "A"}';       // This is just a string

const riskyUser = JSON.parse(raw) as { id: number; name: string };
// It's an unsafe way since JSON.parse(raw) → returns any and we are forcing it: Trust me, this is a User object

console.log(riskyUser.name);    
// Works ONLY if data is correct, for wrong data: const raw = '{"id":"wrong","name":123}'; - itstill compiles but runtime may break



type User22 = { id: number; name: string };

function isUser(v: unknown): v is User22 {
  return (
    typeof v === "object" &&
    v !== null &&
    "id" in v &&
    typeof (v as any).id === "number" &&        // (v as any).id -> Get the id property from v (without safety)
    "name" in v &&
    typeof (v as any).name === "string"
  );
}

const maybe = JSON.parse(raw) as unknown;
if (isUser(maybe)) {
  console.log(maybe.name); // safe
}
