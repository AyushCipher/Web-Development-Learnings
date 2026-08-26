// GraphQL vs REST: instead of many endpoints (/products, /products/:id, ...)
// each shaped by the server, GraphQL exposes ONE endpoint where the CLIENT
// describes exactly what fields it wants back. Apollo Server needs two
// things to answer those queries:
//   typeDefs   - the SCHEMA (graphql/schema.js): what types/fields/
//                operations exist, and their types - a contract, no logic.
//   resolvers  - graphql/resolvers.js: the actual functions that fetch/
//                mutate data for each field in that schema.
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`Server ready at: ${url}`);
}

startServer();
