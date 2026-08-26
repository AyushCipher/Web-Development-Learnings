import { useState } from "react";

export function Counter() {
  const [count, _setCount] = useState(0); // inferred as a number

  return <div>{count}</div>;
}

// idle, loading, success, error

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; message: string };

function heavyDefault(): number {
  return 100;
}

type User = {
  name: string;
};

export function LoaderDemo() {
  const [_state, _setState] = useState<LoadState>({ status: "idle" });
  const [_n, _setN] = useState<number>(() => heavyDefault());

//const [user, setUser] =  useState(null) // inferred as null, not good
  const [_user, _setUser] = useState<User | null>(null);

  // async function _fetchData() {
  //   _setState({ status: "loading" });
  //   // mock api call
  //   _setState({ status: "success", data: "fetched" });
  //   // catch
  //   _setState({ status: "error", message: "error!" });
  // }

  return <div>Loader</div>;
}
