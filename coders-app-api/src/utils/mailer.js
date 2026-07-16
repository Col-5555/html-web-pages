import nodemailer from "nodemailer";

// Email sending for account verification. In production you'd point this at a
// real SMTP server via env (SMTP_HOST/PORT/USER/PASS). For development we fall
// back to Ethereal (nodemailer.createTestAccount()) — a throwaway inbox that
// captures the message and returns a browser preview URL instead of actually
// delivering it. No real credentials needed.

// The transporter is created lazily and cached, so we only spin up an Ethereal
// account once (and only if an email is actually sent).
let transporterPromise;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    }

    // Dev fallback: Ethereal test account.
    const testAccount = await nodemailer.createTestAccount();
    console.log(
      `Mailer: no SMTP_HOST set — using Ethereal test account <${testAccount.user}>.`
    );
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  })();

  return transporterPromise;
}

// Send the verification email. Returns the Ethereal preview URL (or null when a
// real SMTP server is used) so the caller can surface it for testing.
export async function sendVerificationEmail(user, verifyUrl) {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: '"Coders Platform" <no-reply@codecla.dev>',
    to: user.email,
    subject: "Verify your Coders account",
    text: `Welcome, ${user.first_name}! Verify your account: ${verifyUrl}`,
    html: `
      <p>Welcome, ${user.first_name}!</p>
      <p>Please verify your Coders account by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify my account</a></p>
      <p>If the link doesn't work, paste this into your browser:<br>${verifyUrl}</p>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  console.log(`Verification email sent to ${user.email}`);
  console.log(`  Verify link : ${verifyUrl}`);
  if (previewUrl) console.log(`  Email preview: ${previewUrl}`);
  return previewUrl;
}
