import { useCallback, useEffect, useRef, useState } from "react";
import GameReader from "./GameReader";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import useSound from "../hooks/useSound";
import { useGlobalSocket } from "../contexts/GlobalSocketContext";
import { getCookie, setCookie, GUEST_COOKIE_NAME } from "../utils/cookies";
import { recordRecentGame } from "../App";
import { io } from "socket.io-client";
import {
  getLeaderboard,
  saveScore,
  getUserHighScores,
  getTimeAgo,
  DIFFICULTIES,
  MODE_LABELS,
  DIFF_LABELS,
} from "../utils/leaderboard";

const OPTION_KEYS = ["A", "B", "C", "D"];
const DIFFICULTY_OPTIONS = [
  {
    key: "beginner",
    icon: "🌱",
    label: "Beginner",
    time: "9 sec",
    note: "Warm up and build accuracy.",
  },
  {
    key: "intermediate",
    icon: "⚡",
    label: "Intermediate",
    time: "6 sec",
    note: "Balanced speed practice.",
  },
  {
    key: "advanced",
    icon: "🔥",
    label: "Advanced",
    time: "3 sec",
    note: "Exam-pressure recall.",
  },
];

export default function QuizGame({ game }) {
  const navigate = useNavigate();
  const location = useLocation();
  const challenge = location.state?.challenge;
  
  const timerRef = useRef(null);
  const advanceTimeoutRef = useRef(null);
  const endTimeoutRef = useRef(null);

  const currentUser = useSelector((state) => state.auth.currentUser);

  // Guest name state
  const [guestName, setGuestName] = useState(() => {
    if (currentUser) return currentUser.name;
    return getCookie(GUEST_COOKIE_NAME) || "";
  });
  const [guestInput, setGuestInput] = useState("");

  // Difficulty
  const [difficulty, setDifficulty] = useState(challenge?.difficulty || "intermediate");

  // Screens: guest → difficulty → game → end
  const [screen, setScreen] = useState(() => {
    if (currentUser) return "difficulty";
    if (getCookie(GUEST_COOKIE_NAME)) return "difficulty";
    return "guest";
  });
  const [readReturnScreen, setReadReturnScreen] = useState("difficulty");

  const [score, setScore] = useState(0);
  const [questionNum, setQuestionNum] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("neutral");
  const [resultState, setResultState] = useState({
    selected: null,
    correct: null,
  });
  const [finalMessage, setFinalMessage] = useState("");
  const [gameEndReason, setGameEndReason] = useState("");
  
  // Async leaderboard state for end screen
  const [top5, setTop5] = useState([]);
  const [personalBest, setPersonalBest] = useState(0);
  const [loadingScores, setLoadingScores] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live Multiplayer State
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const { socket } = useGlobalSocket();
  const [liveLobbyState, setLiveLobbyState] = useState(null);

  const [globalTimeLeft, setGlobalTimeLeft] = useState(null);
  const globalTimerRef = useRef(null);

  const activeTimeLimit = DIFFICULTIES[difficulty].timeMs;
  const isGlobalChallenge = !!challenge?.timeLimit;

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      if (globalTimerRef.current) {
        clearInterval(globalTimerRef.current);
      }
    };
  }, [clearTimers]);

  // Setup Socket.io for live matches
  useEffect(() => {
    if (challenge?.roomId && socket && currentUser) {
      // Re-join just in case we reloaded, but usually we are already in the room
      socket.emit("join_lobby", {
        roomId: challenge.roomId,
        user: { username: currentUser.username, name: currentUser.name }
      });

      const onLobbyState = (state) => {
        setLiveLobbyState(state);
      };
      
      socket.on("lobby_state", onLobbyState);
      
      return () => {
        socket.off("lobby_state", onLobbyState);
      };
    }
  }, [challenge?.roomId, currentUser, socket]);

  // ── Guest login ──
  const handleGuestLogin = () => {
    const name = guestInput.trim() || `Guest_${Math.floor(Math.random() * 9000 + 1000)}`;
    setCookie(GUEST_COOKIE_NAME, name, 7);
    setGuestName(name);
    setScreen("difficulty");
  };

  // ── Game logic ──
  const buildFinalMessage = useCallback((reason, currentScore) => {
    if (reason === "win") return "Last Player Standing! 🏆";
    if (reason === "quit") return "You quit. 🏳️";
    if (reason === "wrong") return "Wrong answer! 💥";
    if (reason === "timeout") return "Time ran out! ⏱";
    if (currentScore >= 150) return "Quiz Master! 🏆";
    if (currentScore >= 100) return "Great job! 🎯";
    if (currentScore >= 50) return "Keep practicing! 📚";
    return "You'll get better! 💪";
  }, []);

  const endGame = useCallback(
    async (reason, finalScore) => {
      clearTimers();
      if (globalTimerRef.current) {
        clearInterval(globalTimerRef.current);
        globalTimerRef.current = null;
      }
      setIsAnswered(true);
      setGameEndReason(reason);
      const scoreToSave = finalScore ?? score;
      setFinalMessage(buildFinalMessage(reason, scoreToSave));

      const answeredQs = reason === "wrong" || reason === "timeout" ? questionNum - 1 : questionNum;
      if (scoreToSave > 0) {
        await saveScore({
          name: guestName,
          score: scoreToSave,
          mode: game.key,
          difficulty,
          questions: answeredQs,
        });
      }

      setScreen("end");

      if (challenge?.roomId && socket) {
        const finalWrong = reason === "wrong" ? wrongAnswers + 1 : wrongAnswers;
        
        socket.emit("submit_score", {
          roomId: challenge.roomId,
          username: currentUser?.username || guestName,
          score: finalScore ?? score,
          correct: correctAnswers,
          wrong: finalWrong,
          status: "finished"
        });
      }
    },
    [buildFinalMessage, clearTimers, score, guestName, game.key, difficulty, questionNum, challenge?.roomId, correctAnswers, wrongAnswers, socket, currentUser],
  );

  // Auto-Win Logic for Sudden Death
  useEffect(() => {
    if (
      screen === "game" &&
      !isAnswered && 
      challenge?.roomId &&
      challenge?.wrongsAcceptable === false && 
      liveLobbyState
    ) {
      const players = liveLobbyState.players;
      if (players.length > 1) {
        const alivePlayers = players.filter(p => !p.finished);
        if (alivePlayers.length === 1 && alivePlayers[0].username === guestName) {
          clearTimers();
          setIsAnswered(true);
          setFeedbackText("🏆 LAST PLAYER STANDING!");
          setFeedbackTone("success");
          endTimeoutRef.current = setTimeout(() => {
            setScore((currentScore) => {
              endGame("win", currentScore);
              return currentScore;
            });
          }, 2000);
        }
      }
    }
  }, [liveLobbyState, screen, isAnswered, challenge, guestName, endGame, clearTimers]);

  const nextQuestion = useCallback(() => {
    clearTimers();
    const question = game.generateQuestion();
    setCurrentQuestion(question);
    setQuestionNum((v) => v + 1);
    setIsAnswered(false);
    setFeedbackText("");
    setFeedbackTone("neutral");
    setResultState({ selected: null, correct: null });

    setTimeLeft(activeTimeLimit / 1000);
    const startedAt = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, (activeTimeLimit - elapsed) / 1000);
      setTimeLeft(remaining);

      if (elapsed >= activeTimeLimit) {
        clearTimers();
        setIsAnswered(true);
        setStreak(0);
        setResultState({ selected: null, correct: question.correctValue });

        const isWrongsAcceptable = challenge && challenge.wrongsAcceptable !== false;
        
        if (isWrongsAcceptable) {
          setFeedbackText(`⏱ Too slow! It was ${question.correctValue}`);
          setFeedbackTone("danger");
          setWrongAnswers(prev => prev + 1);
          
          if (challenge?.roomId && socket) {
            socket.emit("submit_score", {
              roomId: challenge.roomId,
              username: currentUser?.username || guestName,
              score: score, // score stays the same
              correct: correctAnswers,
              wrong: wrongAnswers + 1,
              status: "playing"
            });
          }
          
          advanceTimeoutRef.current = setTimeout(() => nextQuestion(), 1200);
        } else {
          setFeedbackText("⏱ Time's up — Game Over!");
          setFeedbackTone("danger");
          
          endTimeoutRef.current = setTimeout(() => {
            setScore((currentScore) => {
              endGame("timeout", currentScore);
              return currentScore;
            });
          }, 1400);
        }
      }
    }, 50);
  }, [clearTimers, endGame, game, activeTimeLimit, challenge, socket, currentUser, guestName, score, correctAnswers, wrongAnswers]);

  const startGame = useCallback(() => {
    clearTimers();
    if (globalTimerRef.current) clearInterval(globalTimerRef.current);
    
    setScore(0);
    setQuestionNum(0);
    setStreak(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setFinalMessage("");
    setGameEndReason("");
    recordRecentGame(game.key);
    
    if (isGlobalChallenge) {
      setGlobalTimeLeft(challenge.timeLimit);
      const gameStartedAt = Date.now();
      globalTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - gameStartedAt;
        const remaining = Math.max(0, (challenge.timeLimit * 1000 - elapsed) / 1000);
        setGlobalTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(globalTimerRef.current);
          globalTimerRef.current = null;
          setIsAnswered(true);
          setFeedbackText("⏱ Time's up!");
          setFeedbackTone("danger");
          endTimeoutRef.current = setTimeout(() => {
            setScore((currentScore) => {
              endGame("timeout", currentScore);
              return currentScore;
            });
          }, 1000);
        }
      }, 50);
    }
    
    setScreen("game");
    nextQuestion();
  }, [clearTimers, game.key, isGlobalChallenge, challenge?.timeLimit, nextQuestion, endGame]);

  // Auto-start game if coming from a live lobby
  useEffect(() => {
    if (challenge?.roomId && screen === "difficulty") {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChoice = useCallback(
    (choice) => {
      if (isAnswered || screen !== "game" || !currentQuestion) return;

      clearTimers();
      setIsAnswered(true);

      let elapsed = 0;
      if (!isGlobalChallenge) {
        elapsed = activeTimeLimit / 1000 - timeLeft;
      } else {
        // Just use a fixed fast elapsed time for scoring in global mode
        elapsed = 1.0; 
      }

      const isCorrect = choice === currentQuestion.correctValue;

      if (isCorrect) {
        const points = game.getScorePoints(elapsed, isGlobalChallenge ? 5000 : activeTimeLimit);
        const nextScore = score + points;
        const nextStreak = streak + 1;

        setScore(nextScore);
        setStreak(nextStreak);
        setCorrectAnswers(prev => prev + 1);
        setFeedbackTone("success");
        setResultState({ selected: choice, correct: currentQuestion.correctValue });
        setFeedbackText(
          nextStreak >= 3
            ? `🔥 ${nextStreak}x streak! +${points}pts`
            : `+${points} pts`,
        );

        if (challenge?.roomId && socket) {
          socket.emit("submit_score", {
            roomId: challenge.roomId,
            username: currentUser?.username || guestName,
            score: nextScore,
            correct: correctAnswers + 1,
            wrong: wrongAnswers,
            status: "playing"
          });
        }

        advanceTimeoutRef.current = setTimeout(() => nextQuestion(), 1000);
        return;
      }

      // Wrong answer
      setStreak(0);
      setWrongAnswers(prev => prev + 1);
      setFeedbackTone("danger");
      setResultState({ selected: choice, correct: currentQuestion.correctValue });
      
      const isWrongsAcceptable = challenge && challenge.wrongsAcceptable !== false;

      if (challenge?.roomId && socket) {
        socket.emit("submit_score", {
          roomId: challenge.roomId,
          username: currentUser?.username || guestName,
          score: score,
          correct: correctAnswers,
          wrong: wrongAnswers + 1,
          status: "playing"
        });
      }

      if (isWrongsAcceptable) {
        setFeedbackText(`✗ It was ${currentQuestion.correctValue}`);
        advanceTimeoutRef.current = setTimeout(() => nextQuestion(), 1200);
      } else {
        setFeedbackText(`✗ It was ${currentQuestion.correctValue} — Game Over!`);
        endTimeoutRef.current = setTimeout(() => endGame("wrong", score), 1400);
      }
    },
    [currentQuestion, endGame, clearTimers, game, isAnswered, nextQuestion, screen, score, streak, timeLeft, activeTimeLimit, isGlobalChallenge, challenge, socket, currentUser, guestName, correctAnswers, wrongAnswers],
  );

  // Keyboard handler
  useEffect(() => {
    if (screen !== "game" || isAnswered || !currentQuestion) return undefined;
    const handler = (event) => {
      const index = ["a", "b", "c", "d"].indexOf(event.key.toLowerCase());
      if (index >= 0 && currentQuestion.options[index] !== undefined) {
        handleChoice(currentQuestion.options[index]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, isAnswered, currentQuestion, handleChoice]);

  // Fetch scores when end screen mounts
  useEffect(() => {
    if (screen === "end") {
      setLoadingScores(true);
      Promise.all([
        getLeaderboard(game.key, difficulty, 5),
        getUserHighScores(guestName)
      ]).then(([leaderboardData, highScoresData]) => {
        setTop5(leaderboardData);
        setPersonalBest(highScoresData[`${game.key}__${difficulty}`] || 0);
      }).catch(err => {
        console.error("Failed to fetch scores", err);
      }).finally(() => {
        setLoadingScores(false);
      });
    }
  }, [screen, game.key, difficulty, guestName]);

  const displayTime = isGlobalChallenge ? globalTimeLeft : timeLeft;
  const timerPercent = Math.max(0, (displayTime / (isGlobalChallenge ? challenge.timeLimit : (activeTimeLimit / 1000))) * 100);
  const isTimerDanger = timerPercent < 33;
  const progressItems = [
    { key: "guest", label: "Player" },
    { key: "difficulty", label: "Setup" },
    { key: "game", label: "Play" },
    { key: "end", label: "Result" },
  ];

  const feedbackClass =
    feedbackTone === "success"
      ? "text-[#40f080]"
      : feedbackTone === "danger"
        ? "text-[#f04060]"
        : "text-slate-400";

  const selectedClass = (choice) => {
    if (!currentQuestion) return "";
    if (choice === resultState.correct && isAnswered) {
      return "border-[#40f080] bg-[#40f080]/10 text-[#40f080] shadow-[0_0_20px_rgba(64,240,128,0.18)]";
    }
    if (choice === resultState.selected && isAnswered && resultState.selected !== resultState.correct) {
      return "border-[#f04060] bg-[#f04060]/10 text-[#f04060] shadow-[0_0_20px_rgba(240,64,96,0.18)]";
    }
    return "";
  };
  
  const handleChallengeClick = () => {
    const url = `${window.location.origin}/challenge?gameId=${game.key}&difficulty=${difficulty}&score=${score}&challenger=${encodeURIComponent(guestName)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ════════════════════════════════════════
  //  GUEST LOGIN SCREEN
  // ════════════════════════════════════════
  if (screen === "guest") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="surface w-full overflow-hidden rounded-3xl p-5 animate-soft-pop sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f0e040]/25 bg-[#f0e040]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f0e040]">
                Quick setup
              </div>
              <div className="text-5xl font-black uppercase tracking-[0.16em] text-white sm:text-6xl">
                {game.bigLetter}
              </div>
              <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">
                Start {game.title}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                Enter a display name so your score can appear on this device's leaderboard.
              </p>

              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                {progressItems.slice(0, 3).map((item, index) => (
                  <div
                    key={item.key}
                    className={`rounded-2xl border px-3 py-3 text-center text-xs font-bold uppercase tracking-[0.16em] ${
                      index === 0
                        ? "border-[#f0e040]/35 bg-[#f0e040]/10 text-[#f0e040]"
                        : "border-white/8 bg-white/[0.03] text-slate-500"
                    }`}
                  >
                    {index + 1}. {item.label}
                  </div>
                ))}
              </div>
            </div>

            <form
              className="rounded-3xl border border-white/10 bg-black/22 p-5 sm:p-6"
              onSubmit={(event) => {
                event.preventDefault();
                handleGuestLogin();
              }}
            >
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Display name
                </span>
                <input
                  type="text"
                  value={guestInput}
                  onChange={(e) => setGuestInput(e.target.value)}
                  placeholder="Your name"
                  maxLength={16}
                  autoFocus
                  className="touch-target w-full rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 text-center text-lg font-bold text-white tracking-[0.08em] placeholder:text-slate-500 outline-none transition focus:border-[#f0e040]/60 focus:bg-white/[0.07]"
                />
              </label>

              <button
                type="submit"
                className="touch-target mt-5 w-full rounded-2xl border border-[#f0e040]/60 bg-[#f0e040]/12 px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-[#f0e040] transition hover:bg-[#f0e040]/20"
              >
                Continue
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                Guest names are saved for 7 days in a cookie.
              </p>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="touch-target mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                Back to menu
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  // ════════════════════════════════════════
  //  DIFFICULTY SELECTION SCREEN
  // ════════════════════════════════════════
  if (screen === "difficulty") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="surface w-full overflow-hidden rounded-3xl p-5 animate-soft-pop sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-500">
                Player <span className="text-[#f0e040]">{guestName}</span>
              </div>
              <div className="text-5xl font-black uppercase tracking-[0.16em] text-white sm:text-6xl">
                {game.bigLetter}
              </div>
              <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">
                {game.title}
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                {game.intro}
              </p>

              <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">
                  Scoring
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {game.rules}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {game.reference}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-slate-500">
                Select difficulty
              </p>

              <div className="mt-4 grid gap-3">
                {DIFFICULTY_OPTIONS.map((d) => {
                  const active = difficulty === d.key;

                  return (
                    <button
                      key={d.key}
                      onClick={() => setDifficulty(d.key)}
                      aria-pressed={active}
                      className={`interactive-lift rounded-2xl border p-4 text-left transition duration-200 ${
                        active
                          ? "border-[#f0e040]/60 bg-[#f0e040]/12 shadow-[0_0_22px_rgba(240,224,64,0.13)]"
                          : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                      type="button"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{d.icon}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-white">
                              {d.label}
                            </span>
                            <span className="rounded-full bg-black/24 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                              {d.time}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {d.note}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <button
                  onClick={startGame}
                  className="touch-target rounded-2xl border border-[#f0e040]/60 bg-[#f0e040]/12 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#f0e040] transition hover:bg-[#f0e040]/22 sm:col-span-2"
                  type="button"
                >
                  Start quiz
                </button>
                <button
                  onClick={() => {
                    setReadReturnScreen("difficulty");
                    setScreen("read");
                  }}
                  className="touch-target rounded-2xl border border-[#40e0f0]/35 bg-[#40e0f0]/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#40e0f0] transition hover:bg-[#40e0f0]/18"
                  type="button"
                >
                  Read
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => navigate("/")}
                  className="touch-target w-full rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-400 transition hover:bg-white/10 hover:text-white"
                  type="button"
                >
                  Back to library
                </button>
                <button
                  onClick={() => navigate(`/lobby?gameId=${game.key}`)}
                  className="touch-target w-full rounded-2xl border border-[#f04060]/30 bg-[#f04060]/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-[#f04060] transition hover:bg-[#f04060]/20"
                  type="button"
                >
                  Challenge Friend
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ════════════════════════════════════════
  //  END SCREEN + LEADERBOARD
  // ════════════════════════════════════════

  if (screen === "end") {
    const diffInfo = DIFFICULTIES[difficulty];
    const answeredQs = gameEndReason === "wrong" || gameEndReason === "timeout" ? questionNum - 1 : questionNum;

    const myRank = top5.findIndex((e) => e.name === guestName && e.score === score);
    const isNewBest = score > 0 && score >= personalBest;

    let titleText = "Game Over!";
    if (challenge && gameEndReason !== "quit") {
      titleText = score > challenge.score ? "Challenge Won! 🎉" : "Challenge Lost! 💀";
    }

    const isMatchStillPlaying = challenge?.roomId && liveLobbyState && liveLobbyState.players.some(p => !p.finished);

    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-center shadow-[0_30px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:rounded-[2rem] sm:p-8">

          {/* Result */}
          <h1 className="text-3xl font-black text-white sm:text-5xl">{titleText}</h1>
          <p className="mt-4 text-lg text-slate-300">Your score</p>
          <div className="my-4 text-6xl font-black text-[#40e0f0] drop-shadow-[0_0_24px_rgba(64,224,240,0.35)]">
            {score}
          </div>

          {/* Personal best */}
          <div className="flex items-center justify-center gap-3">
            {isNewBest && (
              <span className="rounded-full border border-[#f0e040]/50 bg-[#f0e040]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#f0e040]">
                ★ New Best!
              </span>
            )}
            {personalBest > 0 && (
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Best: <span className="font-bold text-slate-300">{personalBest}</span>
              </span>
            )}
          </div>

          <p className="mt-3 text-lg text-slate-200">{finalMessage}</p>
          <p className="mt-1 text-sm text-slate-500 uppercase tracking-[0.2em]">
            {diffInfo.icon} {diffInfo.label} · {answeredQs} correct
          </p>

          {/* Match / Leaderboard */}
          <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-4">
            {challenge?.roomId ? (
              <>
                <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#f04060] font-bold">
                  🔴 {isMatchStillPlaying ? "WAITING FOR OTHERS..." : "LIVE MATCH RESULTS"}
                </p>
                {!liveLobbyState ? (
                  <p className="py-3 text-xs text-slate-500 tracking-[0.15em] animate-pulse">Syncing results...</p>
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      const sortedPlayers = [...liveLobbyState.players].sort((a, b) => b.finalScore - a.finalScore);
                      let currentRank = 1;
                      let lastScore = null;
                      const rankedPlayers = sortedPlayers.map((p, i) => {
                        if (p.finalScore !== lastScore) {
                          currentRank = i + 1;
                          lastScore = p.finalScore;
                        }
                        return { ...p, rank: currentRank };
                      });

                      return rankedPlayers.map((p, i) => {
                        const isMe = p.username === (currentUser?.username || guestName);
                        const isTie = rankedPlayers.filter(rp => rp.finalScore === p.finalScore).length > 1;
                        const medal = p.rank === 1 ? '👑' : p.rank;
                        return (
                        <div key={i} className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                          isMe ? 'border-[#f04060]/40 bg-[#f04060]/10 shadow-[0_0_16px_rgba(240,64,96,0.1)]' : 'border-white/8 bg-white/[0.03]'
                        }`}>
                          <span className="w-7 text-center text-lg font-black">{medal}</span>
                          <div className="min-w-0 text-left">
                            <div className={`truncate text-sm font-bold ${isMe ? 'text-[#f04060]' : 'text-white'}`}>
                              {p.name}{isMe && ' ← you'}
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                              {p.finished ? (
                                <span className="text-[#40f080]">{p.correct}✓</span> 
                              ) : (
                                <span className="animate-pulse">Playing...</span>
                              )}
                              {p.finished && ` · `}
                              {p.finished && (
                                <span className="text-[#f04060]">{p.wrong}✗</span>
                              )}
                            </div>
                          </div>
                          <div className={`text-xl font-black ${isMe ? 'text-[#f04060]' : 'text-slate-200'}`}>
                            {p.finished ? p.finalScore : '---'}
                          </div>
                        </div>
                      );
                      });
                    })()}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#f0e040]">
                  🏆 Top 5 — {MODE_LABELS[game.key] || game.key} · {diffInfo.label}
                </p>
                {loadingScores ? (
                  <p className="py-3 text-xs text-slate-500 tracking-[0.15em]">Loading scores...</p>
                ) : top5.length === 0 ? (
                  <p className="py-3 text-xs text-slate-500 tracking-[0.15em]">No scores yet. Be the first!</p>
                ) : (
                  <div className="space-y-2">
                    {top5.map((entry, i) => {
                      const isMe = i === myRank;
                      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                      return (
                        <div
                          key={i}
                          className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                            isMe
                              ? 'border-[#40e0f0]/40 bg-[#40e0f0]/8 shadow-[0_0_16px_rgba(64,224,240,0.1)]'
                              : 'border-white/8 bg-white/[0.03]'
                          }`}
                        >
                          <span className="w-7 text-center text-base font-black" style={{
                            color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#6060a0'
                          }}>
                            {medal ?? i + 1}
                          </span>
                          <div className="min-w-0 text-left">
                            <div className={`truncate text-sm font-bold ${isMe ? 'text-[#40e0f0]' : 'text-white'}`}>
                              {entry.name}{isMe && ' ← you'}
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                              {entry.questions || '?'}Q · {getTimeAgo(entry.createdAt || entry.timestamp || Date.now())}
                            </div>
                          </div>
                          <div className={`text-xl font-black ${isMe ? 'text-[#40e0f0]' : 'text-slate-200'}`}>
                            {entry.score}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {challenge?.roomId ? (
              <button
                onClick={() => navigate(`/lobby?room=${challenge.roomId}`)}
                className="rounded-full border border-[#f0e040]/60 bg-[#f0e040]/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-[#f0e040] transition hover:bg-[#f0e040]/20"
              >
                Back to Lobby
              </button>
            ) : (
              <>
                {score > 0 && (
                  <button
                    onClick={handleChallengeClick}
                    className="rounded-full border border-pink-400/60 bg-pink-400/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-pink-400 transition hover:bg-pink-400/20"
                  >
                    {copied ? "Copied!" : "Challenge a Friend"}
                  </button>
                )}
                <button
                  onClick={startGame}
                  className="rounded-full border border-[#f0e040]/60 bg-[#f0e040]/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-[#f0e040] transition hover:bg-[#f0e040]/20"
                >
                  Play Again
                </button>
                <button
                  onClick={() => setScreen("difficulty")}
                  className="rounded-full border border-orange-400/30 bg-orange-400/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-orange-400 transition hover:bg-orange-400/20"
                >
                  Reset
                </button>
              </>
            )}
            <button
              onClick={() => {
                setReadReturnScreen("end");
                setScreen("read");
              }}
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-[#40e0f0] transition hover:bg-white/10 hover:text-white"
            >
              Read
            </button>
            <button
              onClick={() => navigate("/")}
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-slate-300 transition hover:bg-white/10"
            >
              Menu
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ════════════════════════════════════════
  //  READ SCREEN
  // ════════════════════════════════════════
  if (screen === "read") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="surface w-full max-h-[85vh] flex flex-col rounded-3xl p-4 animate-soft-pop sm:p-8">
          <div className="mb-6 flex items-center justify-between shrink-0">
             <h2 className="text-xl sm:text-2xl font-black uppercase tracking-[0.15em] text-white" style={{ color: game.accent }}>
               {game.title} Reference
             </h2>
             <button
               onClick={() => setScreen(readReturnScreen)}
               className="touch-target rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-300 transition hover:bg-white/10"
               type="button"
             >
               Back
             </button>
          </div>
          <div className="overflow-y-auto pr-2 custom-scrollbar">
            <GameReader gameKey={game.key} />
          </div>
        </section>
      </main>
    );
  }

  // ════════════════════════════════════════
  //  GAME SCREEN
  // ════════════════════════════════════════
  return (
    <main className="mx-auto flex max-w-5xl flex-col px-3 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6 lg:px-8" style={{ minHeight: 'calc(100vh - 100px)', maxHeight: 'calc(100vh - 80px)' }}>
      <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_30px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:rounded-[2rem] sm:p-5">
        {/* Header row */}
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs uppercase tracking-[0.28em] text-[#f0e040] sm:text-sm sm:tracking-[0.35em]">
            {game.title}
          </div>
          <div className="text-left sm:text-right">
            <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
              {guestName} · {DIFFICULTIES[difficulty].icon} {DIFF_LABELS[difficulty]}
            </div>
            {challenge && (
              <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-pink-400 font-bold border border-pink-400/30 bg-pink-400/10 rounded-full px-2 py-0.5 inline-block">
                Target: {challenge.score} points by {challenge.challenger} in {challenge.timeLimit}s
              </div>
            )}
            <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-slate-400 sm:justify-end sm:gap-6 sm:text-sm sm:tracking-[0.25em]">
              <div>
                Score <span className="text-white">{score}</span>
              </div>
              <div>
                Q <span className="text-white">{questionNum}</span>
              </div>
              <div>
                Streak <span className="text-white">{streak}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="mt-3 shrink-0">
          <div
            className="relative h-2 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label="Time remaining"
            aria-valuemin={0}
            aria-valuemax={isGlobalChallenge ? challenge.timeLimit : activeTimeLimit / 1000}
            aria-valuenow={Number(displayTime?.toFixed(1) || 0)}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-75 ${
                isTimerDanger ? "animate-timer-warning" : ""
              }`}
              style={{
                width: `${timerPercent}%`,
                background: isTimerDanger ? '#f04060' : game.accent,
                boxShadow: `0 0 12px ${isTimerDanger ? '#f04060' : game.accent}`,
              }}
            />
          </div>
          <div
            className={`mt-1 flex justify-between text-[10px] uppercase tracking-[0.2em] ${
              isTimerDanger ? "text-[#f04060]" : "text-slate-500"
            }`}
          >
            {isGlobalChallenge && <span className="font-bold">Total Time</span>}
            <span>{displayTime?.toFixed(1)}s remaining</span>
          </div>
        </div>

        {/* Question — shrinks to fit */}
        <div className="mt-3 shrink overflow-hidden rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center sm:rounded-2xl sm:px-6 sm:py-4">
          <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500 sm:text-xs sm:tracking-[0.35em]">
            {game.prompt}
          </div>
          <div className={`mt-2 font-black text-white ${
            ['prime'].includes(game.key)
              ? 'text-3xl sm:text-5xl'
              : ['alphabet', 'square', 'cube', 'reverseAlphabet'].includes(game.key)
                ? 'text-4xl sm:text-6xl'
                : 'break-words text-lg leading-snug sm:text-2xl'
          }`}>
            {currentQuestion?.display}
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:text-xs sm:tracking-[0.3em]">
            {game.subtext}
          </div>
        </div>

        {/* Options — always visible */}
        <div className="mt-3 grid shrink-0 gap-2 sm:grid-cols-2 sm:gap-3">
          {currentQuestion?.options.map((choice, index) => {
            const statusClass = selectedClass(choice);

            return (
              <button
                key={`${choice}-${index}`}
                data-key={OPTION_KEYS[index]}
                disabled={isAnswered}
                onClick={() => handleChoice(choice)}
                type="button"
                aria-label={`Option ${OPTION_KEYS[index]}: ${choice}`}
                className={`relative flex min-h-[3rem] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center font-black tracking-[0.08em] text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#f0e040] hover:text-[#f0e040] disabled:cursor-not-allowed sm:min-h-[3.5rem] sm:rounded-2xl sm:px-5 sm:py-3 sm:tracking-[0.18em] ${
                  ['alphabet', 'square', 'cube', 'reverseAlphabet', 'prime'].includes(game.key)
                    ? 'text-base sm:text-xl'
                    : 'text-xs sm:text-base leading-tight'
                } ${statusClass}`}
              >
                <span className="absolute left-2 top-1.5 text-[9px] uppercase tracking-[0.25em] text-slate-500">
                  {OPTION_KEYS[index]}
                </span>
                {choice}
              </button>
            );
          })}
        </div>

        {/* Feedback + Quit */}
        <div className="mt-2 shrink-0 text-center">
          <div
            className={`min-h-5 text-xs uppercase tracking-[0.3em] sm:text-sm ${feedbackClass}`}
            aria-live="polite"
          >
            {feedbackText}
          </div>
          <button
            onClick={() => endGame("quit")}
            className="touch-target mt-1 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 transition hover:bg-white/10 sm:px-5 sm:py-2 sm:text-xs"
            type="button"
          >
            Quit
          </button>
        </div>
      </section>
    </main>
  );
}
