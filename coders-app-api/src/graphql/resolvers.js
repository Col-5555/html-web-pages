// GraphQL resolvers (the rootValue passed to express-graphql). Each query is a
// thin wrapper over the existing service layer, so the GraphQL and REST APIs
// share exactly the same business logic (role-aware listing, solution_rate,
// per-coder status). See src/services/challenge.service.js.

import {
  listChallenges,
  getChallenge,
  listCategories,
} from "../services/challenge.service.js";
import { verifyToken } from "../utils/token.js";
import { httpError } from "../utils/httpError.js";

// Pull the JWT out of the request. Preferred source is the standard
// `Authorization: Bearer <token>` header (how the React client will send it);
// as a fallback we accept a `token` query argument, which makes ad-hoc testing
// in the GraphiQL interface easy. Verifies the token and returns its payload
// { id, email, role } — throwing (→ a GraphQL error) if missing or invalid,
// mirroring the REST authorize() middleware that guards these routes.
const requireAuth = (token, context) => {
  const header = context?.req?.headers?.authorization || "";
  const [scheme, headerToken] = header.split(" ");
  const bearer = scheme === "Bearer" ? headerToken : undefined;

  const jwtToken = bearer || token;
  if (!jwtToken) throw httpError(401, "Authentication required");

  try {
    return verifyToken(jwtToken);
  } catch {
    throw httpError(401, "Invalid or expired token");
  }
};

// Map a decorated service challenge to the GraphQL Challenge shape. The only
// transform needed is the Mixed test fields (expected_output and each input
// value), which are JSON-stringified so they fit the String scalars in the
// schema. Everything else passes straight through.
const toGraphChallenge = (challenge) => {
  if (!challenge) return null;
  return {
    ...challenge,
    tests: challenge.tests?.map((test) => ({
      weight: test.weight,
      inputs: test.inputs?.map((input) => ({
        name: input.name,
        value: JSON.stringify(input.value),
      })),
      expected_output: JSON.stringify(test.expected_output),
    })),
  };
};

export const rootValue = {
  // GET /api/challenges equivalent (with optional ?category filter).
  challenges: async ({ category, token }, context) => {
    const { id } = requireAuth(token, context);
    const challenges = await listChallenges(id, { category });
    return challenges.map(toGraphChallenge);
  },

  // GET /api/challenges/:id equivalent.
  challenge: async ({ id, token }, context) => {
    const { id: requesterId } = requireAuth(token, context);
    const challenge = await getChallenge(id, requesterId);
    return toGraphChallenge(challenge);
  },

  // GET /api/categories equivalent. Authenticated for parity with the guarded
  // REST route, though the result isn't user-specific.
  categories: async ({ token }, context) => {
    requireAuth(token, context);
    return listCategories();
  },
};
