// Literal types vs Type widening (const vs let behavior):


// A literal type represents an exact specific value, not a general type(eg: string).

type Direction = "left" | "right" | "up";       
// This is a union of string literals meaning Direction can ONLY be: "left" or "right" or "up"

function move(d: Direction) {
  console.log(d);
}

const d1 = "left"; // TS keeps literal type "left"
move(d1);

// TypeScript looks at how the variable is declared since bcz const = value will never change so does not broaden it 
// So TS thinks: This variable is permanently 'left', therefore it assigns the most specific type possible: d1: "left"

let d2 = "left"; // TS widens to string
// move(d2)

let d3: Direction = "left";

move(d3);
