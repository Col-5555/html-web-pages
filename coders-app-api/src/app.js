import express from "express";
import { graphqlHTTP } from "express-graphql";
import apiRoutes from "./routes/index.js";
import { schema } from "./graphql/schema.js";
import { rootValue } from "./graphql/resolvers.js";
import avatarTestRoutes from "./devtools/avatarTest.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

// Builds and configures the Express application (kept separate from server
// start-up so it can be imported and tested without binding a port).
export const createApp = () => {
  const app = express();

  // Parse JSON request bodies.
  app.use(express.json());

  // Lightweight health check.
  app.get("/health", (req, res) => res.json({ status: "ok" }));

  // All API endpoints live under /api.
  app.use("/api", apiRoutes);

  // GraphQL endpoint (a read layer mirroring some REST challenge endpoints).
  // graphiql:true serves the in-browser GraphiQL explorer on GET /graphql; the
  // request is exposed to resolvers via context so they can read the auth token
  // from the Authorization header. See src/graphql/.
  app.use(
    "/graphql",
    graphqlHTTP((req) => ({
      schema,
      rootValue,
      graphiql: true,
      context: { req },
    }))
  );

  // Dev-only browser page for manually testing the avatar upload endpoint.
  // Never mounted in production.
  if (process.env.APP_ENV !== "prod") {
    app.use(avatarTestRoutes);
  }

  // Unmatched routes → 404, then the central error handler.
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
