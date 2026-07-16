import { Link } from "react-router-dom";

export default function GamesPage() {
  const games = [
    {
      to: "/tic-tac-toe",
      title: "Tic Tac Toe",
      description: "Classic 3x3 game. Play against the AI or challenge a friend in live multiplayer!",
      icon: "❌⭕",
      color: "from-[#40e0f0] to-blue-500",
      shadow: "shadow-[0_0_15px_rgba(64,224,240,0.2)]"
    },
    {
      to: "/rock-paper-scissors",
      title: "Rock Paper Scissors",
      description: "Test your luck against the computer or battle a friend in secret selection mode!",
      icon: "✊✋✌️",
      color: "from-[#f04060] to-orange-400",
      shadow: "shadow-[0_0_15px_rgba(240,64,96,0.2)]"
    },
    {
      to: "/penalty-shootout",
      title: "Penalty Shootout",
      description: "Step up to the spot! Shoot past the keeper and make spectacular saves.",
      icon: "⚽🧤",
      color: "from-green-400 to-emerald-600",
      shadow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]"
    },
    {
      to: "/chess",
      title: "Grandmaster Chess",
      description: "Play classic Chess. Outsmart your opponent and capture the King!",
      icon: "♔♚",
      color: "from-indigo-400 to-blue-600",
      shadow: "shadow-[0_0_15px_rgba(99,102,241,0.2)]"
    }
  ];

  return (
    <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl flex-col px-3 py-8 sm:px-6 sm:py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
          Arcade Games
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto">
          Take a break from studying and play some classic casual games. Play solo against the AI or invite a friend to a lobby!
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto w-full">
        {games.map(game => (
          <Link
            key={game.to}
            to={game.to}
            className={`group relative overflow-hidden flex flex-col items-center text-center p-8 rounded-3xl border border-white/10 bg-[#0f172a]/80 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-[#1e293b] ${game.shadow}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`} />
            
            <div className="text-6xl mb-6 transform transition-transform duration-300 group-hover:scale-110 drop-shadow-2xl">
              {game.icon}
            </div>
            
            <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-widest">
              {game.title}
            </h2>
            
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              {game.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
