"use strict";
//interface -> object shapes that you expect to extend
// supports declaration merging
//types -> more general -> objects, unions, intersections, functions
// can not be reopened -> no merging
const boxDemo = { width: 10, height: 10 };
// type Bag = {size : number}
// type Bag = {color : string}
//cant redeclare type alias name
