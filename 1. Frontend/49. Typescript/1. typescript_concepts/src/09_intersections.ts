// Intersection types (&) and very important edge case (conflicting types):

// An intersection type combines multiple types into one.value must be everything from A and from B

type Inter1 = { id: string };
type Inter2 = { createdAt: Date };

type Entity = Inter1 & Inter2; // must have both id and createdAT

const e: Entity = { id: "e1", createdAt: new Date() };

// homework -> create two types

type NumberHolderUnique = { a: number };
type StringHolderUnique = { a: string };

// type NumberStringMix = NumberHolderUnique & NumberStringMix
// const bad : NumberStringMix = {a: 123}

type Product = { id: string; title: string };
type Priced = { price: number };

type PricedProduct = Product & Priced;
