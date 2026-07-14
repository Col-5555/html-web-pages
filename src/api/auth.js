// Mock authentication API.
//
// There is no remote server in this assignment, so these functions just
// pretend to talk to one: they resolve after a short delay and echo back a
// coder object. Later assignments will replace the bodies with real `fetch`
// calls to the Coders backend, while keeping the same function signatures so
// the pages don't have to change.

const fakeDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function signIn({ email }) {
  await fakeDelay(300);
  return { email };
}

export async function signUp({ firstName, lastName, email }) {
  await fakeDelay(300);
  return { firstName, lastName, email };
}
