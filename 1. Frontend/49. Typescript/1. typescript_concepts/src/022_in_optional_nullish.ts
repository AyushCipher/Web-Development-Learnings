// union type narrowing + safe property access + ?? vs ||

type InExample1 = { role: "Admin"; permissions: string[] };
type InExample2 = { role: "User"; expiresAt: Date };

type UserExample = InExample1 | InExample2;

function describeUserExample(u: UserExample) {
  if ("permissions" in u) {
    return `Admin ${u.permissions.join(",")}`;
  }

  return `User ${u.expiresAt.toISOString()}`;
}

console.log(describeUserExample({ role: "Admin", permissions: ["read"] }));
// "in" operator helps distinguish between union types


// To avoid runtimes crashes:
// ?? and || -> default values for missing properties
// obj?.a  -> If obj is null or undefined then returns undefined, else returns obj.a, helps prevent runtime crashes for missing properties

type ProfileN3 = {
  name: string;
  contact?: { email?: string };
};

const P1N3: ProfileN3 = { name: "John" };
const P2N3: ProfileN3 = { name: "Ben", contact: { email: "ben123@gmail.com" } };

const email1N3 = P1N3.contact?.email;
const email2N3 = P2N3.contact?.email;

// Nullish Coalescing(??) -> uses the right hand default only when the left is null or undefined
// OR(||) -> uses the default when the left is any falsy value (0, "", null, undefined, NaN)

const countFromServerN3: number | null = 0;
const labelFromServerN3: string | undefined = "";

const aN3 = countFromServerN3 ?? 100; // keeps the 0
const bN3 = countFromServerN3 || 100; // keeps the 100

console.log(aN3, bN3);
