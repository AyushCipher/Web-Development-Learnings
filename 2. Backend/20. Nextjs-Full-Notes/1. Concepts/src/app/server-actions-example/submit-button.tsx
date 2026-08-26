// A small Client Component just for the pending state. useFormStatus() only
// works inside a <form> and only reports on the form it's nested in - that's
// why this is split out from page.tsx rather than reading pending state there.
"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
    >
      {pending ? "Adding..." : "Add message"}
    </button>
  );
}
