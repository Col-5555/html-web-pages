import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// How many rounds bcrypt uses when hashing. 10 is a sensible default.
const SALT_ROUNDS = 10;

// The User supertype from the ER diagram. Coder and Manager share these account
// fields, so they're modelled with Mongoose **discriminators**: one `users`
// collection, with a `role` field distinguishing the subtype. This is the
// idiomatic Mongoose way to model supertype/subtype.
const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // stored as a bcrypt hash (see pre-save hook)
    avatar: { type: String, default: "" }, // optional
    // New accounts start unverified; the email-verification route flips this true.
    is_verified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    discriminatorKey: "role",
    // Never expose the password hash (or __v) when a user is serialised to JSON.
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash the password before saving whenever it changed (on create, or when a
// user later updates their password). Hooks registered on the base schema also
// run for the Coder/Manager discriminators, so both subtypes get hashing.
userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// Compare a plaintext candidate against the stored hash (used at login).
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

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
