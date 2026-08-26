// A plain <form action={someServerAction}> (like the ones in Blog/Asset-manager's
// post-actions.ts consumers) fires the action and ignores whatever it returns -
// that's fine when the action just redirects or revalidates. Here `addMessage`
// RETURNS a { success, message } result (e.g. "Message can't be empty"), and we
// want to show that to the user - that's what useActionState is for.
"use client";

import { useActionState } from "react";
import { addMessage } from "./actions";
import SubmitButton from "./submit-button";

type ActionState = { success: boolean; message: string } | null;

export default function MessageForm() {
  // useActionState(action, initialState) wraps a Server Action and gives back:
  // - `state`: whatever the action last returned (starts as `initialState`)
  // - `formAction`: pass THIS to <form action>, not the raw server action
  // - `isPending`: true while the action is running (only visible to the
  //   component that called the hook, not to descendants - see submit-button.tsx,
  //   which reads its own pending state via useFormStatus instead, since a
  //   deeply nested button can't call useActionState itself)
  const [state, formAction] = useActionState<ActionState, FormData>(
    async (_prevState, formData) => addMessage(formData),
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          name="text"
          placeholder="Say something..."
          className="border p-2 rounded flex-1"
        />
        <SubmitButton />
      </div>
      {state && (
        <p className={state.success ? "text-green-600" : "text-red-600"}>
          {state.message}
        </p>
      )}
    </form>
  );
}
