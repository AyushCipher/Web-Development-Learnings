// SERVER ACTIONS: the `"use server"` directive at the top of a file (or the
// top of a function body) marks every exported function in it as a Server
// Action - a function that always runs on the server, even when called from a
// Client Component. Next.js generates a hidden POST endpoint for it under the
// hood, so you get a type-safe RPC call without hand-writing a route handler
// AND without shipping any server logic/secrets to the browser.
// This is exactly the pattern the Blog project uses in src/actions/post-actions.ts
// (createPost/updatePost/deletePost) and Asset-manager uses in
// src/actions/dashboard-actions.ts - this file is the minimal version of that.
"use server";

import { revalidatePath } from "next/cache";

// In-memory "database" - resets whenever the dev server restarts and won't
// stay in sync across multiple server instances in production. Real apps
// persist to an actual database instead (see the Blog/Asset-manager projects,
// which use Drizzle ORM + Postgres for this exact same create-and-revalidate flow).
const messages: { id: number; text: string }[] = [
  { id: 1, text: "Welcome to the Server Actions example!" },
];

export async function getMessages() {
  return messages;
}

// A Server Action wired to a <form> (whether passed straight to
// `action={addMessage}` or wrapped via useActionState, as in message-form.tsx)
// receives a FormData object built from the form's inputs automatically - no
// onSubmit/preventDefault/fetch wiring needed, and it still works if
// JavaScript hasn't loaded yet (progressive enhancement). Returning a value
// here is optional; you only need useActionState on the caller's side if you
// want to read that returned value like message-form.tsx does.
export async function addMessage(formData: FormData) {
  const text = formData.get("text");

  if (typeof text !== "string" || text.trim().length === 0) {
    return { success: false, message: "Message can't be empty" };
  }

  messages.push({ id: Date.now(), text: text.trim() });

  // Server Components cache their rendered output. After a mutation, call
  // revalidatePath so Next.js throws away the cached HTML for that route and
  // re-renders it with fresh data on the next visit - this is what makes the
  // new message show up immediately below without a manual page refresh.
  revalidatePath("/server-actions-example");

  return { success: true, message: "Message added!" };
}
