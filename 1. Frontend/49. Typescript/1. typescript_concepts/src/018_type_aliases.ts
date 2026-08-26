// object shapes -> similar to interfaces
// union types (A | B)
// intersection types (A & B)

type Person1 = {
  id: string;
  address: string;
  salary: number;
};

const person1: Person1 = {
  id: "1",
  address: "address",
  salary: 1234,
};
// type can define object shapes (like interface)


type Status = "new" | "paid" | "pending";
// Status can ONLY be: "new" OR "paid" OR "pending", either of them but not all

function nextActionCheck(s: Status): string {
  switch (s) {
    case "new":
      return "new";
    case "paid":
      return "paid";
    case "pending":
      return "pending";

    default:
      return "default";
  }
}
// TypeScript can check exhaustiveness (all union cases handled)


type ToMerge1 = { price: number };
type ToMerge2 = { stock: number };

type MergedProductInfo = Person1 & ToMerge1 & ToMerge2;
// MergedProductInfo must have: Person1 + price + stock
