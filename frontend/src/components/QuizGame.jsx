import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getCookie, setCookie, GUEST_COOKIE_NAME } from "../utils/cookies";
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

export default function QuizGame({ game }) {
  const navigate = useNavigate();
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
  const [difficulty, setDifficulty] = useState("intermediate");

  // Screens: guest → difficulty → game → end
  const [screen, setScreen] = useState(() => {
    if (currentUser) return "difficulty";
    if (getCookie(GUEST_COOKIE_NAME)) return "difficulty";
    return "guest";
  });

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

  const activeTimeLimit = DIFFICULTIES[difficulty].timeMs;

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
    return () => clearTimers();
  }, [clearTimers]);

  // ── Guest login ──
  const handleGuestLogin = () => {
    const name = guestInput.trim() || `Guest_${Math.floor(Math.random() * 9000 + 1000)}`;
    setCookie(GUEST_COOKIE_NAME, name, 7);
    setGuestName(name);
    setScreen("difficulty");
  };

  // ── Game logic ──
  const buildFinalMessage = useCallback((reason, currentScore) => {
    if (reason === "quit") return "You quit. 🏳️";
    if (reason === "wrong") return "Wrong answer! 💥";
    if (reason === "timeout") return "Time ran out! ⏱";
    if (currentScore >= 150) return "Quiz Master! 🏆";
    if (currentScore >= 100) return "Great job! 🎯";
    if (currentScore >= 50) return "Keep practicing! 📚";
    return "You'll get better! 💪";
  }, []);

  const endGame = useCallback(
    (reason) => {
      clearTimers();
      setIsAnswered(true);
      setGameEndReason(reason);
      setFinalMessage(buildFinalMessage(reason, score));

      // Save to leaderboard
      const answeredQs = reason === "wrong" || reason === "timeout" ? questionNum - 1 : questionNum;
      if (score > 0) {
        saveScore({
          name: guestName,
          score,
          mode: game.key,
          difficulty,
          questions: answeredQs,
        });
      }

      setScreen("end");
    },
    [buildFinalMessage, clearTimers, score, guestName, game.key, difficulty, questionNum],
  );

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
        setFeedbackText("⏱ Time's up — Game Over!");
        setFeedbackTone("danger");
        setResultState({ selected: null, correct: question.correctValue });

        endTimeoutRef.current = setTimeout(() => {
          endGame("timeout");
        }, 1400);
      }
    }, 50);
  }, [clearTimers, endGame, game, activeTimeLimit]);

  const startGame = () => {
    clearTimers();
    setScore(0);
    setQuestionNum(0);
    setStreak(0);
    setFinalMessage("");
    setGameEndReason("");
    setScreen("game");
    nextQuestion();
  };

  const handleChoice = useCallback(
    (choice) => {
      if (isAnswered || screen !== "game" || !currentQuestion) return;

      clearTimers();
      setIsAnswered(true);

      const elapsed = activeTimeLimit / 1000 - timeLeft;
      const isCorrect = choice === currentQuestion.correctValue;

      if (isCorrect) {
        const points = game.getScorePoints(elapsed, activeTimeLimit);
        const nextScore = score + points;
        const nextStreak = streak + 1;

        setScore(nextScore);
        setStreak(nextStreak);
        setFeedbackTone("success");
        setResultState({ selected: choice, correct: currentQuestion.correctValue });
        setFeedbackText(
          nextStreak >= 3
            ? `🔥 ${nextStreak}x streak! +${points}pts`
            : `+${points} pts`,
        );
        advanceTimeoutRef.current = setTimeout(() => nextQuestion(), 1200);
        return;
      }

      setStreak(0);
      setFeedbackTone("danger");
      setResultState({ selected: choice, correct: currentQuestion.correctValue });
      setFeedbackText(`✗ It was ${currentQuestion.correctValue} — Game Over!`);
      endTimeoutRef.current = setTimeout(() => endGame("wrong"), 1400);
    },
    [currentQuestion, endGame, clearTimers, game, isAnswered, nextQuestion, screen, score, streak, timeLeft, activeTimeLimit],
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

  const timerPercent = Math.max(0, (timeLeft / (activeTimeLimit / 1000)) * 100);

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

  // ════════════════════════════════════════
  //  GUEST LOGIN SCREEN
  // ════════════════════════════════════════
  if (screen === "guest") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:rounded-[2rem] sm:p-8">
          <div className="text-center">
            <div className="mb-4 text-6xl">🎮</div>
            <div className="mb-4 text-4xl font-black uppercase tracking-[0.16em] text-white sm:text-5xl sm:tracking-[0.2em]">
              {game.bigLetter}
            </div>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              Play as Guest
            </h1>
            <p className="mt-4 text-sm text-slate-400 uppercase tracking-[0.2em]">
              Enter a name to track your scores
            </p>

            <div className="mx-auto mt-8 max-w-xs">
              <input
                type="text"
                value={guestInput}
                onChange={(e) => setGuestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGuestLogin()}
                placeholder="Your name..."
                maxLength={16}
                autoFocus
                className="w-full rounded-xl border border-white/15 bg-black/30 px-5 py-4 text-center font-mono text-lg text-white tracking-[0.15em] placeholder-slate-500 outline-none transition focus:border-[#f0e040]/60 focus:shadow-[0_0_20px_rgba(240,224,64,0.12)]"
              />
            </div>

            <button
              onClick={handleGuestLogin}
              className="mt-6 rounded-full border border-[#f0e040]/60 bg-[#f0e040]/10 px-8 py-3 text-sm font-bold uppercase tracking-[0.25em] text-[#f0e040] transition hover:bg-[#f0e040]/20"
            >
              Play as Guest
            </button>

            <p className="mt-4 text-xs text-slate-500 tracking-[0.15em]">
              Your name is saved for 7 days via cookie
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-4 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400 transition hover:bg-white/10"
            >
              ← Back to Menu
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ════════════════════════════════════════
  //  DIFFICULTY SELECTION SCREEN
  // ════════════════════════════════════════
  if (screen === "difficulty") {
    const diffOptions = [
      { key: "beginner", icon: "🌱", label: "Beginner", time: "9 sec" },
      { key: "intermediate", icon: "⚡", label: "Intermediate", time: "6 sec" },
      { key: "advanced", icon: "🔥", label: "Advanced", time: "3 sec" },
    ];

    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:rounded-[2rem] sm:p-8">
          <div className="text-center">
            <div className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-500">
              Player: <span className="text-[#f0e040]">{guestName}</span>
            </div>
            <div className="mb-4 text-4xl font-black uppercase tracking-[0.16em] text-white sm:text-6xl sm:tracking-[0.2em]">
              {game.bigLetter}
            </div>
            <h1 className="text-3xl font-black text-white sm:text-5xl">
              {game.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">{game.intro}</p>

            <p className="mt-6 text-sm uppercase tracking-[0.3em] text-slate-500">
              Select Difficulty
            </p>

            <div className="mx-auto mt-4 grid max-w-md gap-3 sm:grid-cols-3">
              {diffOptions.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDifficulty(d.key)}
                  className={`rounded-xl border p-5 text-center transition duration-200 hover:-translate-y-1 ${
                    difficulty === d.key
                      ? "border-[#f0e040]/60 bg-[#f0e040]/10 shadow-[0_0_20px_rgba(240,224,64,0.12)]"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="text-3xl">{d.icon}</div>
                  <div className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-white">
                    {d.label}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                    {d.time}
                  </div>
                </button>
              ))}
            </div>

            <p className="mt-5 text-sm uppercase tracking-[0.3em] text-[#404070]">
              {game.rules}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button
                onClick={startGame}
                className="rounded-full border border-[#f0e040]/60 bg-[#f0e040]/10 px-8 py-3 text-sm font-bold uppercase tracking-[0.25em] text-[#f0e040] transition hover:bg-[#f0e040]/20"
              >
                Start
              </button>
              <button
                onClick={() => navigate("/")}
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-slate-300 transition hover:bg-white/10"
              >
                Menu
              </button>
            </div>
            <div className="mt-6 text-xs uppercase tracking-[0.15em] text-slate-600">
              {game.reference}
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

    const top5 = getLeaderboard()
      .filter((e) => e.mode === game.key && e.difficulty === difficulty)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const myRank = top5.findIndex((e) => e.name === guestName && e.score === score);

    const highScores = getUserHighScores(guestName);
    const personalBest = highScores[`${game.key}__${difficulty}`] || 0;
    const isNewBest = score > 0 && score >= personalBest;

    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-center shadow-[0_30px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:rounded-[2rem] sm:p-8">

          {/* Result */}
          <h1 className="text-3xl font-black text-white sm:text-5xl">Game Over!</h1>
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

          {/* Top 5 */}
          <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#f0e040]">
              🏆 Top 5 — {MODE_LABELS[game.key] || game.key} · {diffInfo.label}
            </p>
            {top5.length === 0 ? (
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
                          {entry.questions || '?'}Q · {getTimeAgo(entry.timestamp)}
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
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setScreen("difficulty")}
              className="rounded-full border border-[#f0e040]/60 bg-[#f0e040]/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-[#f0e040] transition hover:bg-[#f0e040]/20"
            >
              Play Again
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
  //  GAME SCREEN
  // ════════════════════════════════════════
  return (
    <main className="mx-auto max-w-5xl px-3 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:rounded-[2rem] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs uppercase tracking-[0.28em] text-[#f0e040] sm:text-sm sm:tracking-[0.35em]">
            {game.title}
          </div>
          <div className="text-left sm:text-right">
            <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
              {guestName} · {DIFFICULTIES[difficulty].icon} {DIFF_LABELS[difficulty]}
            </div>
            <div className="flex gap-4 text-xs uppercase tracking-[0.18em] text-slate-400 sm:gap-6 sm:text-sm sm:tracking-[0.25em]">
              <div>
                Score <span className="text-white">{score}</span>
              </div>
              <div>
                Q <span className="text-white">{questionNum}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="mt-5">
          <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-[width] duration-75"
              style={{
                width: `${timerPercent}%`,
                background: timerPercent < 33 ? '#f04060' : game.accent,
                boxShadow: `0 0 12px ${timerPercent < 33 ? '#f04060' : game.accent}`,
              }}
            />
          </div>
          <div className="mt-2 text-right text-xs uppercase tracking-[0.2em] text-slate-500">
            {timeLeft.toFixed(1)}s
          </div>
        </div>

        {/* Question */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-center sm:mt-8 sm:rounded-[1.5rem] sm:p-8">
          <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500 sm:text-xs sm:tracking-[0.35em]">
            {game.prompt}
          </div>
          <div className={`mt-4 font-black text-white ${
            game.key === 'worldCapital' || game.key === 'stateCapital' || game.key === 'periodicTable' || game.key === 'elementSymbol' || game.key === 'multiplication' || game.key === 'roman' || game.key === 'countryCurrency'
              ? 'break-words text-2xl leading-tight sm:text-4xl'
              : game.key === 'prime'
                ? 'text-4xl sm:text-6xl'
              : 'text-6xl sm:text-8xl'
          }`}>
            {currentQuestion?.display}
          </div>
          <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400 sm:text-sm sm:tracking-[0.3em]">
            {game.subtext}
          </div>
        </div>

        {/* Options */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {currentQuestion?.options.map((choice, index) => {
            const statusClass = selectedClass(choice);

            return (
              <button
                key={`${choice}-${index}`}
                data-key={OPTION_KEYS[index]}
                disabled={isAnswered}
                onClick={() => handleChoice(choice)}
                className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-lg font-black tracking-[0.08em] text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#f0e040] hover:text-[#f0e040] disabled:cursor-not-allowed sm:px-5 sm:py-5 sm:text-2xl sm:tracking-[0.18em] ${statusClass}`}
              >
                <span className="absolute left-3 top-2 text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  {OPTION_KEYS[index]}
                </span>
                {choice}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        <div className={`mt-6 min-h-6 text-center text-sm uppercase tracking-[0.3em] ${feedbackClass}`}>
          {feedbackText}
        </div>

        {/* Quit */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => endGame("quit")}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-400 transition hover:bg-white/10"
          >
            Quit
          </button>
        </div>
      </section>
    </main>
  );
}
