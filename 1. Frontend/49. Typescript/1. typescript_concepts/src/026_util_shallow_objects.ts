// TypeScript Utility Types:

type AddressN8 = {
  line1: string;
  city: string;
};

type User10 = {
  id: string;
  name: string;
  email?: string;
  address: AddressN8;
};

// partial<T> -> make all the top level fields optional, not the nested ones
type UserPatch10 = Partial<User10>;

const patch10: UserPatch10 = { name: "Ayush" };
const patch11: UserPatch10 = { address: { line1: "line1", city: "ci" } };   
// if address mentioned then all its fields are required since Partial only makes top level fields optional


// Required<T> -> make all fields required(even optional ones)
type UserAllRequiredN10 = Required<User10>;

const userAllPatch11: UserAllRequiredN10 = {
  id: "u2",
  name: "name2",
  address: { line1: "line2", city: "ranchi" },
  email: "test123@gmail.com",
};


// Readonly<T> -> make all fields readonly (cannot be reassigned, shallow object)
type ReadOnlyUserN10 = Readonly<User10>;

const readonlyUser: ReadOnlyUserN10 = {
  id: "u3",
  name: "name",
  address: {
    line1: "line3",
    city: "city123",
  },
};
// readonlyUser.name = 'this'


// Pick<T, K> -> keep only some keys
type PublicUserN10 = Pick<User10, "id" | "name">;

const publicUser: PublicUserN10 = { id: "u5", name: "sangan34" };


// Omit<T, K> - remove some keys
type UserWithoutEmailN10 = Omit<User10, "email">;

const omitUserN10: UserWithoutEmailN10 = {
  id: "u4",
  name: "name5",
  address: {
    line1: "d",
    city: "f",
  },
};

// omitUserN10.email = "that"  -> error since email field is not present in UserWithoutEmailN10


// Record<K, V>
type RoleK = "admin" | "user" | "student";
type RoleCheck = Record<RoleK, User10>;

const dirN10: RoleCheck = {
  admin: {
    id: "u10",
    name: "admin",
    address: { line1: "line1", city: "Imphal" },
  },
  user: {
    id: "u11",
    name: "user",
    address: { line1: "line1", city: "city" } 
  },
  student: {
    id: "u12",
    name: "student",
    address: { line1: "line1", city: "ranchi" },
  },
};
