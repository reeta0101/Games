import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalSocket } from "../contexts/GlobalSocketContext";

export default function TicTacToe() {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useGlobalSocket();

  const challenge = location.state?.challenge;
  const isMultiplayer = !!challenge?.roomId;
  const roomId = challenge?.roomId;

  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameStatus, setGameStatus] = useState("playing"); // playing, won, draw
  const [winner, setWinner] = useState(null);
  const [gameMode, setGameMode] = useState("classic"); // classic, infinite
  
  // Track move history for infinite mode
  const [xMoves, setXMoves] = useState([]); // indices
  const [oMoves, setOMoves] = useState([]); // indices
  
  // Multiplayer state
  const [mySymbol, setMySymbol] = useState(null); // 'X' or 'O'
  const [opponentName, setOpponentName] = useState("Opponent");
  const [playersReady, setPlayersReady] = useState(false);

  // Single player mode: user is X, AI is O
  useEffect(() => {
    if (!isMultiplayer && !xIsNext && gameStatus === "playing") {
      const timer = setTimeout(() => {
        makeAIMove(board);
      }, 600); // Small delay for AI
      return () => clearTimeout(timer);
    }
  }, [xIsNext, board, gameStatus, isMultiplayer]);

  // Multiplayer Socket Setup
  useEffect(() => {
    if (isMultiplayer && socket && currentUser) {
      socket.emit("ttt_join", { roomId, username: currentUser.username });

      const onInit = (data) => {
        // data: { playerX, playerO }
        if (data.playerX === currentUser.username) {
          setMySymbol("X");
          setOpponentName(data.playerOName || "Opponent");
        } else {
          setMySymbol("O");
          setOpponentName(data.playerXName || "Opponent");
        }
        setPlayersReady(true);
      };

      const onMove = (data) => {
        setBoard(data.board);
        setXIsNext(data.xIsNext);
        if (data.gameMode) setGameMode(data.gameMode);
        if (data.xMoves) setXMoves(data.xMoves);
        if (data.oMoves) setOMoves(data.oMoves);
        checkWin(data.board);
      };

      const onModeChange = (newMode) => {
        setGameMode(newMode);
      };

      const onReset = () => {
        setBoard(Array(9).fill(null));
        setXIsNext(true);
        setGameStatus("playing");
        setWinner(null);
        setXMoves([]);
        setOMoves([]);
      };

      socket.on("ttt_init", onInit);
      socket.on("ttt_move", onMove);
      socket.on("ttt_mode_change", onModeChange);
      socket.on("ttt_reset", onReset);

      return () => {
        socket.off("ttt_init", onInit);
        socket.off("ttt_move", onMove);
        socket.off("ttt_mode_change", onModeChange);
        socket.off("ttt_reset", onReset);
      };
    }
  }, [isMultiplayer, socket, roomId, currentUser]);

  const checkWin = useCallback((squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        setWinner(squares[a]);
        setGameStatus("won");
        return squares[a];
      }
    }
    if (!squares.includes(null)) {
      setGameStatus("draw");
      return "draw";
    }
    return null;
  }, []);

  const handleClick = (i) => {
    if (gameStatus !== "playing" || board[i]) return;

    if (isMultiplayer) {
      if (!playersReady || (mySymbol === "X" && !xIsNext) || (mySymbol === "O" && xIsNext)) {
        return; // Not your turn
      }
      
      const newBoard = [...board];
      const newXMoves = [...xMoves];
      const newOMoves = [...oMoves];
      
      if (gameMode === "infinite") {
        if (mySymbol === "X") {
          if (newXMoves.length === 3) {
            newBoard[newXMoves[0]] = null;
            newXMoves.shift();
          }
          newXMoves.push(i);
        } else {
          if (newOMoves.length === 3) {
            newBoard[newOMoves[0]] = null;
            newOMoves.shift();
          }
          newOMoves.push(i);
        }
      }
      
      newBoard[i] = mySymbol;
      setBoard(newBoard);
      if (gameMode === "infinite") {
        setXMoves(newXMoves);
        setOMoves(newOMoves);
      }
      setXIsNext(!xIsNext);
      const winResult = checkWin(newBoard);
      
      socket.emit("ttt_make_move", {
        roomId,
        board: newBoard,
        xIsNext: !xIsNext,
        gameMode,
        xMoves: newXMoves,
        oMoves: newOMoves
      });
      
      if (winResult && winResult !== 'draw') {
        socket.emit("submit_score", {
          roomId,
          username: currentUser.username,
          score: mySymbol === winResult ? 1 : 0,
          correct: mySymbol === winResult ? 1 : 0,
          wrong: mySymbol === winResult ? 0 : 1,
          status: "finished"
        });
      } else if (winResult === 'draw') {
        socket.emit("submit_score", {
          roomId,
          username: currentUser.username,
          score: 0, correct: 0, wrong: 0, status: "finished"
        });
      }
      
    } else {
      // Single Player Mode
      if (!xIsNext) return; // Wait for AI
      
      const newBoard = [...board];
      const newXMoves = [...xMoves];
      
      if (gameMode === "infinite") {
        if (newXMoves.length === 3) {
          newBoard[newXMoves[0]] = null;
          newXMoves.shift();
        }
        newXMoves.push(i);
        setXMoves(newXMoves);
      }
      
      newBoard[i] = "X";
      setBoard(newBoard);
      setXIsNext(false);
      checkWin(newBoard);
    }
  };

  const makeAIMove = (currentBoard) => {
    // Simple AI: block player win, otherwise random
    let move = -1;
    
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    // Check if AI can win
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (currentBoard[a] === "O" && currentBoard[b] === "O" && !currentBoard[c]) move = c;
      if (currentBoard[a] === "O" && currentBoard[c] === "O" && !currentBoard[b]) move = b;
      if (currentBoard[b] === "O" && currentBoard[c] === "O" && !currentBoard[a]) move = a;
    }
    
    // Block player
    if (move === -1) {
      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (currentBoard[a] === "X" && currentBoard[b] === "X" && !currentBoard[c]) move = c;
        if (currentBoard[a] === "X" && currentBoard[c] === "X" && !currentBoard[b]) move = b;
        if (currentBoard[b] === "X" && currentBoard[c] === "X" && !currentBoard[a]) move = a;
      }
    }
    
    // Random move
    if (move === -1) {
      const emptySpots = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
      if (emptySpots.length > 0) {
        move = emptySpots[Math.floor(Math.random() * emptySpots.length)];
      }
    }
    
    if (move !== -1) {
      const newBoard = [...currentBoard];
      const newOMoves = [...oMoves];
      
      if (gameMode === "infinite") {
        if (newOMoves.length === 3) {
          newBoard[newOMoves[0]] = null;
          newOMoves.shift();
        }
        newOMoves.push(move);
        setOMoves(newOMoves);
      }
      
      newBoard[move] = "O";
      setBoard(newBoard);
      setXIsNext(true);
      checkWin(newBoard);
    }
  };

  const resetGame = () => {
    if (isMultiplayer) {
      socket.emit("ttt_request_reset", { roomId });
    } else {
      setBoard(Array(9).fill(null));
      setXIsNext(true);
      setGameStatus("playing");
      setWinner(null);
      setXMoves([]);
      setOMoves([]);
    }
  };

  const toggleMode = () => {
    const newMode = gameMode === "classic" ? "infinite" : "classic";
    setGameMode(newMode);
    if (isMultiplayer) {
      socket.emit("ttt_set_mode", { roomId, gameMode: newMode });
    }
  };

  const getStatusMessage = () => {
    if (gameStatus === "won") {
      if (isMultiplayer) {
        return winner === mySymbol ? "🎉 You Won!" : `😞 ${opponentName} Won`;
      } else {
        return winner === "X" ? "🎉 You Won!" : "🤖 Computer Won";
      }
    } else if (gameStatus === "draw") {
      return "🤝 It's a Draw!";
    } else {
      if (isMultiplayer) {
        if (!playersReady) return "Waiting for opponent...";
        return (mySymbol === "X" && xIsNext) || (mySymbol === "O" && !xIsNext) ? "Your Turn" : `${opponentName}'s Turn`;
      } else {
        return xIsNext ? "Your Turn (X)" : "Computer's Turn (O)";
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#40e0f0] to-blue-500 mb-2">Tic Tac Toe</h1>
        <p className="text-lg font-bold text-slate-300">
          {isMultiplayer ? `Vs ${opponentName}` : "Vs Computer"}
        </p>
      </div>

      <div className="bg-[#0f172a] border border-white/10 p-8 rounded-3xl shadow-[0_0_40px_rgba(64,224,240,0.1)] backdrop-blur-xl max-w-md w-full">
        <div className="mb-8 text-center h-8">
          <p className={`text-xl font-black uppercase tracking-widest ${
            gameStatus === "won" ? (winner === (isMultiplayer ? mySymbol : "X") ? "text-[#40f080]" : "text-rose-400") : "text-slate-300"
          }`}>
            {getStatusMessage()}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8 bg-white/5 p-3 rounded-2xl relative">
          {board.every(c => c === null) && (
            <div className="absolute -top-12 left-0 right-0 flex justify-center">
              <button 
                onClick={toggleMode}
                className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold text-slate-300 transition uppercase tracking-widest flex items-center gap-2"
              >
                Mode: <span className={gameMode === 'infinite' ? 'text-purple-400' : 'text-[#40e0f0]'}>{gameMode}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"/></svg>
              </button>
            </div>
          )}

          {board.map((cell, i) => {
            const isFadingX = gameMode === "infinite" && cell === "X" && xMoves.length === 3 && xMoves[0] === i;
            const isFadingO = gameMode === "infinite" && cell === "O" && oMoves.length === 3 && oMoves[0] === i;
            const isFading = isFadingX || isFadingO;
            
            return (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className={`aspect-square bg-[#1e293b] rounded-xl flex items-center justify-center text-6xl transition-all duration-300 hover:bg-[#334155] disabled:cursor-not-allowed border border-white/5 shadow-inner ${isFading ? 'animate-pulse bg-red-900/20 border-red-500/30' : ''}`}
                disabled={gameStatus !== "playing" || cell !== null}
              >
                <span className={`transform transition-all duration-500 ${cell === "X" ? "text-[#40e0f0] scale-100" : cell === "O" ? "text-[#f04060] scale-100" : "scale-0"} ${isFading ? 'opacity-30 scale-90' : 'drop-shadow-[0_0_10px_currentColor]'}`}>
                  {cell}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={resetGame}
            className="w-full rounded-2xl bg-gradient-to-r from-[#f0e040] to-orange-400 py-4 text-sm font-black uppercase tracking-[0.2em] text-black shadow-lg hover:scale-[1.02] transition"
          >
            {isMultiplayer ? "Request Restart" : "Play Again"}
          </button>
          
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
