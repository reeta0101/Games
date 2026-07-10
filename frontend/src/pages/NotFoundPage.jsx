import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="surface w-full overflow-hidden rounded-3xl p-8 sm:p-12 animate-fade-in-up relative">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f04060]/20 blur-[100px]" />

        <p className="text-sm font-black uppercase tracking-[0.4em] text-[#f04060] mb-4">
          Error 404
        </p>
        <h1 className="text-6xl font-black text-white sm:text-8xl tracking-tight">
          Page Not Found
        </h1>
        
        <p className="mt-6 text-base text-slate-400 sm:text-lg max-w-md mx-auto leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Let's get you back to the games.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="touch-target w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-[#40e0f0]/40 bg-[#40e0f0]/10 px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-[#40e0f0] shadow-[0_18px_40px_rgba(64,224,240,0.12)] transition hover:bg-[#40e0f0]/20"
          >
            Back to Library
          </Link>
        </div>
      </div>
    </main>
  );
}
