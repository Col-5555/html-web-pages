import coding from "../assets/coding.png";

// The split-panel shell shared by the sign-in and sign-up pages:
// a navy illustration panel on the left and a white card (the form) on the
// right. Ported from the Tailwind classes in the original signin/signup HTML.
export default function AuthLayout({ children }) {
  return (
    <section className="flex min-h-screen flex-col font-martel md:flex-row">
      {/* Left panel — illustration */}
      <div className="flex min-h-[40vh] items-center justify-center bg-navy md:min-h-0 md:w-1/2">
        <img src={coding} alt="Coder illustration" className="max-w-[250px]" />
      </div>

      {/* Right panel — form card */}
      <div className="flex flex-1 items-center justify-center bg-light px-5 py-8">
        <div className="w-full max-w-[400px] rounded-lg bg-white p-10 text-center">
          {children}
        </div>
      </div>
    </section>
  );
}
