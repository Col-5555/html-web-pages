import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { seedDatabase } from "./seed/index.js";

// Server entry point. The port comes from PORT (see .env.example); 4000 is a safe
// default on this shared machine (3000/8080 are taken by other users; the
// managers app uses 8457/3457).
const PORT = process.env.PORT || 4000;

async function start() {
  // Connect to MongoDB and seed dummy data when configured. If MONGODB_URI is
  // absent, the API still starts (its endpoints currently serve mock data).
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      await seedDatabase();
    } catch (err) {
      console.error("Failed to connect to MongoDB:", err.message);
      process.exit(1);
    }
  } else {
    console.warn("MONGODB_URI not set — starting without a database.");
  }

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Coders API listening on http://localhost:${PORT}`);
  });
}

start();
