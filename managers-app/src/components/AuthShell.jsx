// Split-panel shell for the auth pages: a dark illustration panel on the left
// and the form card on the right. Presentational only, so it stays a plain
// (server-renderable) component.
export default function AuthShell({ children }) {
  return (
    <section className="flex min-h-screen flex-col md:flex-row">
      {/* Left panel — illustration */}
      <div className="flex min-h-[40vh] items-center justify-center bg-[#23155B] md:min-h-0 md:w-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/coding.png" alt="Coder illustration" className="max-w-[250px]" />
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-muted px-5 py-8">
        <div className="w-full max-w-[380px] rounded-lg bg-background p-8 shadow-sm">
          {children}
        </div>
      </div>
    </section>
  );
}
