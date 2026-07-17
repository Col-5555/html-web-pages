import axios from "axios";

// Signup route handler (Backend-for-Frontend). The form posts here; we forward the
// registration to the Express backend, which owns manager registration. Express
// creates the manager as UNVERIFIED and emails a verification link — the manager
// must verify before they can sign in.
const EXPRESS_API_URL = process.env.EXPRESS_API_URL || "http://localhost:4000";

export async function POST(request) {
  const { firstName, lastName, email, password } = await request.json();

  try {
    const { data } = await axios.post(
      `${EXPRESS_API_URL}/api/auth/managers/register`,
      { first_name: firstName, last_name: lastName, email, password },
    );
    // 201: registered (unverified). Relay the message so the UI can tell the
    // manager to check their email before signing in.
    return Response.json({ message: data.message }, { status: 201 });
  } catch (error) {
    // Relay the Express error (e.g. 409 duplicate email, 400 validation).
    const status = error.response?.status ?? 502;
    const message =
      error.response?.data?.message ?? "Could not reach the authentication service";
    return Response.json({ message }, { status });
  }
}
