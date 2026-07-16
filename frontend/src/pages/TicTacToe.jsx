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
  const [score, setScore] = useState({ me: 0, opponent: 0 });
  
  // Track move history for infinite mode
  const [xMoves, setXMoves] = useState([]); // indices
  const [oMoves, setOMoves] = useState([]); // indices
  
  // Single player mode state
  const [singlePlayerSymbol, setSinglePlayerSymbol] = useState(
    () => Math.random() > 0.5 ? "X" : "O"
  );
  
  // Multiplayer state
  const [mySymbol, setMySymbol] = useState(null); // 'X' or 'O'
  const [opponentName, setOpponentName] = useState("Opponent");
  const [playersReady, setPlayersReady] = useState(false);

  // Single player mode: trigger AI if it's AI's turn
  useEffect(() => {
    if (!isMultiplayer && gameStatus === "playing") {
      const aiTurn = (xIsNext && singlePlayerSymbol === "O") || (!xIsNext && singlePlayerSymbol === "X");
      if (aiTurn) {
        const timer = setTimeout(() => {
          makeAIMove(board);
        }, 600); // Small delay for AI
        return () => clearTimeout(timer);
      }
    }
  }, [xIsNext, board, gameStatus, isMultiplayer, singlePlayerSymbol]);

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
        // Update score
        if (isMultiplayer) {
          if (squares[a] === mySymbol) {
            setScore(s => ({ ...s, me: s.me + 1 }));
          } else {
            setScore(s => ({ ...s, opponent: s.opponent + 1 }));
          }
        } else {
          if (squares[a] === singlePlayerSymbol) {
            setScore(s => ({ ...s, me: s.me + 1 }));
          } else {
            setScore(s => ({ ...s, opponent: s.opponent + 1 }));
          }
        }
        return squares[a];
      }
    }
    if (!squares.includes(null)) {
      setGameStatus("draw");
      return "draw";
    }
    return null;
  }, [isMultiplayer, mySymbol, singlePlayerSymbol]);

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
      const isMyTurn = (xIsNext && singlePlayerSymbol === "X") || (!xIsNext && singlePlayerSymbol === "O");
      if (!isMyTurn) return; // Wait for AI
      
      const newBoard = [...board];
      const newMoves = singlePlayerSymbol === "X" ? [...xMoves] : [...oMoves];
      
      if (gameMode === "infinite") {
        if (newMoves.length === 3) {
          newBoard[newMoves[0]] = null;
          newMoves.shift();
        }
        newMoves.push(i);
        if (singlePlayerSymbol === "X") setXMoves(newMoves);
        else setOMoves(newMoves);
      }
      
      newBoard[i] = singlePlayerSymbol;
      setBoard(newBoard);
      setXIsNext(!xIsNext);
      checkWin(newBoard);
    }
  };

  const getWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (!squares.includes(null)) return "draw";
    return null;
  };

  const minimax = (currentBoard, depth, isMaximizing, aiSym, userSym) => {
    let result = getWinner(currentBoard);
    if (result === aiSym) return 10 - depth;
    if (result === userSym) return depth - 10;
    if (result === 'draw') return 0;
    
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!currentBoard[i]) {
          currentBoard[i] = aiSym;
          let score = minimax(currentBoard, depth + 1, false, aiSym, userSym);
          currentBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!currentBoard[i]) {
          currentBoard[i] = userSym;
          let score = minimax(currentBoard, depth + 1, true, aiSym, userSym);
          currentBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const makeAIMove = (currentBoard) => {
    const aiSym = singlePlayerSymbol === "X" ? "O" : "X";
    let move = -1;
    
    if (gameMode === "classic") {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!currentBoard[i]) {
          currentBoard[i] = aiSym;
          let score = minimax(currentBoard, 0, false, aiSym, singlePlayerSymbol);
          currentBoard[i] = null;
          if (score > bestScore) {
            bestScore = score;
            move = i;
          }
        }
      }
    } else {
      // Infinite mode: Simple AI
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];
      
      // Check if AI can win
      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (currentBoard[a] === aiSym && currentBoard[b] === aiSym && !currentBoard[c]) move = c;
        if (currentBoard[a] === aiSym && currentBoard[c] === aiSym && !currentBoard[b]) move = b;
        if (currentBoard[b] === aiSym && currentBoard[c] === aiSym && !currentBoard[a]) move = a;
      }
      
      // Block player
      if (move === -1) {
        for (let i = 0; i < lines.length; i++) {
          const [a, b, c] = lines[i];
          if (currentBoard[a] === singlePlayerSymbol && currentBoard[b] === singlePlayerSymbol && !currentBoard[c]) move = c;
          if (currentBoard[a] === singlePlayerSymbol && currentBoard[c] === singlePlayerSymbol && !currentBoard[b]) move = b;
          if (currentBoard[b] === singlePlayerSymbol && currentBoard[c] === singlePlayerSymbol && !currentBoard[a]) move = a;
        }
      }
      
      // Random move
      if (move === -1) {
        const emptySpots = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (emptySpots.length > 0) {
          move = emptySpots[Math.floor(Math.random() * emptySpots.length)];
        }
      }
    }
    
    if (move !== -1) {
      const newBoard = [...currentBoard];
      const newMoves = aiSym === "X" ? [...xMoves] : [...oMoves];
      
      if (gameMode === "infinite") {
        if (newMoves.length === 3) {
          newBoard[newMoves[0]] = null;
          newMoves.shift();
        }
        newMoves.push(move);
        if (aiSym === "X") setXMoves(newMoves);
        else setOMoves(newMoves);
      }
      
      newBoard[move] = aiSym;
      setBoard(newBoard);
      setXIsNext(aiSym === "X" ? false : true);
      checkWin(newBoard);
    }
  };

  const resetGame = () => {
    if (isMultiplayer) {
      socket.emit("ttt_request_reset", { roomId });
    } else {
      setBoard(Array(9).fill(null));
      setSinglePlayerSymbol(Math.random() > 0.5 ? "X" : "O");
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
        return winner === singlePlayerSymbol ? "🎉 You Won!" : "🤖 Computer Won";
      }
    } else if (gameStatus === "draw") {
      return "🤝 It's a Draw!";
    } else {
      if (isMultiplayer) {
        if (!playersReady) return "Waiting for opponent...";
        return (mySymbol === "X" && xIsNext) || (mySymbol === "O" && !xIsNext) ? "Your Turn" : `${opponentName}'s Turn`;
      } else {
        const isMyTurn = (xIsNext && singlePlayerSymbol === "X") || (!xIsNext && singlePlayerSymbol === "O");
        return isMyTurn ? `Your Turn (${singlePlayerSymbol})` : `Computer's Turn (${singlePlayerSymbol === "X" ? "O" : "X"})`;
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

      <div className="flex justify-between w-full max-w-md mb-8 text-white text-xl font-black bg-[#0f172a] px-8 py-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(64,224,240,0.15)]">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#40e0f0] mb-1">You ({isMultiplayer ? mySymbol : singlePlayerSymbol})</p>
          <p className="text-3xl">{score.me}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Score</p>
          <p className="text-3xl text-slate-700">-</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#f04060] mb-1">{isMultiplayer ? opponentName : "AI"} ({isMultiplayer ? (mySymbol === 'X' ? 'O' : 'X') : (singlePlayerSymbol === 'X' ? 'O' : 'X')})</p>
          <p className="text-3xl">{score.opponent}</p>
        </div>
      </div>

      <div className="bg-[#0f172a]/80 border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl max-w-md w-full relative">
        <div className="mb-6 text-center h-8">
          <p className={`text-xl font-black uppercase tracking-widest transition-all duration-300 ${
            gameStatus === "won" ? (winner === (isMultiplayer ? mySymbol : singlePlayerSymbol) ? "text-[#40f080] scale-110 drop-shadow-[0_0_10px_rgba(64,240,128,0.5)]" : "text-rose-400 scale-110 drop-shadow-[0_0_10px_rgba(240,64,96,0.5)]") : "text-slate-300"
          }`}>
            {getStatusMessage()}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8 bg-slate-900/50 p-4 rounded-3xl relative border border-white/5 shadow-inner">
          {board.every(c => c === null) && (
            <div className="absolute -top-12 left-0 right-0 flex justify-center z-10">
              <button 
                onClick={toggleMode}
                className="bg-[#1e293b] hover:bg-[#334155] border border-white/10 px-5 py-2 rounded-full text-xs font-black text-slate-300 transition-all duration-300 uppercase tracking-widest flex items-center gap-2 shadow-lg hover:shadow-cyan-500/20"
              >
                Mode: <span className={gameMode === 'infinite' ? 'text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]' : 'text-[#40e0f0] drop-shadow-[0_0_5px_rgba(64,224,240,0.5)]'}>{gameMode}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"/></svg>
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
                className={`aspect-square bg-[#0f172a] rounded-2xl flex items-center justify-center text-7xl transition-all duration-300 disabled:cursor-not-allowed border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden relative group
                  ${cell === null && gameStatus === "playing" ? 'hover:bg-[#1e293b] hover:shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]' : ''}
                  ${isFading ? 'animate-pulse bg-red-950/40 border-red-500/30 shadow-[inset_0_0_30px_rgba(255,0,0,0.2)]' : ''}
                  ${gameStatus === "won" && cell === winner ? 'bg-white/10 shadow-[inset_0_0_30px_rgba(255,255,255,0.1)]' : ''}
                `}
                disabled={gameStatus !== "playing" || cell !== null}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cell === "X" ? "from-cyan-500/20 to-blue-500/20" : cell === "O" ? "from-rose-500/20 to-orange-500/20" : "opacity-0"} transition-opacity duration-300 ${cell ? 'opacity-100' : ''}`} />
                <span className={`relative z-10 transform transition-all duration-500 
                  ${cell === "X" ? "text-[#40e0f0] scale-100 font-black" : cell === "O" ? "text-[#f04060] scale-100 font-black" : "scale-0"} 
                  ${isFading ? 'opacity-30 scale-75' : 'drop-shadow-[0_0_15px_currentColor]'}
                  ${gameStatus === "won" && cell === winner ? 'scale-110 drop-shadow-[0_0_25px_currentColor] animate-bounce-short' : ''}
                `}>
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
