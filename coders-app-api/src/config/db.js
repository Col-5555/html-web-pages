import mongoose from "mongoose";

// Connects Mongoose to MongoDB Atlas. The connection string and database name
// come from the environment (see .env.example); the URI is a mongodb+srv://
// Atlas URI and `dbName` selects the database within the cluster.
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB });
  console.log(`MongoDB connected → db "${mongoose.connection.name}"`);
  return mongoose.connection;
}
