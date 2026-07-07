import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getLeaderboard,
  getTimeAgo,
  DIFFICULTIES,
  DIFF_LABELS,
  MODE_LABELS,
} from "../utils/leaderboard";

const GAMES = [
  { key: "alphabet",     label: "Alphabet Quiz",       accent: "#f0e040", icon: "A→Z" },
  { key: "square",       label: "Square Quiz",          accent: "#40e0f0", icon: "X²" },
  { key: "cube",         label: "Cube Quiz",            accent: "#a78bfa", icon: "X³" },
  { key: "stateCapital", label: "State Capital Quiz",   accent: "#fb7185", icon: "IND" },
  { key: "worldCapital", label: "World Capital Quiz",   accent: "#34d399", icon: "🌍" },
  { key: "periodicTable",label: "Periodic Table Quiz",  accent: "#f59e0b", icon: "PT"  },
];

const LEVELS = [
  { key: "beginner",     icon: "🌱", label: "Beginner" },
  { key: "intermediate", icon: "⚡", label: "Intermediate" },
  { key: "advanced",     icon: "🔥", label: "Advanced" },
];

export default function Leaderboard() {
  const [selectedGame, setSelectedGame] = useState("alphabet");
  const [selectedLevel, setSelectedLevel] = useState("intermediate");

  const game = GAMES.find((g) => g.key === selectedGame);
  const level = LEVELS.find((l) => l.key === selectedLevel);

  const entries = getLeaderboard()
    .filter((e) => e.mode === selectedGame && e.difficulty === selectedLevel)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return (
    <main className="mx-auto max-w-3xl px-3 pb-16 pt-8 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#f0e040]/90">
          Hall of Fame
        </p>
        <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">
          Leaderboard
        </h1>
        <p className="mt-3 text-sm text-slate-400 tracking-[0.15em]">
          Top 20 scores per game &amp; difficulty
        </p>
      </div>

      {/* Game selector */}
      <div className="mb-4">
        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-slate-500">Select Game</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GAMES.map((g) => (
            <button
              key={g.key}
              onClick={() => setSelectedGame(g.key)}
              className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: selectedGame === g.key ? `${g.accent}66` : "rgba(255,255,255,0.08)",
                background:  selectedGame === g.key ? `${g.accent}12`  : "rgba(255,255,255,0.03)",
                boxShadow:   selectedGame === g.key ? `0 0 18px ${g.accent}18` : "none",
              }}
            >
              <span
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-black"
                style={{ color: g.accent, background: `${g.accent}18` }}
              >
                {g.icon}
              </span>
              <span
                className="text-xs font-bold leading-tight"
                style={{ color: selectedGame === g.key ? g.accent : "#cbd5e1" }}
              >
                {g.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Level selector */}
      <div className="mb-8">
        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-slate-500">Select Level</p>
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.key}
              onClick={() => setSelectedLevel(l.key)}
              className={`flex-1 rounded-xl border py-3 text-xs font-bold uppercase tracking-[0.2em] transition duration-200 hover:-translate-y-0.5 ${
                selectedLevel === l.key
                  ? "border-[#f0e040]/50 bg-[#f0e040]/10 text-[#f0e040] shadow-[0_0_16px_rgba(240,224,64,0.1)]"
                  : "border-white/8 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
              }`}
            >
              {l.icon} {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">

        {/* Table header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-white/10"
          style={{ background: `${game.accent}0a` }}
        >
          <div>
            <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: game.accent }}>
              {MODE_LABELS[game.key]} · {level.icon} {level.label}
            </span>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-500">
              {entries.length} player{entries.length !== 1 ? "s" : ""} ranked
            </p>
          </div>
          <Link
            to={GAMES.find((g) => g.key === selectedGame) ? `/${selectedGame === "stateCapital" ? "state-capital" : selectedGame === "worldCapital" ? "world-capital" : selectedGame === "periodicTable" ? "periodic-table" : selectedGame}` : "/"}
            className="rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition hover:opacity-80"
            style={{ borderColor: `${game.accent}50`, color: game.accent, background: `${game.accent}12` }}
          >
            Play →
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">No scores yet</p>
            <p className="mt-2 text-xs text-slate-600 tracking-[0.15em]">
              Be the first to play {game.label} on {level.label}!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {entries.map((entry, i) => {
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
              const rankColor =
                i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "#4a4a7a";

              return (
                <div
                  key={`${entry.name}-${entry.timestamp}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-white/[0.02]"
                  style={i < 3 ? { background: `${game.accent}05` } : {}}
                >
                  {/* Rank */}
                  <div className="w-8 shrink-0 text-center">
                    {medal ? (
                      <span className="text-xl">{medal}</span>
                    ) : (
                      <span className="text-sm font-black" style={{ color: rankColor }}>
                        {i + 1}
                      </span>
                    )}
                  </div>

                  {/* Player */}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-white">{entry.name}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-slate-500">
                      <span>{DIFFICULTIES[entry.difficulty]?.icon} {DIFF_LABELS[entry.difficulty]}</span>
                      <span>·</span>
                      <span>{entry.questions || "?"}Q</span>
                      <span>·</span>
                      <span>{getTimeAgo(entry.timestamp)}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div
                    className="shrink-0 text-2xl font-black tabular-nums"
                    style={{ color: i < 3 ? game.accent : "#94a3b8" }}
                  >
                    {entry.score}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-[10px] uppercase tracking-[0.2em] text-slate-600">
        Scores from the last 7 days · Best score per player
      </p>
    </main>
  );
}
