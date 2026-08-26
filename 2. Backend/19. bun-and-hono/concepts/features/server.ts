import type { Server } from "bun";

interface User {
  id: number;
  name: string;
}

interface ApiResponse {
  message: string;
  method: string;
  route: string;
  data?: User | User[];
}

const users: User[] = [
  {
    id: 1,
    name: "John",
  },
  {
    id: 2,
    name: "raj",
  },
  {
    id: 3,
    name: "Sangam",
  },
  {
    id: 4,
    name: "John4",
  },
  {
    id: 5,
    name: "John5",
  },
];

const server: Server = Bun.serve({
  port: 3000,
  fetch(req: Request): Response {
    const url = new URL(req.url);
    const method = req.method;

    let response: ApiResponse = {
      message: "Hello from Bun server!",
      method: method,
      route: url.pathname,
    };

    if (url.pathname === "/") {
      //root route
      if (method === "GET") {
        response.message = "Welcome to Bun API!";
      } else {
        response.message = "method not allowed for this route";
      }
    } else if (url.pathname === "/users") {
      switch (method) {
        case "GET":
          response.message = "fetching all users";
          response.data = users;

          break;

        case "POST":
          response.message = "Creating a new user";

          break;

        default:
          response.message = "method not allowed for this route";
          break;
      }
    }

    return Response.json(response);
  },
});

console.log(`Bun server is running on http://localhost:${server.port}`);
