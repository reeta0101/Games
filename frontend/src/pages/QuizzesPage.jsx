import { Link } from "react-router-dom";
import { GAME_MODES, CATEGORIES } from "../utils/gameConstants";

export default function QuizzesPage() {
  const categories = CATEGORIES.filter(c => c.label !== "All");

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center animate-fade-in-up">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a78bfa]/90">
          Library
        </p>
        <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">
          All Quizzes
        </h1>
        <p className="mt-3 text-sm text-slate-400 tracking-[0.15em]">
          Browse our collection of quizzes by category
        </p>
      </div>

      <div className="space-y-16">
        {categories.map((category, idx) => {
          const gamesInCategory = GAME_MODES.filter((g) => g.category === category.label);
          if (gamesInCategory.length === 0) return null;

          return (
            <section 
              key={category.label} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(idx * 0.1, 0.5)}s` }}
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl">
                  {category.icon}
                </span>
                <h2 className="text-2xl font-black text-white">
                  {category.label}
                </h2>
                <span className="ml-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-bold text-slate-400">
                  {gamesInCategory.length}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {gamesInCategory.map((game) => (
                  <Link
                    key={game.id}
                    to={game.path}
                    className="interactive-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0a0a0f] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-all hover:border-white/15 hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border text-xl font-black transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                        style={{
                          borderColor: `${game.accent}55`,
                          color: game.accent,
                          background: `${game.accent}12`,
                        }}
                      >
                        {game.hero}
                      </div>
                      <span
                        className="inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
                        style={{
                          color: game.accent,
                          background: `${game.accent}12`,
                        }}
                      >
                        {game.badge}
                      </span>
                    </div>

                    <div className="mt-5 flex-1">
                      <h3 className="text-lg font-black tracking-tight text-white transition-colors group-hover:text-white">
                        {game.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-400 line-clamp-2">
                        {game.intro}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.18em]"
                        style={{ color: game.accent }}
                      >
                        Start quiz
                      </span>
                      <span
                        className="opacity-50 transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                        style={{ color: game.accent }}
                      >
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
