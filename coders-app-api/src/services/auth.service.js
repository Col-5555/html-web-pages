// Auth service — STUB. Real registration/login (hashing, persistence, tokens)
// arrives with the data layer in a later assignment. For now these return mock
// results so the routes/controllers/validators can be exercised end-to-end.

let nextId = 100;

// "Register" a user: pretend to persist and return the created record (never the
// password). `role` is "coder" or "manager".
export const register = async ({ role, first_name, last_name, email }) => {
  return {
    id: nextId++,
    role,
    first_name,
    last_name,
    email,
    created_at: new Date().toISOString(),
  };
};

// "Log in" a user: pretend to verify credentials and return a mock session.
export const login = async ({ role, email }) => {
  return {
    token: `mock-${role}-token-${Buffer.from(email).toString("base64url")}`,
    user: { role, email },
  };
};
