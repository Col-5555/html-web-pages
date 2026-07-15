// Mock authentication API for the managers app.
//
// json-server only backs the challenges resource, so there is no real auth
// endpoint yet. These functions pretend to sign a manager in/up and echo back a
// user object, mirroring the Coders app. Real endpoints can replace the bodies
// later without changing the pages.

const fakeDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function signIn({ email }) {
  await fakeDelay(300);
  return { email };
}

export async function signUp({ firstName, lastName, email }) {
  await fakeDelay(300);
  return { firstName, lastName, email };
}
