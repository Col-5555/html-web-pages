import mongoose from "mongoose";

// A Coder's graded attempt at a Challenge. Both sides are **references** (the
// coder and challenge exist independently); the submission carries the grading
// outcome and the submitted code.
const submissionSchema = new mongoose.Schema(
  {
    coder: { type: mongoose.Schema.Types.ObjectId, ref: "Coder", required: true },
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true },
    submitted_at: { type: Date, default: Date.now },
    passed: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    code: { type: String, required: true },
    language: { type: String, enum: ["py", "js"], required: true },
  },
  { timestamps: true }
);

export const Submission = mongoose.model("Submission", submissionSchema);
