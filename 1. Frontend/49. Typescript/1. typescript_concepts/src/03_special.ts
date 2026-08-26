// TypeScript safety features — especially how to avoid runtime errors by using the type system properly:


// strictNullChecks: true            -> makes null and undefined their own types and not assignable to other types unless explicitly allowed. This helps catch potential null/undefined errors at compile time.              
// let title : string = "intro"
// title = undefined

let subtitle: string | undefined = "ayush";

// void: function doesn't return a useful value
function log(msg: string): void {
  console.log(msg);
}

// never returns
function fail(msg: string): never {
  throw new Error(msg);
}

// DO NOT USE ANY  -> TRY TO IGNORE AS MUCH AS POSSIBLE BCZ NO TYPE SAFETY & BUGS ARE NOT CAUGHT AT COMPILE TIME

const valueAny: any = JSON.parse('{"x" : 1}');

valueAny.notThere.toFixed(2); // this compiles but can break/explode at runtime since valueAny.notThere -> undefined and undefined.toFixed -> error

const value: unknown = JSON.parse('{"x":1}');     // Forces you to check type before using


