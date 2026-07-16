import { useState, useEffect, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGlobalSocket } from "../contexts/GlobalSocketContext";
import { recordRecentGame } from "../utils/gameConstants";

const PIECE_SYMBOLS = {
  w: { p: "♙", r: "♖", n: "♘", b: "♗", q: "♕", k: "♔" },
  b: { p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚" }
};

export default function ChessGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const { socket } = useGlobalSocket();

  const challenge = location.state?.challenge;
  const isMultiplayer = !!challenge?.roomId;
  const roomId = challenge?.roomId;
  // If timeLimit is provided, we use it (in seconds), else default to 0 (no time limit)
  const initialTimeLimit = challenge?.timeLimit || 0; 

  const [game, setGame] = useState(new Chess());
  const [board, setBoard] = useState(game.board());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [status, setStatus] = useState("White's Turn");

  // Multiplayer State
  const [myColor, setMyColor] = useState(isMultiplayer ? null : 'w'); 
  const [opponentName, setOpponentName] = useState(isMultiplayer ? "Opponent" : "Local Player");
  const [playersReady, setPlayersReady] = useState(!isMultiplayer);
  
  // Timer State (in seconds)
  const [whiteTime, setWhiteTime] = useState(initialTimeLimit);
  const [blackTime, setBlackTime] = useState(initialTimeLimit);
  const timerRef = useRef(null);

  // Formatting helper
  const formatTime = (seconds) => {
    if (seconds <= 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    recordRecentGame('chess');
  }, []);

  const updateStatus = useCallback(() => {
    if (whiteTime <= 0 && initialTimeLimit > 0) {
      setStatus("Game Over: White Flagged (Timeout)");
    } else if (blackTime <= 0 && initialTimeLimit > 0) {
      setStatus("Game Over: Black Flagged (Timeout)");
    } else if (game.isCheckmate()) {
      setStatus(`Checkmate! ${game.turn() === "w" ? "Black" : "White"} Wins!`);
    } else if (game.isDraw()) {
      setStatus("Game Over: Draw");
    } else if (game.isStalemate()) {
      setStatus("Game Over: Stalemate");
    } else if (game.isCheck()) {
      setStatus(`Check! ${game.turn() === "w" ? "White" : "Black"}'s Turn`);
    } else {
      setStatus(`${game.turn() === "w" ? "White" : "Black"}'s Turn`);
    }
    setBoard(game.board());
  }, [game, whiteTime, blackTime, initialTimeLimit]);

  // Handle Timers
  useEffect(() => {
    if (initialTimeLimit === 0) return; // No time limit
    if (game.isGameOver() || whiteTime <= 0 || blackTime <= 0 || !playersReady) {
      if (timerRef.current) clearInterval(timerRef.current);
      updateStatus();
      return;
    }

    timerRef.current = setInterval(() => {
      if (game.turn() === 'w') {
        setWhiteTime(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); return 0; }
          return prev - 1;
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); return 0; }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [game, playersReady, whiteTime, blackTime, initialTimeLimit, updateStatus]);

  // Sync clocks via socket periodically if we are the one moving
  useEffect(() => {
    if (isMultiplayer && socket && roomId && initialTimeLimit > 0) {
      const syncInterval = setInterval(() => {
        if (game.turn() === myColor && playersReady) {
          socket.emit("chess_time_update", { roomId, whiteTime, blackTime, activeColor: game.turn() });
        }
      }, 5000); // sync every 5 seconds
      return () => clearInterval(syncInterval);
    }
  }, [isMultiplayer, socket, roomId, initialTimeLimit, game, myColor, playersReady, whiteTime, blackTime]);

  // Socket logic
  useEffect(() => {
    if (isMultiplayer && socket && currentUser) {
      socket.emit("chess_join", { roomId, username: currentUser.username });

      const onInit = (data) => {
        if (data.playerWhite === currentUser.username) {
          setMyColor("w");
          setOpponentName(data.playerBlackName || "Opponent");
        } else {
          setMyColor("b");
          setOpponentName(data.playerWhiteName || "Opponent");
        }
        setPlayersReady(true);
      };

      const onMove = (data) => {
        // data: { from, to, promotion, fen }
        // Ensure our board matches their FEN
        if (game.fen() !== data.fen) {
          const newGame = new Chess(data.fen);
          setGame(newGame);
          updateStatus();
        }
      };

      const onClockSync = (data) => {
        // only accept if it's NOT our turn (to prevent snapping back our own clock)
        if (game.turn() !== myColor) {
          setWhiteTime(data.whiteTime);
          setBlackTime(data.blackTime);
        }
      };

      const onReset = () => {
        const newGame = new Chess();
        setGame(newGame);
        setSelectedSquare(null);
        setValidMoves([]);
        setWhiteTime(initialTimeLimit);
        setBlackTime(initialTimeLimit);
        updateStatus();
      };

      socket.on("chess_init", onInit);
      socket.on("chess_move", onMove);
      socket.on("chess_clock_sync", onClockSync);
      socket.on("chess_reset", onReset);

      return () => {
        socket.off("chess_init", onInit);
        socket.off("chess_move", onMove);
        socket.off("chess_clock_sync", onClockSync);
        socket.off("chess_reset", onReset);
      };
    }
  }, [isMultiplayer, socket, currentUser, roomId, game, myColor, initialTimeLimit, updateStatus]);

  const handleSquareClick = (squareStr) => {
    if (game.isGameOver() || (initialTimeLimit > 0 && (whiteTime <= 0 || blackTime <= 0)) || !playersReady) return;
    
    // In multiplayer, restrict to own color
    if (isMultiplayer && game.turn() !== myColor) return;

    const piece = game.get(squareStr);
    const isOwnPiece = piece && piece.color === game.turn();

    if (selectedSquare) {
      const moves = game.moves({ square: selectedSquare, verbose: true });
      const move = moves.find((m) => m.to === squareStr);

      if (move) {
        try {
          game.move({
            from: selectedSquare,
            to: squareStr,
            promotion: 'q'
          });
          
          if (isMultiplayer && socket) {
            socket.emit("chess_make_move", { 
              roomId, 
              from: selectedSquare, 
              to: squareStr, 
              promotion: 'q',
              fen: game.fen() // Send FEN to guarantee sync
            });
          }

          setSelectedSquare(null);
          setValidMoves([]);
          updateStatus();
        } catch (e) {
          console.error("Invalid move", e);
        }
      } else if (isOwnPiece) {
        setSelectedSquare(squareStr);
        setValidMoves(game.moves({ square: squareStr, verbose: true }).map(m => m.to));
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else {
      if (isOwnPiece) {
        setSelectedSquare(squareStr);
        setValidMoves(game.moves({ square: squareStr, verbose: true }).map(m => m.to));
      }
    }
  };

  const resetGame = () => {
    if (isMultiplayer && socket) {
      socket.emit("chess_request_reset", { roomId });
    } else {
      const newGame = new Chess();
      setGame(newGame);
      setWhiteTime(initialTimeLimit);
      setBlackTime(initialTimeLimit);
      setSelectedSquare(null);
      setValidMoves([]);
      updateStatus();
    }
  };

  const isFlipped = myColor === 'b'; // Black perspective

  const renderSquare = (rowIdx, colIdx) => {
    // Determine square coordinate based on flip
    const fileIdx = isFlipped ? 7 - colIdx : colIdx;
    const rankIdx = isFlipped ? rowIdx : 7 - rowIdx; 
    
    const file = String.fromCharCode(97 + fileIdx); 
    const rank = rankIdx + 1; 
    const squareStr = `${file}${rank}`;
    const piece = game.get(squareStr);

    const isLightSquare = (fileIdx + rankIdx) % 2 !== 0;
    const isSelected = selectedSquare === squareStr;
    const isValidMove = validMoves.includes(squareStr);
    const isCheck = piece && piece.type === 'k' && piece.color === game.turn() && game.isCheck();

    let bgClass = isLightSquare ? "bg-slate-200" : "bg-slate-500";
    if (isSelected) bgClass = "bg-yellow-300/80";
    if (isValidMove) {
      bgClass = piece ? "bg-rose-400/80" : isLightSquare ? "bg-slate-300/80" : "bg-slate-400/80";
    }
    if (isCheck) bgClass = "bg-red-500 animate-pulse";

    return (
      <div
        key={squareStr}
        onClick={() => handleSquareClick(squareStr)}
        className={`w-full aspect-square flex items-center justify-center cursor-pointer transition-colors duration-200 ${bgClass} shadow-inner relative`}
      >
        {isValidMove && !piece && (
          <div className="w-3 h-3 rounded-full bg-black/20 absolute"></div>
        )}
        {piece && (
          <span className={`text-4xl sm:text-5xl drop-shadow-md select-none transition-transform duration-200 ${isSelected ? 'scale-110' : ''} ${piece.color === 'w' ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-black drop-shadow-[0_2px_2px_rgba(255,255,255,0.4)]'}`}>
            {PIECE_SYMBOLS[piece.color][piece.type]}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] py-10 px-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 mb-2">Grandmaster Chess</h1>
        {isMultiplayer && (
          <div className="flex justify-center items-center gap-4 text-sm font-bold uppercase tracking-widest text-slate-400">
            <span className={myColor === 'w' ? 'text-white' : ''}>You (White)</span>
            <span className="text-[#40e0f0]">VS</span>
            <span className={myColor === 'b' ? 'text-white' : ''}>{opponentName} (Black)</span>
          </div>
        )}
        <p className={`text-lg font-bold mt-2 transition-all duration-300 ${game.isCheckmate() || (initialTimeLimit > 0 && (whiteTime <= 0 || blackTime <= 0)) ? 'text-rose-400 scale-110 drop-shadow-[0_0_10px_rgba(240,64,96,0.5)]' : 'text-slate-300'}`}>
          {!playersReady ? "Waiting for Opponent..." : status}
        </p>
      </div>

      <div className="w-full max-w-[500px] mb-8">
        {/* Opponent Timer / Info */}
        {initialTimeLimit > 0 && (
          <div className={`flex justify-between items-center mb-2 px-4 py-2 rounded-xl border border-white/10 ${game.turn() !== myColor ? 'bg-indigo-500/20' : 'bg-black/20'}`}>
            <span className="font-bold text-slate-300 uppercase tracking-widest text-xs">
              {isFlipped ? "White" : "Black"}
            </span>
            <span className="font-mono text-xl font-black text-white">
              {formatTime(isFlipped ? whiteTime : blackTime)}
            </span>
          </div>
        )}

        <div className="bg-[#0f172a] p-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
          <div className="w-full grid grid-cols-8 grid-rows-8 border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl bg-slate-800">
            {Array.from({ length: 8 }).map((_, r) => (
              Array.from({ length: 8 }).map((_, c) => renderSquare(r, c))
            ))}
          </div>
        </div>

        {/* Player Timer / Info */}
        {initialTimeLimit > 0 && (
          <div className={`flex justify-between items-center mt-2 px-4 py-2 rounded-xl border border-white/10 ${game.turn() === myColor ? 'bg-indigo-500/20' : 'bg-black/20'}`}>
            <span className="font-bold text-slate-300 uppercase tracking-widest text-xs">
              {isFlipped ? "Black (You)" : "White (You)"}
            </span>
            <span className="font-mono text-xl font-black text-white">
              {formatTime(isFlipped ? blackTime : whiteTime)}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={resetGame}
          className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
          disabled={!playersReady}
        >
          {game.isGameOver() || (initialTimeLimit > 0 && (whiteTime <= 0 || blackTime <= 0)) ? "Play Again" : "Reset Board"}
        </button>
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
