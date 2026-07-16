import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAudio } from "../hooks/useAudio";
import { getCookie, setCookie, GUEST_COOKIE_NAME } from "../utils/cookies";
import { recordRecentGame } from "../utils/gameConstants";
import {
  getLeaderboard,
  saveScore,
  getUserHighScores,
  getTimeAgo,
  DIFFICULTIES,
  MODE_LABELS,
  DIFF_LABELS,
} from "../utils/leaderboard";
import { useGlobalSocket } from "../contexts/GlobalSocketContext";
import { io } from "socket.io-client";

const COLORS = [
  {
    id: 0,
    name: "Red",
    class: "bg-red-500",
    glow: "shadow-red-500/50",
    tone: 329.63,
  }, // E4
  {
    id: 1,
    name: "Green",
    class: "bg-green-500",
    glow: "shadow-green-500/50",
    tone: 415.3,
  }, // G#4
  {
    id: 2,
    name: "Blue",
    class: "bg-blue-500",
    glow: "shadow-blue-500/50",
    tone: 523.25,
  }, // C5
  {
    id: 3,
    name: "Yellow",
    class: "bg-yellow-500",
    glow: "shadow-yellow-500/50",
    tone: 659.25,
  }, // E5
];

const DIFFICULTY_OPTIONS = [
  {
    key: "beginner",
    icon: "🌱",
    label: "Beginner",
    time: "Slow",
    note: "Longer pauses, slower sequence",
    initialSpeed: 1000,
    speedDecrement: 20,
    minSpeed: 400,
  },
  {
    key: "intermediate",
    icon: "⚡",
    label: "Intermediate",
    time: "Normal",
    note: "Standard Simon Says pace",
    initialSpeed: 700,
    speedDecrement: 30,
    minSpeed: 300,
  },
  {
    key: "advanced",
    icon: "🔥",
    label: "Advanced",
    time: "Fast",
    note: "Rapid sequences, minimal pauses",
    initialSpeed: 500,
    speedDecrement: 40,
    minSpeed: 200,
  },
];

