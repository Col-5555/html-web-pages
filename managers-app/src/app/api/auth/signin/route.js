import axios from "axios";
import { cookies } from "next/headers";

// Signin route handler (Backend-for-Frontend). Forwards credentials to the Express
// backend's manager login. On success it stores the JWT in a cookie — readable so
// Redux can rehydrate on refresh, and available server-side (via next/headers
// cookies()) so the challenge data layer / server actions can call the NestJS API
// with it — and returns { token, user } to the client for Redux.
const EXPRESS_API_URL = process.env.EXPRESS_API_URL || "http://localhost:4000";

// A week, matching the Express login token's lifetime.
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(request) {
  const { email, password } = await request.json();

  try {
    const { data } = await axios.post(
      `${EXPRESS_API_URL}/api/auth/managers/login`,
      { email, password },
    );

    const cookieStore = await cookies();
    cookieStore.set("token", data.token, {
      path: "/",
      sameSite: "lax",
      maxAge: TOKEN_MAX_AGE,
    });

    return Response.json({ token: data.token, user: data.user });
  } catch (error) {
    // Relay Express errors verbatim: 401 (bad credentials), 403 (email not
    // verified), etc.
    const status = error.response?.status ?? 502;
    const message =
      error.response?.data?.message ?? "Could not reach the authentication service";
    return Response.json({ message }, { status });
  }
}
