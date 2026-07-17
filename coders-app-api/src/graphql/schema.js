import { buildSchema } from "graphql";

// GraphQL schema for the Coders API, defined as SDL and compiled with
// buildSchema (matching the brief's SDL example). The four Mongoose models
// (Coder, Manager, Challenge, Submission) are translated into GraphQL types,
// with extra types for the challenge's embedded sub-documents (Code, Test, …).
//
// Resolvers live in resolvers.js (a rootValue object) and reuse the existing
// service layer — see src/services/challenge.service.js.
//
// Note on Mixed fields: the model's test `expected_output` and input `value` are
// Mongoose Mixed (a number, string, array, …). SDL scalars can't represent an
// arbitrary shape, so the resolver JSON-stringifies them and they're typed as
// String here (avoids needing a custom JSON scalar with buildSchema).
export const schema = buildSchema(/* GraphQL */ `
  # The starter code for one language (embedded in Code).
  type CodeText {
    language: String!
    content: String
  }

  # One argument of the function coders must implement.
  type InputDefinition {
    name: String!
    type: String!
  }

  # The Code entity: function signature + per-language starter content.
  type Code {
    function_name: String!
    code_text: [CodeText!]
    inputs: [InputDefinition!]
  }

  # A single named input value for a test case (value JSON-stringified).
  type TestInput {
    name: String!
    value: String
  }

  # A weighted, graded test case (expected_output JSON-stringified).
  type Test {
    weight: Float
    inputs: [TestInput!]
    expected_output: String
  }

  # A coding challenge. solution_rate is a percentage (0–100); status is the
  # requesting coder's personal status (Waiting | Attempted | Completed) and is
  # only present when the requester is a coder.
  type Challenge {
    _id: ID!
    title: String!
    category: String!
    description: String!
    difficulty: String!
    solution_rate: Int
    status: String
    code: Code
    tests: [Test!]
    manager: ID
    createdAt: String
    updatedAt: String
  }

  # A coder's graded attempt at a challenge. Defined for completeness (the brief
  # asks for all four models); the queries below expose submission state via the
  # derived Challenge.status rather than returning Submission objects directly.
  type Submission {
    _id: ID!
    coder: ID!
    challenge: ID!
    passed: Boolean
    score: Float
    language: String
    submitted_at: String
  }

  # Account types (Coder/Manager discriminators of the User model). Included per
  # the brief; no query resolves a user, so password is never actually serialised
  # (the model's toJSON strips it too).
  type Manager {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    password: String!
  }

  type Coder {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    password: String!
    description: String
    score: Int
  }

  # Read queries mirroring the REST challenge endpoints. Every query is
  # authenticated: the resolver reads a JWT from the Authorization header, or —
  # for convenience when testing in GraphiQL — from the optional \`token\` argument.
  type Query {
    # All challenges (coders see every challenge with their personal status;
    # managers see only their own). Optional category filter.
    challenges(category: String, token: String): [Challenge!]!

    # A single challenge by id (used to initialise the coding workspace).
    challenge(id: ID!, token: String): Challenge

    # The distinct categories currently in use.
    categories(token: String): [String!]!
  }
`);
