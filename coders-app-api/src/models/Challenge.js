import mongoose from "mongoose";

// A Challenge and its tightly-coupled parts. In the ER diagram Code, CodeText,
// FunctionInputDefinition, TestCase and FunctionInputValue are separate entities,
// but they only ever exist as part of a challenge — so in MongoDB they're modelled
// as **embedded subdocuments** rather than separate collections. The Manager who
// authored the challenge is a **reference** (they live independently).

// CodeText: the starter code content for one language.
const codeTextSchema = new mongoose.Schema(
  {
    language: { type: String, enum: ["py", "js"], required: true },
    content: { type: String, default: "" },
  },
  { _id: false }
);

// FunctionInputDefinition: one argument of the function coders must implement.
const inputDefinitionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
  },
  { _id: false }
);

// The Code entity: function name + per-language content + argument definitions.
const codeSchema = new mongoose.Schema(
  {
    function_name: { type: String, required: true },
    code_text: { type: [codeTextSchema], default: [] },
    inputs: { type: [inputDefinitionSchema], default: [] },
  },
  { _id: false }
);

// FunctionInputValue: a named input value for a test case. `value` is Mixed
// because it can be a number, string, array, etc.
const inputValueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

// TestCase: a weighted graded case with its inputs and expected output.
const testSchema = new mongoose.Schema(
  {
    weight: { type: Number, min: 0, max: 1, required: true },
    inputs: { type: [inputValueSchema], default: [] },
    expected_output: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true }, // markdown
    difficulty: { type: String, enum: ["Easy", "Moderate", "Hard"], required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Manager", required: true },
    code: { type: codeSchema, required: true },
    tests: { type: [testSchema], default: [] },
  },
  { timestamps: true }
);

export const Challenge = mongoose.model("Challenge", challengeSchema);
