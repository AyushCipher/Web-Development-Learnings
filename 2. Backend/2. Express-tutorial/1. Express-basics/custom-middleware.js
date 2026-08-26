// Standalone demo (run with `npm run custom-middleware`) - all 5 files in
// this folder hardcode port 3000, so only run one at a time.
const express = require("express");
const app = express();

// A minimal request logger - the same shape as popular logging middleware
// like `morgan`, just hand-written to show what they do under the hood.
const requestTimestampLogger = (req, res, next) => {
  const timeStamp = new Date().toISOString();           // // Creating current timestamp in ISO date-time format

  console.log(`${timeStamp} from ${req.method} to ${req.url}`);
  next();
};

app.use(requestTimestampLogger);

app.get("/", (req, res) => {
  res.send("Home page");
});

app.get("/about", (req, res) => {
  res.send("About page");
});

app.listen(3000, () => {
  console.log(`Server is now running on port 3000`);
});
