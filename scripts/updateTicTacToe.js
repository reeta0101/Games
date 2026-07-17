const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/TicTacToe.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add setupPhase state
content = content.replace(
  'const [playMode, setPlayMode] = useState("computer"); // \'computer\' or \'local\'',
  'const [playMode, setPlayMode] = useState("computer");\n  const [setupPhase, setSetupPhase] = useState(!isMultiplayer);'
);

// 2. Add the setup UI right before return (
const renderSetupStr = `
  if (setupPhase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] py-10 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#40e0f0] to-blue-500 mb-2">Tic Tac Toe</h1>
          <p className="text-lg font-bold text-slate-300">Game Setup</p>
        </div>
        
        <div className="bg-[#0f172a]/80 border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl max-w-md w-full animate-fade-in-up">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 text-center">Opponent</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setPlayMode("computer")}
                  className={\`flex-1 rounded-2xl py-4 text-sm font-black transition \${playMode === "computer" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"}\`}
                >
                  Vs Computer
                </button>
                <button
                  onClick={() => setPlayMode("local")}
                  className={\`flex-1 rounded-2xl py-4 text-sm font-black transition \${playMode === "local" ? "bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"}\`}
                >
                  Pass & Play
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 text-center">Game Mode</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setGameMode("classic")}
                  className={\`flex-1 rounded-2xl py-4 text-sm font-black transition \${gameMode === "classic" ? "bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"}\`}
                >
                  Classic
                </button>
                <button
                  onClick={() => setGameMode("infinite")}
                  className={\`flex-1 rounded-2xl py-4 text-sm font-black transition \${gameMode === "infinite" ? "bg-pink-500/20 text-pink-400 border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.2)]" : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"}\`}
                >
                  Infinite
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => {
                 setSetupPhase(false);
                 resetGame();
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 text-sm font-black uppercase tracking-widest text-slate-950 hover:brightness-110 transition shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              Start Game
            </button>
            <button
              onClick={() => navigate("/games")}
              className="w-full rounded-2xl bg-white/5 py-4 text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition border border-white/10"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div`;
content = content.replace('  return (\n    <div', renderSetupStr);

// 3. Replace the bottom buttons
const oldButtons = `          {!isMultiplayer && (
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setPlayMode(prev => prev === "computer" ? "local" : "computer");
                  resetGame();
                }}
                className="flex-1 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-4 text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg hover:scale-[1.02] transition"
              >
                {playMode === "computer" ? "Vs AI" : "Pass & Play"}
              </button>
              
              <button
                onClick={toggleMode}
                disabled={!board.every(c => c === null)}
                className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 py-4 text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mode: {gameMode}
              </button>
            </div>
          )}`;
const newButtons = `          {!isMultiplayer && (
            <button
              onClick={() => setSetupPhase(true)}
              className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-4 text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg hover:scale-[1.02] transition"
            >
              Change Settings
            </button>
          )}`;
content = content.replace(oldButtons, newButtons);

fs.writeFileSync(filePath, content);
console.log('TicTacToe updated successfully!');
