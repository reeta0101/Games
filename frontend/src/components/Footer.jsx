export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#070d18]/95 py-8">
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

        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
          © {new Date().getFullYear()} StudyArcade
        </p>
      </div>
    </footer>
  );
}
