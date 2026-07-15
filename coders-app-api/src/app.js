import express from "express";
import apiRoutes from "./routes/index.js";
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

  // Unmatched routes → 404, then the central error handler.
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
