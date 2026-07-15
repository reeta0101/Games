import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GAME_MODES } from "../App";
import { DIFFICULTIES, DIFF_LABELS } from "../utils/leaderboard";

export default function ChallengePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const gameId = searchParams.get("gameId");
  const difficulty = searchParams.get("difficulty") || "intermediate";
  const score = parseInt(searchParams.get("score"), 10) || 0;
  const challenger = searchParams.get("challenger") || "A friend";

  const [game, setGame] = useState(null);

  useEffect(() => {
    const foundGame = GAME_MODES.find((g) => g.id === gameId || g.key === gameId);
    if (foundGame) {
      // Handle the fact that some GAME_MODES elements use `id` and some might use `key`. 
      // The leaderboard mostly uses `game.key`, so in App.jsx GAME_MODES actually has `id`. Let's set both.
      setGame(foundGame);
    }
  }, [gameId]);

  if (!game) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center px-3 py-8">
        <section className="surface w-full rounded-3xl p-8 text-center">
          <h1 className="text-3xl font-black text-white">Challenge not found</h1>
          <p className="mt-4 text-slate-300">The quiz you were challenged to does not exist.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-300 hover:bg-white/10"
          >
            Go Home
          </button>
        </section>
      </main>
    );
  }

  const handleAccept = () => {
    navigate(game.path, {
      state: {
        challenge: {
          challenger,
          score,
          difficulty,
        },
      },
    });
  };

  const diffInfo = DIFFICULTIES[difficulty] || DIFFICULTIES.intermediate;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center px-3 py-8 sm:px-6 sm:py-10">
      <section className="surface w-full overflow-hidden rounded-3xl p-6 sm:p-12 animate-soft-pop text-center relative">
        <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at center, ${game.accent}, transparent 70%)` }} />
        
        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/10 bg-black/40 text-5xl shadow-2xl shadow-black/50" style={{ borderColor: `${game.accent}40` }}>
            {game.hero}
          </div>
          
          <h1 className="text-4xl font-black text-white sm:text-5xl leading-tight">
            You've been challenged!
          </h1>
          
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6 max-w-md mx-auto backdrop-blur-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
              Challenger
            </p>
            <p className="text-2xl font-black text-white mb-6">
              {challenger}
            </p>

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
              Quiz
            </p>
            <p className="text-xl font-bold mb-6" style={{ color: game.accent }}>
              {game.title}
            </p>

            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">
                  Difficulty
                </p>
                <p className="text-sm font-bold text-slate-300 flex items-center justify-center gap-2">
                  {diffInfo.icon} {DIFF_LABELS[difficulty] || difficulty}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">
                  Target Score
                </p>
                <p className="text-2xl font-black text-white shadow-sm">
                  {score}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleAccept}
              className="touch-target rounded-full px-8 py-4 text-sm font-black uppercase tracking-[0.2em] transition hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              style={{ backgroundColor: `${game.accent}20`, border: `1px solid ${game.accent}60`, color: game.accent }}
            >
              Accept Challenge
            </button>
            <button
              onClick={() => navigate("/")}
              className="touch-target rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              Decline
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
