// Basic Express Server - standalone demo (run with `npm start`).
// All 5 files in this folder hardcode port 3000, so only run one at a time.
const express = require("express");

const app = express();

// Home Route: Handles GET request on "/"
app.get("/", (req, res) => {
  res.send("Hello world");      //   // Sends response back to browser/client
});

const port = 3000;              // Server Port

// Starting Express Server: Server starts listening for incoming requests on port 3000
app.listen(port, () => {
  console.log(`Server is now running at port ${port}`);
});
