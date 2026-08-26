// Create a list of values → automatically derive a type from it:

const ROLES = ["admin", "user", "operator"] as const;
// as const -> It makes the array: readonly ["admin", "user", "operator"] , i.e, Each element becomes a literal type rather than just string

// derive a union from the array
type Role = (typeof ROLES)[number];

function setRole(r: Role) {
  console.log(r);
}

setRole("user");
