// This page itself stays a Server Component and can call the Server Action's
// sibling `getMessages()` directly during render. The interactive form is
// pushed into MessageForm (a "use client" component) because reading the
// action's return value requires the useActionState hook, which only works
// on the client.
import { getMessages } from "./actions";
import MessageForm from "./message-form";

export default async function ServerActionsExample() {
  const messages = await getMessages();

  return (
    <div className="p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Server Actions Example</h1>

      <ul className="flex flex-col gap-2 mb-6">
        {messages.map((m) => (
          <li key={m.id} className="border p-2 rounded">
            {m.text}
          </li>
        ))}
      </ul>

      <MessageForm />
    </div>
  );
}
