import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ZONES = ["TL", "TC", "TR", "BL", "BC", "BR"];

export default function FootballGame() {
  const navigate = useNavigate();
  
  const [score, setScore] = useState({ me: 0, opponent: 0 });
  const [round, setRound] = useState(1);
  const [isMyTurn, setIsMyTurn] = useState(true); // true = shooting, false = goalkeeping
  const [gameStatus, setGameStatus] = useState("playing"); // playing, won, lost
  const [animating, setAnimating] = useState(false);
  
  const [ballPos, setBallPos] = useState("start");
  const [gkPos, setGkPos] = useState("start");
  const [message, setMessage] = useState("You are Striker! Pick a target.");

  // Check win condition after every turn (2 shots per round)
  const checkWin = (newScore) => {
    // If it's past round 5 (sudden death), and turns are equal (isMyTurn will be true next)
    if (round > 5 && !isMyTurn) {
      if (newScore.me > newScore.opponent) {
        setGameStatus("won");
        setMessage("🎉 You Won the Shootout!");
        return true;
      } else if (newScore.opponent > newScore.me) {
        setGameStatus("lost");
        setMessage("😞 You Lost the Shootout.");
        return true;
      }
    }
    
    // Normal 5 rounds check
    if (round <= 5) {
      const remainingShotsMe = isMyTurn ? 6 - round : 5 - round;
      const remainingShotsOpp = 5 - round;
      
      // If opponent can't catch up
      if (newScore.me > newScore.opponent + remainingShotsOpp) {
        setGameStatus("won");
        setMessage("🎉 You Won the Shootout!");
        return true;
      }
      
      // If I can't catch up
      if (newScore.opponent > newScore.me + remainingShotsMe) {
        setGameStatus("lost");
        setMessage("😞 You Lost the Shootout.");
        return true;
      }
    }
    
    return false;
  };

  const handleZoneClick = (zone) => {
    if (gameStatus !== "playing" || animating) return;
    setAnimating(true);
    
    const aiZone = ZONES[Math.floor(Math.random() * ZONES.length)];
    
    if (isMyTurn) {
      // User is shooting
      setBallPos(zone);
      setGkPos(aiZone);
      
      setTimeout(() => {
        const isGoal = zone !== aiZone;
        let newScore = { ...score };
        if (isGoal) {
          newScore.me += 1;
          setMessage("⚽ GOOOOAAAALLL!!!");
        } else {
          setMessage("🧤 SAVED! Great stop by the keeper.");
        }
        setScore(newScore);
        
        const gameOver = checkWin(newScore);
        
        setTimeout(() => {
          if (!gameOver) {
            setBallPos("start");
            setGkPos("start");
            setIsMyTurn(false);
            setMessage("You are Goalkeeper! Predict the shot.");
          }
          setAnimating(false);
        }, 2000);
      }, 500);
      
    } else {
      // User is Goalkeeper (zone = user dive, aiZone = ai shot)
      setGkPos(zone);
      setBallPos(aiZone);
      
      setTimeout(() => {
        const isGoal = zone !== aiZone;
        let newScore = { ...score };
        if (isGoal) {
          newScore.opponent += 1;
          setMessage("⚽ Goal... They scored.");
        } else {
          setMessage("🧤 WHAT A SAVE! You stopped it!");
        }
        setScore(newScore);
        
        const gameOver = checkWin(newScore);
        
        setTimeout(() => {
          if (!gameOver) {
            setBallPos("start");
            setGkPos("start");
            setIsMyTurn(true);
            setRound(r => r + 1);
            setMessage(`Round ${round + 1}! You are Striker.`);
          }
          setAnimating(false);
        }, 2000);
      }, 500);
    }
  };

  const resetGame = () => {
    setScore({ me: 0, opponent: 0 });
    setRound(1);
    setIsMyTurn(true);
    setGameStatus("playing");
    setBallPos("start");
    setGkPos("start");
    setMessage("You are Striker! Pick a target.");
  };

  const getBallPositionClass = () => {
    switch (ballPos) {
      case "start": return "bottom-4 left-1/2 -translate-x-1/2 scale-100";
      case "TL": return "top-8 left-[10%] scale-50";
      case "TC": return "top-8 left-1/2 -translate-x-1/2 scale-50";
      case "TR": return "top-8 right-[10%] translate-x-0 scale-50";
      case "BL": return "bottom-[30%] left-[10%] scale-50";
      case "BC": return "bottom-[30%] left-1/2 -translate-x-1/2 scale-50";
      case "BR": return "bottom-[30%] right-[10%] translate-x-0 scale-50";
      default: return "bottom-4 left-1/2 -translate-x-1/2 scale-100";
    }
  };

  const getGkPositionClass = () => {
    switch (gkPos) {
      case "start": return "bottom-[30%] left-1/2 -translate-x-1/2";
      case "TL": return "top-8 left-[15%] -rotate-45";
      case "TC": return "top-4 left-1/2 -translate-x-1/2 -translate-y-4";
      case "TR": return "top-8 right-[15%] rotate-45";
      case "BL": return "bottom-[20%] left-[20%] -rotate-90";
      case "BC": return "bottom-[30%] left-1/2 -translate-x-1/2";
      case "BR": return "bottom-[20%] right-[20%] rotate-90";
      default: return "bottom-[30%] left-1/2 -translate-x-1/2";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">Penalty Shootout</h1>
        <p className="text-lg font-bold text-slate-300">Vs AI</p>
      </div>

      <div className="flex justify-between w-full max-w-2xl mb-8 text-white text-xl font-black bg-[#0f172a] px-8 py-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-emerald-400 mb-1">You</p>
          <p className="text-3xl">{score.me}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Round {Math.min(round, 5)}{round > 5 ? ' (SD)' : ''}</p>
          <p className="text-3xl text-slate-700">-</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-rose-400 mb-1">Computer</p>
          <p className="text-3xl">{score.opponent}</p>
        </div>
      </div>

      <div className="mb-6 text-center h-8">
        <p className={`text-xl font-black uppercase tracking-widest transition-all duration-300 ${
          gameStatus === "won" ? "text-[#40f080] scale-110 drop-shadow-[0_0_10px_rgba(64,240,128,0.5)]" : 
          gameStatus === "lost" ? "text-rose-400 scale-110 drop-shadow-[0_0_10px_rgba(240,64,96,0.5)]" : 
          "text-slate-300"
        }`}>
          {message}
        </p>
      </div>

      {/* Football Pitch / Goal */}
      <div className="relative w-full max-w-2xl aspect-[16/10] bg-gradient-to-b from-green-600 to-green-800 rounded-t-3xl overflow-hidden border-4 border-b-0 border-white/80 shadow-2xl mb-8">
        
        {/* Goal Net Pattern */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }}></div>
        
        {/* Goal Posts */}
        <div className="absolute top-0 left-0 w-4 h-full bg-slate-300 border-r border-slate-400 shadow-xl z-10"></div>
        <div className="absolute top-0 right-0 w-4 h-full bg-slate-300 border-l border-slate-400 shadow-xl z-10"></div>
        <div className="absolute top-0 left-0 w-full h-4 bg-slate-300 border-b border-slate-400 shadow-xl z-10"></div>

        {/* Goalkeeper */}
        <div className={`absolute w-16 h-24 transition-all duration-500 ease-out z-20 ${getGkPositionClass()}`}>
          <div className="w-full h-full relative">
            {/* GK Body */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-16 bg-blue-600 rounded-t-xl border-2 border-blue-800"></div>
            {/* GK Head */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-orange-300 rounded-full border-2 border-orange-500"></div>
            {/* GK Gloves */}
            <div className="absolute top-6 -left-4 w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-600"></div>
            <div className="absolute top-6 -right-4 w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-600"></div>
          </div>
        </div>

        {/* The Ball */}
        <div className={`absolute w-12 h-12 transition-all duration-500 ease-in-out z-30 flex items-center justify-center text-4xl drop-shadow-2xl ${getBallPositionClass()}`}>
          ⚽
        </div>

        {/* Interaction Zones */}
        {gameStatus === "playing" && (
          <div className="absolute inset-0 z-40 grid grid-cols-3 grid-rows-2">
            {ZONES.map((zone) => (
              <button
                key={zone}
                disabled={animating}
                onClick={() => handleZoneClick(zone)}
                className={`w-full h-full border border-dashed transition-colors duration-300
                  ${animating ? 'border-transparent cursor-default' : 'border-white/10 hover:bg-white/10 hover:border-white/40 cursor-crosshair'}
                `}
                aria-label={`Target ${zone}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 w-full max-w-md">
        {(gameStatus === "won" || gameStatus === "lost") && (
          <button
            onClick={resetGame}
            className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 py-4 text-sm font-black uppercase tracking-[0.2em] text-black shadow-lg hover:scale-[1.02] transition"
          >
            Play Again
          </button>
        )}
        <button
          onClick={() => navigate("/games")}
          className="flex-1 rounded-2xl bg-white/5 border border-white/10 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-300 hover:bg-white/10 transition"
        >
          Games Menu
        </button>
      </div>
    </div>
  );
}
