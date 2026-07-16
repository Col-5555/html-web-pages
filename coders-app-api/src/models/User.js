import mongoose from "mongoose";

// The User supertype from the ER diagram. Coder and Manager share these account
// fields, so they're modelled with Mongoose **discriminators**: one `users`
// collection, with a `role` field distinguishing the subtype. This is the
// idiomatic Mongoose way to model supertype/subtype.
const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // real hashing is a later assignment
    avatar: { type: String, default: "" }, // optional
  },
  { timestamps: true, discriminatorKey: "role" }
);

export const User = mongoose.model("User", userSchema);

// Coder — adds a bio (`description`) and the leaderboard `score`.
export const Coder = User.discriminator(
  "Coder",
  new mongoose.Schema({
    description: { type: String, default: "" },
    score: { type: Number, default: 0 },
  })
);

// Manager — no extra fields beyond the shared account info.
export const Manager = User.discriminator("Manager", new mongoose.Schema({}));
