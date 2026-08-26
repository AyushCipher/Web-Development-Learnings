import express, { Express, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { IUser, User } from "./models/User";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Mongoose queues up queries (like the /users route's User.find() below)
// until a connection is established, rather than failing immediately - so
// without this connect() call, hitting /users wouldn't error, it would just
// hang forever waiting for a connection that was never opened.
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());

interface CustomRequest extends Request {
  startTime?: number;
}

// middleware -> add startTime to request
app.use((req: CustomRequest, res: Response, next: NextFunction) => {
  req.startTime = Date.now();
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello. Typescript with express");
});

app.get("/users", async (req: Request, res: Response) => {
  try {
    const users: IUser[] = await User.find();
    // BUG (fixed): this handler used to await the query and then never call
    // res.json/res.send on success - Express doesn't respond automatically,
    // so the request would just hang until the client's own timeout.
    res.json(users);
  } catch (e) {
    res.status(400).json({ message: "Some error occured!" });
  }
});


// post route -> new user -> name, email -> req.body
// Express Request Generic Structure: Request<Params, ResBody, ReqBody, Query>
// -> /user/:id?name -> Request <{}, {}, {},{}>

// Named CreateUserBody (not `User`) - the models/User.ts import above already
// brought a value called `User` (the Mongoose model) into scope; TypeScript
// keeps type-space and value-space separate so a same-named interface
// wouldn't actually be a compile error, but it reads as if this body shape
// IS the User model, when it's really just this one route's expected input.
interface CreateUserBody {
  name: string;
  email: string;
}

// Q. THIS ROUTE IMPORTS THE User MODEL AT THE TOP OF THE FILE (FOR /users
//    ABOVE) - WHY DIDN'T THE ORIGINAL VERSION USE IT HERE TOO?
// ANS: It looked like a real "create user" endpoint (imports the model,
// named /user, takes name/email) but only ever echoed the input back in a
// message string - no User.create() call, so nothing was ever persisted
// despite the 201-shaped success response. Same failure mode as this
// file's /users bug above (a route that responds successfully without
// actually doing the database work its name implies).
app.post("/user", async (req: Request<{}, {}, CreateUserBody>, res: Response) => {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    res.status(201).json({
      message: `User created ${name}-${email}`,
      user,
    });
  } catch (e) {
    res.status(400).json({ message: "Some error occured!" });
  }
});

// users based on id
app.get("/users/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  res.json({
    userId: id,
  });
});

app.listen(port, () => {
  console.log(`Server is now running on port ${port}`);
});
