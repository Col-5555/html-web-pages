// Client-side auth helpers. They call this app's own Next.js route handlers
// (/api/auth/*), which proxy to the Express backend and manage the token cookie.
// Keeping the network shape here means the pages don't care where auth lives.

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // The route handler relays the backend's message (bad credentials, email
    // not verified, duplicate email, …).
    throw new Error(data.message || "Request failed");
  }
  return data;
}

// Register a manager. Resolves on 201; the manager must then verify their email
// before they can sign in.
export function signUp({ firstName, lastName, email, password }) {
  return postJson("/api/auth/signup", { firstName, lastName, email, password });
}

// Sign a manager in. On success returns { token, user }; the route handler also
// sets the token cookie.
export function signIn({ email, password }) {
  return postJson("/api/auth/signin", { email, password });
}
