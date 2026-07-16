import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#070d18]/95 py-8 pb-24 sm:pb-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <div>
          <div className="flex items-center justify-center gap-2 text-sm font-bold tracking-[0.15em] text-white/55 sm:justify-start">
            <span className="text-[#40e0f0]/75">STUDY</span>
            <span>arcade</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Quick quizzes, instant feedback, and local progress tracking.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-400">
          <Link to="/about" className="hover:text-[#40e0f0] transition">About Us</Link>
          <Link to="/contact" className="hover:text-[#40e0f0] transition">Contact</Link>
          <Link to="/privacy" className="hover:text-[#40e0f0] transition">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-[#40e0f0] transition">Terms</Link>
        </nav>

        <div className="flex flex-col items-center gap-3 sm:items-end">
          {/* Social Link */}
          <a
            href="https://instagram.com/studyarcade"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-400 transition hover:border-[#E1306C]/40 hover:bg-[#E1306C]/10 hover:text-[#E1306C]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            @studyarcade
          </a>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
            © {new Date().getFullYear()} StudyArcade
          </p>
        </div>
      </div>
    </footer>
  );
}
