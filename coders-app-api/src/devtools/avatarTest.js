import { Router } from "express";

// A tiny DEV-ONLY browser page for exercising the coder avatar upload endpoint
// (PATCH /api/coders/:id/profile, multipart/form-data). It's served by the API
// itself, so it's same-origin — no CORS needed and the Authorization header is
// allowed. Mounted only when APP_ENV !== "prod" (see app.js).
//
// Paste a coder's Bearer token (the page decodes the id/email from it), pick an
// image, and Upload — the returned avatar renders inline. This is a testing aid,
// not part of the real product UI.

const html = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Avatar upload — dev test</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto;
         padding: 0 1rem; line-height: 1.5; }
  h1 { font-size: 1.4rem; }
  label { display: block; font-weight: 600; margin: 1rem 0 .25rem; font-size: .9rem; }
  input, textarea { width: 100%; padding: .5rem; font: inherit; box-sizing: border-box;
         border: 1px solid #8888; border-radius: 6px; background: transparent; color: inherit; }
  textarea { resize: vertical; }
  .row { display: flex; gap: 1rem; }
  .row > div { flex: 1; }
  button { margin-top: 1.25rem; padding: .6rem 1.2rem; font: inherit; font-weight: 600;
         border: 0; border-radius: 6px; background: #3b82f6; color: #fff; cursor: pointer; }
  button:disabled { opacity: .5; cursor: default; }
  .who { font-size: .85rem; color: #888; margin-top: .35rem; min-height: 1.2em; }
  #result { margin-top: 1.5rem; }
  #result img { max-width: 140px; border-radius: 50%; object-fit: cover; display: block; margin: .5rem 0; }
  pre { background: #8881; padding: .75rem; border-radius: 6px; overflow-x: auto; font-size: .8rem; }
  a { color: #3b82f6; word-break: break-all; }
  .ok { color: #16a34a; } .err { color: #dc2626; }
</style>
</head>
<body>
  <h1>Avatar upload — dev test</h1>
  <p>Sends a <code>multipart/form-data</code> <code>PATCH /api/coders/:id/profile</code>
     to this API. Paste a coder's Bearer token below.</p>

  <form id="form">
    <label for="token">Coder Bearer token (JWT)</label>
    <textarea id="token" rows="3" placeholder="eyJhbGciOi..." required></textarea>
    <div class="who" id="who"></div>

    <label for="avatar">Avatar image</label>
    <input type="file" id="avatar" accept="image/*" />

    <div class="row">
      <div>
        <label for="first_name">First name (optional)</label>
        <input type="text" id="first_name" />
      </div>
      <div>
        <label for="last_name">Last name (optional)</label>
        <input type="text" id="last_name" />
      </div>
    </div>

    <label for="about">About (optional)</label>
    <textarea id="about" rows="2"></textarea>

    <button type="submit" id="submit">Upload</button>
  </form>

  <div id="result"></div>

<script>
  const $ = (id) => document.getElementById(id);
  let coderId = null;

  // Decode a JWT payload (base64url) without verifying — just to read id/email.
  function decode(token) {
    try {
      const part = token.trim().split(".")[1];
      const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(b64.padEnd(b64.length + (4 - b64.length % 4) % 4, "=")));
    } catch { return null; }
  }

  $("token").addEventListener("input", () => {
    const p = decode($("token").value);
    coderId = p?.id ?? null;
    $("who").textContent = p
      ? \`token → id: \${p.id}, email: \${p.email ?? "?"}, role: \${p.role ?? "?"}\`
      : ($("token").value.trim() ? "⚠ could not decode this token" : "");
    $("who").className = "who" + (p && p.role && p.role !== "Coder" ? " err" : "");
  });

  $("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = $("token").value.trim();
    if (!coderId) { render(false, "No valid coder id decoded from the token."); return; }

    const fd = new FormData();
    const file = $("avatar").files[0];
    if (file) fd.append("avatar", file);
    for (const f of ["first_name", "last_name", "about"]) {
      if ($(f).value) fd.append(f, $(f).value);
    }

    $("submit").disabled = true;
    try {
      const res = await fetch(\`/api/coders/\${coderId}/profile\`, {
        method: "PATCH",
        headers: { Authorization: "Bearer " + token },
        body: fd,
      });
      const json = await res.json();
      render(res.ok, res.ok ? "Updated ✓ (HTTP " + res.status + ")" : "HTTP " + res.status, json);
    } catch (err) {
      render(false, "Request failed: " + err.message);
    } finally {
      $("submit").disabled = false;
    }
  });

  function render(ok, msg, json) {
    const avatar = json?.profile?.avatar;
    $("result").innerHTML =
      \`<p class="\${ok ? "ok" : "err"}">\${msg}</p>\` +
      (avatar ? \`<img src="\${avatar}" alt="avatar" /><p><a href="\${avatar}" target="_blank">\${avatar}</a></p>\` : "") +
      (json ? \`<pre>\${JSON.stringify(json, null, 2)}</pre>\` : "");
  }
</script>
</body>
</html>`;

const router = Router();
router.get("/avatar-test", (req, res) => res.type("html").send(html));

export default router;
