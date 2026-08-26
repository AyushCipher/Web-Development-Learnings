/**
 * ===========================================
 *  TypeSafe User Manager
 *  Starter File
 *  -------------------------------------------
 *  Goal:
 *  Build a simple “User Manager” using TypeScript.
 *  Practice core concepts: types, interfaces, generics,
 *  utility types, and type narrowing.
 *
 *  Instructions:
 *  Follow each step below.
 *  Replace comments with your own code.
 *  Save and run `tsc user-manager.ts --noEmit` to check
 *  that your file has zero type errors ✅
 * ===========================================
 */

// -------------------------------------------
// Step 1: Define your User type or interface
// -------------------------------------------

// Example hint: include fields like id, name, email, and isAdmin.
// Use optional (?) and readonly properties if needed.
// interface User { ... }

// -------------------------------------------
// Step 2: Create a list (array) of users
// -------------------------------------------

// Example hint: create 2–3 user objects inside an array.
// const users: User[] = [ ... ];

// -------------------------------------------
// Step 3: Write a generic helper function
// -------------------------------------------

// Goal: A reusable function that can return a property from any object.
// Hint: You’ll need a generic <T> and a constraint <K extends keyof T>.
// function getProp<T, K extends keyof T>(obj: T, key: K) { ... }

// -------------------------------------------
// Step 4: Use a built-in utility type
// -------------------------------------------

// Try one of these: Readonly<T>, Partial<T>, Pick<T, K>, Omit<T, K>.
// Create a new type based on your User type and log an example value.

// -------------------------------------------
// Step 5: Add a control-flow narrowing example
// -------------------------------------------

// Create a function that checks if a user exists before using it.
// Example idea: printUser(user: User | null)

// -------------------------------------------
// Step 6: Test your functions and types
// -------------------------------------------

// Call your helper and narrowing functions with real values.
// Use console.log() to verify outputs and let TypeScript infer types.

// -------------------------------------------
// Step 7: Add your signature (optional)
// -------------------------------------------

// Example:
// // My TypeSafe User Manager - by [Your Name]
