// The real practical difference between interface and type:

// interface -> object shapes that you expect to extend
// supports declaration merging

// types -> more general -> objects, unions, intersections, functions
// can not be reopened -> no merging; It is fixed and more flexible

interface Box1 {
  width: number;
}

interface Box1 {
  height: number;
}
// can reopen interface to add more properties with interfaces

const boxDemo: Box1 = { width: 10, height: 10 };


// type Bag = {size : number}
// type Bag = {color : string}
// cant redeclare type alias name


// Feature	          Interface	        Type
// Reopen / merge	    ✅ YES	          ❌ NO
// Extend	            extends	            &
// Flexibility	     Objects only	      Anything
// Use case	      evolving structures	 fixed + complex types
