import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalSocket } from "../contexts/GlobalSocketContext";

const CHOICES = [
  { id: "rock", icon: "✊", color: "from-slate-500 to-slate-700", shadow: "shadow-slate-500/50" },
  { id: "paper", icon: "✋", color: "from-blue-400 to-blue-600", shadow: "shadow-blue-500/50" },
  { id: "scissors", icon: "✌️", color: "from-rose-400 to-rose-600", shadow: "shadow-rose-500/50" }
];

export default function RockPaperScissors() {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useGlobalSocket();

  const challenge = location.state?.challenge;
  const isMultiplayer = !!challenge?.roomId;
  const roomId = challenge?.roomId;

  const [myChoice, setMyChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [result, setResult] = useState(null); // win, lose, draw
  const [score, setScore] = useState({ me: 0, opponent: 0 });
  
  // Multiplayer state
  const [opponentName, setOpponentName] = useState("Opponent");
  const [opponentReady, setOpponentReady] = useState(false);

  useEffect(() => {
    if (isMultiplayer && socket && currentUser) {
      socket.emit("rps_join", { roomId, username: currentUser.username });

      const onInit = (data) => {
        const opp = data.players.find(p => p.username !== currentUser.username);
        if (opp) setOpponentName(opp.name);
      };

      const onOpponentReady = () => {
        setOpponentReady(true);
      };

      const onResult = (data) => {
        // data: { p1: { username, choice }, p2: { username, choice } }
        let me = data.p1.username === currentUser.username ? data.p1 : data.p2;
        let opp = data.p1.username === currentUser.username ? data.p2 : data.p1;
        
        setOpponentChoice(opp.choice);
        determineWinner(me.choice, opp.choice);
      };

      const onReset = () => {
        setMyChoice(null);
        setOpponentChoice(null);
        setResult(null);
        setOpponentReady(false);
      };

      socket.on("rps_init", onInit);
      socket.on("rps_opponent_ready", onOpponentReady);
      socket.on("rps_result", onResult);
      socket.on("rps_reset", onReset);

      return () => {
        socket.off("rps_init", onInit);
        socket.off("rps_opponent_ready", onOpponentReady);
        socket.off("rps_result", onResult);
        socket.off("rps_reset", onReset);
      };
    }
  }, [isMultiplayer, socket, roomId, currentUser]);

  const determineWinner = (mine, theirs) => {
    if (mine === theirs) {
      setResult("draw");
    } else if (
      (mine === "rock" && theirs === "scissors") ||
      (mine === "paper" && theirs === "rock") ||
      (mine === "scissors" && theirs === "paper")
    ) {
      setResult("win");
      setScore(s => ({ ...s, me: s.me + 1 }));
    } else {
      setResult("lose");
      setScore(s => ({ ...s, opponent: s.opponent + 1 }));
    }
  };

  const handleChoice = (choiceId) => {
    if (myChoice) return;
    setMyChoice(choiceId);

    if (isMultiplayer) {
      socket.emit("rps_make_choice", { roomId, username: currentUser.username, choice: choiceId });
    } else {
      // Single player AI
      setTimeout(() => {
        const aiChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
        setOpponentChoice(aiChoice);
        determineWinner(choiceId, aiChoice);
      }, 600);
    }
  };

  const resetRound = () => {
    if (isMultiplayer) {
      socket.emit("rps_request_reset", { roomId });
    } else {
      setMyChoice(null);
      setOpponentChoice(null);
      setResult(null);
    }
  };

  const getChoiceObj = (id) => CHOICES.find(c => c.id === id);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f04060] to-orange-400 mb-2">Rock Paper Scissors</h1>
        <p className="text-lg font-bold text-slate-300">
          {isMultiplayer ? `Vs ${opponentName}` : "Vs Computer"}
        </p>
      </div>

      <div className="flex justify-between w-full max-w-md mb-8 text-white text-xl font-black bg-[#0f172a] px-8 py-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(240,64,96,0.1)]">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#40e0f0] mb-1">You</p>
          <p className="text-3xl">{score.me}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Score</p>
          <p className="text-3xl text-slate-700">-</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#f04060] mb-1">{isMultiplayer ? opponentName : "AI"}</p>
          <p className="text-3xl">{score.opponent}</p>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl max-w-md w-full relative overflow-hidden">
        
        {/* Battle Arena */}
        <div className="flex justify-between items-center h-48 mb-8 relative">
          {/* Player Side */}
          <div className="flex flex-col items-center justify-center w-1/3">
            {myChoice ? (
              <div className={`text-6xl animate-bounce-short drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]`}>
                {getChoiceObj(myChoice)?.icon}
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-white/10 animate-spin-slow"></div>
            )}
          </div>

          <div className="text-2xl font-black italic text-slate-500 w-1/3 text-center">VS</div>

          {/* Opponent Side */}
          <div className="flex flex-col items-center justify-center w-1/3">
            {opponentChoice ? (
              <div className={`text-6xl animate-bounce-short drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]`}>
                {getChoiceObj(opponentChoice)?.icon}
              </div>
            ) : opponentReady && isMultiplayer ? (
              <div className="text-sm font-bold text-[#40f080] animate-pulse text-center">Ready!</div>
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-white/10 animate-spin-slow"></div>
            )}
          </div>
        </div>

        {/* Results / Status */}
        <div className="text-center h-12 mb-6">
          {result ? (
            <h2 className={`text-3xl font-black uppercase tracking-widest ${
              result === 'win' ? 'text-[#40f080]' : result === 'lose' ? 'text-rose-400' : 'text-slate-300'
            }`}>
              {result === 'win' ? 'You Win!' : result === 'lose' ? 'You Lose!' : 'Draw!'}
            </h2>
          ) : myChoice ? (
            <p className="text-sm font-bold text-slate-400 animate-pulse">Waiting for opponent...</p>
          ) : (
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Choose your weapon</p>
          )}
        </div>

        {/* Choice Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {CHOICES.map(c => (
            <button
              key={c.id}
              onClick={() => handleChoice(c.id)}
              disabled={!!myChoice}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                myChoice === c.id 
                  ? `bg-gradient-to-br ${c.color} shadow-lg ${c.shadow} scale-110 z-10 border border-white/30` 
                  : myChoice 
                    ? "bg-slate-800/50 opacity-30 grayscale cursor-not-allowed" 
                    : `bg-slate-800 hover:bg-slate-700 hover:scale-105 hover:shadow-lg ${c.shadow}`
              }`}
            >
              <span className="text-4xl mb-2">{c.icon}</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          {result && (
            <button
              onClick={resetRound}
              className="w-full rounded-2xl bg-gradient-to-r from-[#40e0f0] to-blue-500 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_0_15px_rgba(64,224,240,0.3)] hover:scale-[1.02] transition"
            >
              {isMultiplayer ? "Next Round" : "Play Again"}
            </button>
          )}
          
          <button
            onClick={() => navigate(isMultiplayer ? `/lobby?room=${roomId}` : "/")}
            className="w-full rounded-2xl bg-white/5 border border-white/10 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-300 hover:bg-white/10 transition"
          >
            {isMultiplayer ? "Back to Lobby" : "Menu"}
          </button>
        </div>

      </div>
    </div>
  );
}
