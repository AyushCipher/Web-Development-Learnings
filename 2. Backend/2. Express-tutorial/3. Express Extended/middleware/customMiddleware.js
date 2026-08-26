const requestLogger = (req, res, next) => {
  const timeStamp = new Date().toISOString();     // Generates current date-time helping to track when the request was made, debugging, monitoring server activity
  const method = req.method;                      // Extracts request method(GET, POST, etc.) to understand the type of request being made, which is crucial for routing and handling logic
  const url = req.url;                            // Extracts requested URL path to identify which endpoint is being accessed
  const userAgent = req.get("User-Agent");        // Extracts User-Agent header to identify the client making the request (browser, operating system, mobile app, etc.) 
  console.log(`[${timeStamp}] ${method} ${url} - ${userAgent}`);
  next();
};

const addTimeStamp = (req, res, next) => {
  req.timeStamp = new Date().toISOString();       // Adds a custom property 'timeStamp' to the request object, which can be accessed in any subsequent middleware or route handlers to know when the request was received.
  next();
};

module.exports = { requestLogger, addTimeStamp };
