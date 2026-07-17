import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaTrophy } from "react-icons/fa";

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const directionRef = useRef(INITIAL_DIRECTION);

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setHasStarted(true);
    setIsPaused(false);
    setFood(generateFood(INITIAL_SNAKE));
  };

  useEffect(() => {
    const savedHighScore = localStorage.getItem("snakeHighScore");
    if (savedHighScore) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  useEffect(() => {
    if (gameOver && score > highScore) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHighScore(score);
      localStorage.setItem("snakeHighScore", score.toString());
    }
  }, [gameOver, score, highScore]);

  const handleKeyDown = useCallback(
    (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      if (!hasStarted && !gameOver) {
        setHasStarted(true);
      }
      if (e.key === " ") {
        e.preventDefault();
        if (gameOver) {
          resetGame();
        } else if (hasStarted) {
          setIsPaused((p) => !p);
        }
        return;
      }

      const { x, y } = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
          if (y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case "ArrowDown":
          if (y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
          if (x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case "ArrowRight":
          if (x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
        default:
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasStarted, gameOver]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameOver || isPaused || !hasStarted) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;
        const newHead = {
          x: head.x + currentDir.x,
          y: head.y + currentDir.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (
          prevSnake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)
        ) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10);
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [gameOver, isPaused, hasStarted, food, generateFood, score]);

  return (
    <div className="min-h-screen bg-[#080812] text-slate-200 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
        <Link
          to="/games"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl"
        >
          <FaArrowLeft /> Back to Arcade
        </Link>
        <div className="text-right">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
            SNAKE
          </h1>
        </div>
      </div>

      <div className="w-full max-w-md bg-[#131320] border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6 bg-white/5 rounded-2xl p-4">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">
              Score
            </p>
            <p className="text-3xl font-black text-white">{score}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-yellow-500/80 font-bold uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
              <FaTrophy /> Best
            </p>
            <p className="text-xl font-bold text-yellow-500">{highScore}</p>
          </div>
        </div>

        <div className="relative aspect-square w-full bg-[#0a0a0f] rounded-xl overflow-hidden border-2 border-white/5 shadow-inner">
          {Array.from({ length: GRID_SIZE }).map((_, y) =>
            Array.from({ length: GRID_SIZE }).map((_, x) => {
              const isSnake = snake.some((seg) => seg.x === x && seg.y === y);
              const isHead = snake[0].x === x && snake[0].y === y;
              const isFood = food.x === x && food.y === y;

              return (
                <div
                  key={`${x}-${y}`}
                  className="absolute"
                  style={{
                    width: `${100 / GRID_SIZE}%`,
                    height: `${100 / GRID_SIZE}%`,
                    left: `${(x * 100) / GRID_SIZE}%`,
                    top: `${(y * 100) / GRID_SIZE}%`,
                  }}
                >
                  {isSnake && (
                    <div
                      className={`w-full h-full border border-[#0a0a0f] ${
                        isHead ? "bg-green-400 rounded-sm" : "bg-green-600 rounded-sm opacity-90"
                      }`}
                    />
                  )}
                  {isFood && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-[70%] h-[70%] bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {!hasStarted && !gameOver && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center">
              <h2 className="text-3xl font-black text-white mb-2">READY?</h2>
              <p className="text-slate-300">Press any arrow key to start</p>
            </div>
          )}

          {isPaused && hasStarted && !gameOver && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <h2 className="text-4xl font-black text-white tracking-widest">PAUSED</h2>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center backdrop-blur-sm text-center px-4">
              <h2 className="text-4xl font-black text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                GAME OVER
              </h2>
              <p className="text-slate-200 mb-6 font-medium text-lg">
                Final Score: <span className="font-bold text-white">{score}</span>
              </p>
              <button
                onClick={resetGame}
                className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-slate-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400 font-medium bg-white/5 inline-block px-4 py-2 rounded-lg">
            Use <strong className="text-white">Arrow Keys</strong> to move •{" "}
            <strong className="text-white">Space</strong> to pause
          </p>
        </div>
      </div>
    </div>
  );
}
