import { createContext, useContext, useState, type ReactNode } from "react";

export type GlobalType = {
  flag: string;
  setFlag: (c: string) => void;
};

export const MyGlobalContext = createContext<GlobalType>({
  flag: "Hello world",
  setFlag: () => {},
});

export const useGlobalContext = () => useContext(MyGlobalContext);

export function GlobalState({ children }: { children: ReactNode }) {
  const [flag, setFlag] = useState("");
  return (
    <MyGlobalContext.Provider value={{ flag, setFlag }}>
      {children}
    </MyGlobalContext.Provider>
  );
}
