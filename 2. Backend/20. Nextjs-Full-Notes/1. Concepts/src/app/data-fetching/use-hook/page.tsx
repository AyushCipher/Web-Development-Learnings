// APPROACH 3 of 5 - React 19's `use()` hook.
// `use(promise)` lets a component "unwrap" a Promise during render - if it's
// still pending, React suspends the component (pauses rendering it) and shows
// the nearest <Suspense fallback>. Unlike useEffect, this works during the
// initial server render for STREAMING: the shell renders immediately, and
// UsersList streams in once usersPromise resolves.
// Note this component itself is NOT marked "use client" - `use()` works in
// both Server and Client Components, but starting the fetch (getUsers()) in
// the parent and passing the *promise* down (not the resolved data) is what
// enables the streaming behavior.
import { Suspense, use } from "react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

interface UsersResponse {
  users: User[];
}

function getUsers(): Promise<UsersResponse> {
  return fetch("https://dummyjson.com/users").then((res) => res.json());
}

function UseHookExample() {
  const usersPromise = getUsers();

  return (
    <div>
      <h1>Use Hook Example</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <UsersList usersPromise={usersPromise} />
      </Suspense>
    </div>
  );
}

function UsersList({ usersPromise }: { usersPromise: Promise<UsersResponse> }) {
  const getUsersList = use(usersPromise);

  return (
    <div>
      {getUsersList.users.map((user) => (
        <div key={user.id}>
          <p>
            {user.firstName} - {user.lastName}
          </p>
        </div>
      ))}
    </div>
  );
}

export default UseHookExample;
