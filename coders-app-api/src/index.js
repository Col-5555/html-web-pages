import { createApp } from "./app.js";

// Server entry point. The port comes from PORT (see .env.example); 4000 is a safe
// default on this shared machine (3000/8080 are taken by other users; the
// managers app uses 8457/3457).
const PORT = process.env.PORT || 4000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Coders API listening on http://localhost:${PORT}`);
});
