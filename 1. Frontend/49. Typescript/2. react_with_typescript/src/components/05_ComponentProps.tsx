// Resuse

import type { ComponentProps, CSSProperties } from "react";

type ButtonBaseProps = ComponentProps<"button">;
type ButtonProps = ButtonBaseProps & { variant?: "primary" | "secondary" };

export function Button({ variant = "primary", style, ...rest }: ButtonProps) {
  const base: CSSProperties = {
    padding: "10px",
  };

  return <button style={{ ...base, ...style }} {...rest} />;
}


// CSSProperties is a TypeScript type used in React to define inline styles safely.
// ComponentProps is a utility type from React that lets you extract the props of an HTML element or component.