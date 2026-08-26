import { useRef, useState, type FormEvent } from "react";

function getString(fd: FormData, key: string): string | null {
  const result = fd.get(key);

  return typeof result === "string" ? result : null;
}

function getNumberValue(fd: FormData, key: string): number | null {
  const extractStringValueFirst = getString(fd, key);

  if (extractStringValueFirst === null) return null;

  const convertToNumber = Number(extractStringValueFirst);

  return Number.isFinite(convertToNumber) ? convertToNumber : null;
}

export function UncontrolledForm() {
  const [val, _setVal] = useState<string | undefined>(undefined);

  const formRef = useRef<HTMLFormElement | null>(null);

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    console.log(getNumberValue(fd, "age"));
  }

  return (
    <form onSubmit={handleFormSubmit} ref={formRef}>
      <input name="name" defaultValue="Guest" />
      <input type="number" name="age" defaultValue="18" min={0} />
      <button type="submit">Submit</button>
      <input value={val} />
    </form>
  );
}

// Q. Difference between controlled and uncontrolled componenets?

// 🔹 Controlled form:- React is the source of truth

// Flow:
// User types → onChange fires → React state updates → React re-renders → input value updated

// 👉 React is actively managing the value through state. React continuously monitors changes,
// React only updates when events like onChange fire — it doesn’t monitor automatically.


// 🔹 Uncontrolled form:- DOM is the source of truth

// Flow:
// User types → browser updates input value directly → React does nothing

// 👉 React does NOT track changes at all



// 🧠 The core idea
// The browser (DOM) already knows how to handle typing.
// You don’t need React to manage every keystroke.
// You just want the input to start with a value.

// 👉 That’s exactly what defaultValue does.

// 🔍 Example
// <input defaultValue="Ayush" />

// 👉 What happens:

// React sets initial value = "Ayush"
// After that → browser takes over
// User types → input updates automatically (no React involved)
