type GreetProps = {
  name?: string;
  shout?: boolean;
};

// REMEMBER: Shape ur data always in a way that it can be used without any error

export function GreetA({ name = "Guest", shout = false }: GreetProps) {
  const text = shout ? name.toUpperCase() : name;

  return <p>Hi {text}</p>;
}

export function GreetB(props: GreetProps) {
  const name = props.name ?? "Guest";
  const shout = props.shout ?? false;
  const text = shout ? name.toUpperCase() : name;

  return <p>Hi {text}</p>;
}
