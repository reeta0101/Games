import { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { useNavigate } from "react-router-dom";
import { recordRecentGame } from "../utils/gameConstants";

const PIECE_SYMBOLS = {
  w: { p: "♙", r: "♖", n: "♘", b: "♗", q: "♕", k: "♔" },
  b: { p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚" }
};

export default function ChessGame() {
  const navigate = useNavigate();
  const [game, setGame] = useState(new Chess());
  const [board, setBoard] = useState(game.board());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [status, setStatus] = useState("White's Turn");

  // Initialize analytics
  useEffect(() => {
    recordRecentGame('chess');
  }, []);

  const updateStatus = useCallback(() => {
    if (game.isCheckmate()) {
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
  }, [game]);

  const handleSquareClick = (squareStr) => {
    // If game is over, do nothing
    if (game.isGameOver()) return;

    const piece = game.get(squareStr);
    const isOwnPiece = piece && piece.color === game.turn();

    if (selectedSquare) {
      // Trying to move
      const moves = game.moves({ square: selectedSquare, verbose: true });
      const move = moves.find((m) => m.to === squareStr);

      if (move) {
        // Handle basic pawn promotion (always promote to Queen for simplicity)
        try {
          game.move({
            from: selectedSquare,
            to: squareStr,
            promotion: 'q' // Always promote to queen for now
          });
          setSelectedSquare(null);
          setValidMoves([]);
          updateStatus();
        } catch (e) {
          console.error("Invalid move", e);
        }
      } else if (isOwnPiece) {
        // Switch selection to another own piece
        setSelectedSquare(squareStr);
        setValidMoves(game.moves({ square: squareStr, verbose: true }).map(m => m.to));
      } else {
        // Clicked empty square or enemy piece that is not a valid move
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else {
      // No square selected yet
      if (isOwnPiece) {
        setSelectedSquare(squareStr);
        setValidMoves(game.moves({ square: squareStr, verbose: true }).map(m => m.to));
      }
    }
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setBoard(newGame.board());
    setSelectedSquare(null);
    setValidMoves([]);
    setStatus("White's Turn");
  };

  const renderSquare = (rowIdx, colIdx, piece) => {
    // chess.js board is 8x8. 
    // row 0 is Rank 8 (top), row 7 is Rank 1 (bottom).
    // col 0 is File a (left), col 7 is File h (right).
    const file = String.fromCharCode(97 + colIdx); // 'a' to 'h'
    const rank = 8 - rowIdx; // 8 to 1
    const squareStr = `${file}${rank}`;

    const isLightSquare = (rowIdx + colIdx) % 2 === 0;
    const isSelected = selectedSquare === squareStr;
    const isValidMove = validMoves.includes(squareStr);
    const isCheck = piece && piece.type === 'k' && piece.color === game.turn() && game.isCheck();

    let bgClass = isLightSquare ? "bg-slate-200" : "bg-slate-500";
    if (isSelected) bgClass = "bg-yellow-300/80";
    if (isValidMove) {
      // Show dot for empty, or red tint for capture
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
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 mb-2">Grandmaster Chess</h1>
        <p className={`text-lg font-bold transition-all duration-300 ${game.isCheckmate() ? 'text-rose-400 scale-110 drop-shadow-[0_0_10px_rgba(240,64,96,0.5)]' : 'text-slate-300'}`}>
          {status}
        </p>
      </div>

      <div className="w-full max-w-[500px] bg-[#0f172a] p-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.15)] mb-8">
        <div className="w-full grid grid-cols-8 grid-rows-8 border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl bg-slate-800">
          {board.map((row, rowIdx) => (
            row.map((piece, colIdx) => renderSquare(rowIdx, colIdx, piece))
          ))}
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={resetGame}
          className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg hover:scale-[1.02] transition"
        >
          {game.isGameOver() ? "Play Again" : "Reset Board"}
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
