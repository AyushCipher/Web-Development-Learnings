// This project originally targeted apollo-server-express (Apollo Server 3's
// Express integration), pinned in package.json to a "^4.10.0" that was never
// actually published - that package was discontinued when Apollo Server 4
// unified everything into @apollo/server, with framework integrations
// (Express, Fastify, etc.) split into separate @as-integrations/* adapter
// packages instead of being bundled in. Migrated here to match that current
// setup - and to match the sibling projects in this same folder ("1. basics",
// "2. mongoose-integration"), which already use @apollo/server.
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');
require('dotenv').config();

const connectDB = require('./config/db');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./resolvers/resolvers');

const app = express();

// Connect to MongoDB
connectDB();

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start server
const startServer = async () => {
  // server.start() must resolve before expressMiddleware(server) can be
  // mounted - that's why this whole setup lives inside an async function
  // instead of at the top level.
  await server.start();

  // express.json() is scoped to just this route (rather than app.use()
  // globally) since it's only the GraphQL endpoint that needs a parsed body
  // here - expressMiddleware expects it upstream of itself.
  app.use('/graphql', express.json(), expressMiddleware(server));

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(`
    🚀 Server is running!
    📊 GraphQL Endpoint: http://localhost:${PORT}/graphql
    ⚡ Express Server: http://localhost:${PORT}
    `);
  });
};

startServer().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});

module.exports = app;