export default function SimonSays() {
  const navigate = useNavigate();
  const location = useLocation();
  const challenge = location.state?.challenge;

  const timerRef = useRef(null);
  const sequenceTimeoutRef = useRef(null);
  const playbackTimeoutRef = useRef(null);

  const currentUser = useSelector((state) => state.auth.currentUser);

  // Guest name state
  const [guestName, setGuestName] = useState(() => {
    if (currentUser) return currentUser.name;
    return getCookie(GUEST_COOKIE_NAME) || "";
  });
  const [guestInput, setGuestInput] = useState("");

  // Difficulty
  const [difficulty, setDifficulty] = useState(
    challenge?.difficulty || "intermediate",
  );
  const diffConfig =
    DIFFICULTY_OPTIONS.find((d) => d.key === difficulty) ||
    DIFFICULTY_OPTIONS[1];

  // Audio hook
  const { playCorrect, playWrong, playStreak, playGameOver } = useAudio();

  // Screens: guest → difficulty → game → end
  const [screen, setScreen] = useState(() => {
    if (currentUser) return "difficulty";
    if (getCookie(GUEST_COOKIE_NAME)) return "difficulty";
    return "guest";
  });

  // Game State
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [flashIndex, setFlashIndex] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("neutral");
  const [finalMessage, setFinalMessage] = useState("");
  const [gameEndReason, setGameEndReason] = useState("");

  // Leaderboard state
  const [top5, setTop5] = useState([]);
  const [personalBest, setPersonalBest] = useState(0);
  const [loadingScores, setLoadingScores] = useState(false);
  const [copied, setCopied] = useState(false);

  // Multiplayer
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const { socket } = useGlobalSocket();
  const [liveLobbyState, setLiveLobbyState] = useState(null);
  const [serverGameOver, setServerGameOver] = useState(false);

  const activeTimeLimit = DIFFICULTIES[difficulty].timeMs;
  const isGlobalChallenge = !!challenge?.timeLimit;

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = null;
    }
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
  }, []);

  const playTone = useCallback((frequency, duration = 300) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
      oscillator.start(now);
      oscillator.stop(now + duration / 1000);
    } catch (e) {}
  }, []);

  const flashColor = useCallback(
    (colorId, duration = 400) => {
      setFlashIndex(colorId);
      playTone(COLORS[colorId].tone, duration);
      setTimeout(() => setFlashIndex(null), duration);
    },
    [playTone],
  );

  const playSequence = useCallback(async () => {
    setIsPlayingSequence(true);
    setUserSequence([]);

    for (let i = 0; i < sequence.length; i++) {
      await new Promise((resolve) => {
        playbackTimeoutRef.current = setTimeout(
          () => {
            flashColor(sequence[i]);
            resolve();
          },
          i === 0 ? 500 : diffConfig.initialSpeed,
        );
      });

      // Wait for flash to complete
      await new Promise((resolve) =>
        setTimeout(resolve, diffConfig.initialSpeed),
      );
    }

    setIsPlayingSequence(false);
  }, [sequence, diffConfig.initialSpeed, flashColor]);

  const addToSequence = useCallback(() => {
    const newColor = Math.floor(Math.random() * 4);
    setSequence((prev) => [...prev, newColor]);
    setLevel((prev) => prev + 1);
  }, []);

  const handleColorPress = useCallback(
    (colorId) => {
      if (isPlayingSequence || isGameOver) return;

      flashColor(colorId);
      setUserSequence((prev) => [...prev, colorId]);

      const currentIndex = userSequence.length;
      if (sequence[currentIndex] !== colorId) {
        // Wrong!
        playWrong();
        setFeedbackText("Wrong! 💥");
        setFeedbackTone("wrong");
        setTimeout(() => endGame("wrong"), 800);
        return;
      }

      // Correct so far
      playCorrect();

      if (userSequence.length + 1 === sequence.length) {
        // Completed the sequence!
        const pointsEarned = level * 10;
        setScore((prev) => prev + pointsEarned);
        setFeedbackText(`Level ${level}! +${pointsEarned} pts`);
        setFeedbackTone("correct");

        setTimeout(() => {
          addToSequence();
          playSequence();
        }, 1200);
      }
    },
    [
      isPlayingSequence,
      isGameOver,
      userSequence,
      sequence,
      level,
      flashColor,
      playCorrect,
      playWrong,
      addToSequence,
      playSequence,
    ],
  );

  const buildFinalMessage = useCallback(
    (reason, currentScore) => {
      if (reason === "win") return "Last Player Standing! 🏆";
      if (reason === "quit") return "You quit. 🏳️";
      if (reason === "wrong") return `Sequence broken at Level ${level}! 💥`;
      if (reason === "timeout") return "Time ran out! ⏱";
      if (currentScore >= 500) return "Memory Master! 🧠🏆";
      if (currentScore >= 200) return "Great memory! 🎯";
      if (currentScore >= 100) return "Good job! 👍";
      return "Keep training! 💪";
    },
    [level],
  );

  const endGame = useCallback(
    async (reason) => {
      clearTimers();
      setIsGameOver(true);
      setGameEndReason(reason);
      const scoreToSave = score;
      setFinalMessage(buildFinalMessage(reason, scoreToSave));
      playGameOver();

      if (scoreToSave > highScore) {
        setHighScore(scoreToSave);
      }

      if (scoreToSave > 0) {
        await saveScore({
          name: guestName,
          score: scoreToSave,
          mode: "simon_says",
          difficulty,
          questions: level,
        });
      }

      setScreen("end");

      if (challenge?.roomId && socket) {
        socket.emit("submit_score", {
          roomId: challenge.roomId,
          username: currentUser?.username || guestName,
          score: scoreToSave,
          correct: correctAnswers,
          wrong: wrongAnswers + (reason === "wrong" ? 1 : 0),
          status: "finished",
        });
      }
    },
    [
      buildFinalMessage,
      clearTimers,
      score,
      highScore,
      guestName,
      difficulty,
      level,
      challenge?.roomId,
      correctAnswers,
      wrongAnswers,
      socket,
      currentUser,
      playGameOver,
    ],
  );

  const startGame = useCallback(() => {
    setSequence([]);
    setUserSequence([]);
    setScore(0);
    setLevel(1);
    setIsGameOver(false);
    setFeedbackText("");
    setFeedbackTone("neutral");
    addToSequence();
    playSequence();
    recordRecentGame("simon_says");
  }, [addToSequence, playSequence]);

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (guestInput.trim()) {
      setGuestName(guestInput.trim());
      setCookie(GUEST_COOKIE_NAME, guestInput.trim(), 30);
      setScreen("difficulty");
    }
  };

  // Load personal best on mount
  useEffect(() => {
    if (currentUser) {
      getUserHighScores(currentUser.username, "simon_says").then((data) => {
        if (data.length > 0) setPersonalBest(data[0].score);
      });
    }
  }, [currentUser]);

  // Load leaderboard when game ends
  useEffect(() => {
    if (screen === "end") {
      setLoadingScores(true);
      getLeaderboard("simon_says", difficulty, 5).then((data) => {
        setTop5(data);
        setLoadingScores(false);
      });
    }
  }, [screen, difficulty]);

  // Socket.io for live matches
  useEffect(() => {
    if (challenge?.roomId && socket && currentUser) {
      socket.emit("join_lobby", {
        roomId: challenge.roomId,
        user: { username: currentUser.username, name: currentUser.name },
      });

      const onLobbyState = (state) => {
        setLiveLobbyState(state);
      };
      const onGameStarted = (settings) => {
        setScreen("game");
        startGame();
      };
      const onGameOver = () => {
        setServerGameOver(true);
      };

      socket.on("lobby_state", onLobbyState);
      socket.on("game_started", onGameStarted);
      socket.on("game_over", onGameOver);

      return () => {
        socket.off("lobby_state", onLobbyState);
        socket.off("game_started", onGameStarted);
        socket.off("game_over", onGameOver);
      };
    }
  }, [challenge?.roomId, socket, currentUser, startGame]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const currentSpeed = Math.max(
    diffConfig.minSpeed,
    diffConfig.initialSpeed - (level - 1) * diffConfig.speedDecrement,
  );

  // Render
  if (screen === "guest") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#080812]">
        <div className="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="text-3xl font-black text-white mb-2">Simon Says</h1>
          <p className="text-slate-400 mb-8">
            Watch the pattern. Repeat the pattern. How far can you go?
          </p>
          <form onSubmit={handleGuestSubmit} className="flex gap-3">
            <input
              type="text"
              value={guestInput}
              onChange={(e) => setGuestInput(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#40e0f0] focus:ring-1 focus:ring-[#40e0f0]"
              maxLength={16}
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#40e0f0] text-black font-black hover:bg-[#40e0f0]/90 transition"
            >
              Play
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (screen === "difficulty") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#080812]">
        <div className="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🧠</div>
            <h1 className="text-3xl font-black text-white mb-2">Simon Says</h1>
            <p className="text-slate-400">Select difficulty</p>
          </div>
          <div className="space-y-3">
            {DIFFICULTY_OPTIONS.map((d) => (
              <button
                key={d.key}
                onClick={() => {
                  setDifficulty(d.key);
                }}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  difficulty === d.key
                    ? "border-[#40e0f0] bg-[#40e0f0]/10"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{d.icon}</span>
                    <div>
                      <div className="font-black text-white">{d.label}</div>
                      <div className="text-xs text-slate-400">{d.note}</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-400">
                    {d.time}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-8">
            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#40e0f0] to-[#a78bfa] text-black font-black text-xl hover:opacity-90 transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#40e0f0]/20"
            >
              Start Game
            </button>
          </div>
          {currentUser && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate(-1)}
                className="text-sm text-slate-400 hover:text-white transition"
              >
                Back to menu
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "end") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#080812]">
        <div className="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center">
          <div className="text-6xl mb-4">
            {gameEndReason === "wrong" ? "💥" : "🏁"}
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            {finalMessage}
          </h1>
          <div className="text-4xl font-black text-[#40e0f0] mb-2">{score}</div>
          <div className="text-slate-400 mb-6">
            Level reached: {level} | High Score:{" "}
            {Math.max(highScore, personalBest)}
          </div>

          {loadingScores ? (
            <div className="text-slate-500">Loading leaderboard...</div>
          ) : (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                Top 5 - {DIFF_LABELS[difficulty]}
              </h3>
              <div className="space-y-2 text-left">
                {top5.length === 0 ? (
                  <div className="text-slate-500 text-center py-4">
                    No scores yet
                  </div>
                ) : (
                  top5.map((entry, i) => (
                    <div
                      key={entry._id}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/30 border border-white/5"
                    >
                      <span className="font-mono text-slate-400 w-8">
                        #{i + 1}
                      </span>
                      <span className="flex-1 text-white truncate pr-2">
                        {entry.name}
                      </span>
                      <span className="font-black text-[#40e0f0]">
                        {entry.score}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={startGame}
              className="flex-1 py-3 rounded-xl bg-[#40e0f0] text-black font-black hover:bg-[#40e0f0]/90 transition"
            >
              Play Again
            </button>
            <button
              onClick={() => {
                setScreen("difficulty");
                setScore(0);
                setLevel(1);
              }}
              className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition border border-white/10"
            >
              Change Difficulty
            </button>
          </div>
          <button
            onClick={() => navigate("/games")}
            className="mt-4 w-full py-2 text-sm text-slate-400 hover:text-white transition"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-[#080812] flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-[#080812]/90 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/games")}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            ←
          </button>
          <div>
            <h1 className="font-black text-white text-lg">Simon Says</h1>
            <div className="text-xs text-slate-400">
              {DIFF_LABELS[difficulty]}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">LEVEL</div>
            <div className="font-black text-white text-xl">{level}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">SCORE</div>
            <div className="font-black text-[#40e0f0] text-xl">{score}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">BEST</div>
            <div className="font-bold text-slate-300 text-lg">
              {Math.max(highScore, personalBest)}
            </div>
          </div>
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Status */}
        <div className="mb-6 min-h-[60px] flex items-center justify-center">
          {isPlayingSequence ? (
            <div className="flex items-center gap-3 text-yellow-400">
              <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium text-lg">
                Watch the pattern... ({sequence.length})
              </span>
            </div>
          ) : isGameOver ? (
            <div className="text-red-400 font-medium text-lg">Game Over!</div>
          ) : (
            <div className="text-green-400 font-medium text-lg">
              Your turn! Tap the colors in order
            </div>
          )}
        </div>

        {/* Feedback */}
        {feedbackText && (
          <div
            className={`mb-4 px-4 py-2 rounded-xl text-center font-medium transition-all ${
              feedbackTone === "correct"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : feedbackTone === "wrong"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
            }`}
          >
            {feedbackText}
          </div>
        )}

        {/* 4 Color Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-md w-full">
          {COLORS.map((color, index) => (
            <button
              key={color.id}
              onClick={() => handleColorPress(index)}
              disabled={isPlayingSequence || isGameOver}
              className={`
                aspect-square rounded-2xl border-4 transition-all duration-100
                ${color.class}
                ${flashIndex === index ? `${color.glow} ring-4 ring-white scale-105` : "hover:scale-102"}
                ${isPlayingSequence || isGameOver ? "opacity-50 pointer-events-none" : "opacity-100"}
                focus:outline-none focus:ring-2 focus:ring-white
              `}
              style={{
                boxShadow:
                  flashIndex === index
                    ? `0 0 40px 10px ${color.class.replace("bg-", "")}`
                    : "none",
              }}
              aria-label={color.name}
            >
              {/* Inner glow effect when active */}
              <div
                className={`w-full h-full rounded-xl ${flashIndex === index ? "bg-white/30" : ""} transition-opacity`}
              />
            </button>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-6 w-full max-w-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Sequence Progress</span>
            <span>
              {userSequence.length} / {sequence.length}
            </span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#40e0f0] to-[#a78bfa] rounded-full transition-all duration-300"
              style={{
                width: `${sequence.length > 0 ? (userSequence.length / sequence.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Speed indicator */}
        <div className="mt-4 text-xs text-slate-500">
          Speed: {currentSpeed}ms per color
        </div>
      </main>

      {/* Footer hint */}
      <footer className="px-4 py-3 border-t border-white/10 bg-[#080812]/90 backdrop-blur">
        <p className="text-center text-xs text-slate-500">
          {isPlayingSequence
            ? "Memorize the sequence..."
            : "Tap colors in the same order"}
        </p>
      </footer>
    </div>
  );
}
