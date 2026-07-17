# GraphQL with Express — walkthrough

This assignment adds a **GraphQL** read layer to **`coders-app-api`** (the Express
backend), alongside the existing REST API. It mirrors three of the REST challenge
endpoints as GraphQL queries — so a client can ask for *exactly* the fields it
needs in one request, instead of over-fetching whole challenge documents.

> **Scope note.** The brief also has a "GraphQL in the frontend" section that
> assumes the React app (`coders-app`) already fetches challenges via REST
> RTK-Query hooks. It doesn't — `coders-app` still renders from static mock data
> (`src/data/*.js`) with mock auth and no API wiring at all. So there are no REST
> hooks to swap, and this submission delivers the **backend** section in full,
> demonstrated with GraphiQL. Wiring the frontend to the backend (REST or GraphQL)
> is a separate integration task.
>
> Also note: the brief's PDF is mistitled "Unit Testing" — the body is entirely
> GraphQL.

---

## Setup

Two libraries, installed in `coders-app-api`:

```bash
npm install graphql express-graphql
```

- **`graphql`** — the reference JS implementation (schema, types, execution).
- **`express-graphql`** — Express middleware that exposes a GraphQL endpoint and
  the in-browser **GraphiQL** explorer.

> `express-graphql` is deprecated (the maintained successor is `graphql-http`),
> but the brief names it specifically and it works fine here with `graphql` v16 on
> Express 5. If it ever needs replacing, `graphql-http` + `ruru` is the drop-in.

## 1. The schema (`src/graphql/schema.js`)

The four Mongoose models become GraphQL types. We write the schema as **SDL**
(Schema Definition Language) and compile it with `buildSchema`, matching the
brief's example:

```js
import { buildSchema } from "graphql";

export const schema = buildSchema(/* GraphQL */ `
  type Challenge {
    _id: ID!
    title: String!
    category: String!
    description: String!
    difficulty: String!
    solution_rate: Int
    status: String          # the requesting coder's status
    code: Code
    tests: [Test!]
    manager: ID
    createdAt: String
    updatedAt: String
  }

  type Query {
    challenges(category: String, token: String): [Challenge!]!
    challenge(id: ID!, token: String): Challenge
    categories(token: String): [String!]!
  }
  # …Code, CodeText, InputDefinition, Test, TestInput, Coder, Manager, Submission…
`);
```

### Gotcha — Mongoose `Mixed` doesn't fit a GraphQL scalar

A test's `expected_output` and each input `value` are Mongoose **`Mixed`** — they
can be a number, a string, or an array (`[0, 1]`, `9`, `[2,7,11,15]`). GraphQL's
built-in scalars can't represent "any shape", and `buildSchema` (SDL) makes custom
scalars awkward. The clean fix: type these fields as **`String`** and have the
resolver **JSON-stringify** the value. So `expected_output: [0,1]` comes back as
the string `"[0,1]"`, which a client can `JSON.parse`.

## 2. The resolvers (`src/graphql/resolvers.js`)

Resolvers are a plain `rootValue` object — one function per query. The important
design choice: **they reuse the existing service layer** rather than re-querying
Mongo, so the GraphQL and REST APIs share identical business logic (role-aware
listing, `solution_rate`, per-coder `status`):

```js
import { listChallenges, getChallenge, listCategories }
  from "../services/challenge.service.js";

export const rootValue = {
  challenges: async ({ category, token }, context) => {
    const { id } = requireAuth(token, context);
    const challenges = await listChallenges(id, { category });
    return challenges.map(toGraphChallenge);
  },
  challenge: async ({ id, token }, context) => {
    const { id: requesterId } = requireAuth(token, context);
    return toGraphChallenge(await getChallenge(id, requesterId));
  },
  categories: async ({ token }, context) => {
    requireAuth(token, context);
    return listCategories();
  },
};
```

### Auth — header first, argument as a fallback

The REST endpoints are guarded by `authorize()`, which reads
`Authorization: Bearer <jwt>`. GraphQL resolvers don't get the middleware, so we
reproduce it with a small helper. The service needs the **requester's id** to
compute a coder's `status`/`solution_rate`, so authentication isn't optional:

```js
const requireAuth = (token, context) => {
  const header = context?.req?.headers?.authorization || "";
  const [scheme, headerToken] = header.split(" ");
  const jwtToken = (scheme === "Bearer" ? headerToken : undefined) || token;
  if (!jwtToken) throw httpError(401, "Authentication required");
  try { return verifyToken(jwtToken); }
  catch { throw httpError(401, "Invalid or expired token"); }
};
```

The brief describes two stages: *first* force the token as a **query argument**
(handy for poking at GraphiQL), *then* move to a **request header** once a real
client sends one. This helper supports **both at once** — it prefers the header
and falls back to the `token` argument — so GraphiQL testing and a future React
client both work without changing the schema.

The request reaches resolvers because the middleware puts it on the GraphQL
`context`:

```js
// src/app.js
app.use("/graphql", graphqlHTTP((req) => ({
  schema, rootValue, graphiql: true, context: { req },
})));
```

### The `Mixed → String` transform

```js
const toGraphChallenge = (challenge) => ({
  ...challenge,
  tests: challenge.tests?.map((test) => ({
    weight: test.weight,
    inputs: test.inputs?.map((i) => ({ name: i.name, value: JSON.stringify(i.value) })),
    expected_output: JSON.stringify(test.expected_output),
  })),
});
```

## Trying it out

Start the API and open the explorer:

```bash
cd coders-app-api
npm run dev
# browse to http://localhost:4000/graphql  (GraphiQL)
```

GraphiQL requires a token. Either add an `Authorization: Bearer <jwt>` header (the
"Headers" tab), or pass the `token` argument inline. A quick way to get a token
without a password is to sign one for an existing coder using the app's own
`signLoginToken` util. Then:

```graphql
# only the columns the challenges table needs — no over-fetching
{
  challenges {
    _id title category difficulty solution_rate status
  }
}

# everything the coding workspace needs for one challenge
query ($id: ID!) {
  challenge(id: $id) {
    title description status
    code { function_name code_text { language content } inputs { name type } }
    tests { weight expected_output inputs { name value } }
  }
}

{ categories }                       # ["Data structure","Graphs","Math"]
{ challenges(category: "Graphs") { title } }   # server-side filter
```

### What was verified

Run against the live dev database, the GraphQL results match the equivalent REST
endpoints field-for-field:

- `categories` == `GET /api/categories` (`["Data structure","Graphs","Math"]`).
- `challenges` carries the same `solution_rate` (e.g. Two-sum `50`) and per-coder
  `status` (`Completed`/`Waiting`) as `GET /api/challenges`.
- `challenge(id)` returns the full workspace payload (description, code, tests),
  with `Mixed` test values as JSON strings (`expected_output: "[0,1]"`).
- No token / an invalid token → a GraphQL error (`Authentication required` /
  `Invalid or expired token`), mirroring the REST `401`.
- `GET /graphql` serves the GraphiQL HTML (the UI itself wasn't click-tested — no
  browser driver in this environment — but the endpoint and every query were
  exercised over HTTP).
