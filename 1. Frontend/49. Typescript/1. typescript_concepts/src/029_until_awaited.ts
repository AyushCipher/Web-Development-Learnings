// Types of async values:

// Promise<T>
// nested Promise<Promise<T>>
// Thenables -> .then

// Awaited<T> = If I use await on this, what do I get?

type Promise1 = Awaited<Promise<number>>; // number
type Promise2 = Awaited<Promise<Promise<string>>>;
type Awaited1 = Awaited<string>; // it is string, but not a promise

type PromiseUnionExample = Awaited<Promise<string | number>>;

async function fetchCount() {
  return 42 as const;
}

type ResolvedFetchCountValue = Awaited<ReturnType<typeof fetchCount>>;

async function getData() {
  return Promise.all([
    Promise.resolve(1 as const),
    Promise.resolve("x" as const),
  ] as const);
}

type DataTupleWithPromise = Awaited<ReturnType<typeof getData>>;    // [1, "x"] readonly
