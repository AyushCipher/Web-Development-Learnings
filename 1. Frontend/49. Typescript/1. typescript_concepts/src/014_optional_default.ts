function greetPersonOptional(name?: string): string {
  const upperRes = name ? name?.toUpperCase() : "Guest";

  return `Hello ${upperRes}`;
}

console.log(greetPersonOptional("Ayush"));
console.log(greetPersonOptional());

function greetPersonDefault(name: string = "Default"): string {
  return `Hello ${name.toUpperCase()}`;
}

console.log(greetPersonDefault("Raj"));
console.log(greetPersonDefault());

// Remember: Ordering Matters
function connect(host: string, port?: number, secure?: boolean) {
  const p = port ?? 80;
  const s = secure ?? false;

  return `Connect ${host} ${p} ${secure}`;
}

connect("localhost", 100, true);
