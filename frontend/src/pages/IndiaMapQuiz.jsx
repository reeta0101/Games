import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAudio } from "../hooks/useAudio";
import { getCookie, setCookie, GUEST_COOKIE_NAME } from "../utils/cookies";
import { recordRecentGame } from "../utils/gameConstants";
import {
  saveScore,
  getLeaderboard,
  getUserHighScores,
  getTimeAgo,
  DIFFICULTIES,
  MODE_LABELS,
  DIFF_LABELS,
} from "../utils/leaderboard";
import indiaMap from "@svg-maps/india";

/* ── State ↔ Capital data (must match svg-maps/india location.name) ── */
const STATE_CAPITALS = {
  "Andhra Pradesh": "Amaravati",
  "Arunachal Pradesh": "Itanagar",
  Assam: "Dispur",
  Bihar: "Patna",
  Chhattisgarh: "Raipur",
  Goa: "Panaji",
  Gujarat: "Gandhinagar",
  Haryana: "Chandigarh",
  "Himachal Pradesh": "Shimla",
  Jharkhand: "Ranchi",
  Karnataka: "Bengaluru",
  Kerala: "Thiruvananthapuram",
  "Madhya Pradesh": "Bhopal",
  Maharashtra: "Mumbai",
  Manipur: "Imphal",
  Meghalaya: "Shillong",
  Mizoram: "Aizawl",
  Nagaland: "Kohima",
  Odisha: "Bhubaneswar",
  Punjab: "Chandigarh",
  Rajasthan: "Jaipur",
  Sikkim: "Gangtok",
  "Tamil Nadu": "Chennai",
  Telangana: "Hyderabad",
  Tripura: "Agartala",
  "Uttar Pradesh": "Lucknow",
  Uttarakhand: "Dehradun",
  "West Bengal": "Kolkata",
  "Andaman and Nicobar Islands": "Port Blair",
  Chandigarh: "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu": "Daman",
  Delhi: "New Delhi",
  "Jammu and Kashmir": "Srinagar",
  Ladakh: "Leh",
  Lakshadweep: "Kavaratti",
  Puducherry: "Puducherry",
};

const ALL_STATE_NAMES = Object.keys(STATE_CAPITALS);
const ALL_CAPITALS = [...new Set(Object.values(STATE_CAPITALS))];

const OPTION_KEYS = ["A", "B", "C", "D"];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DIFFICULTY_OPTIONS = [
  { key: "beginner", icon: "🌱", label: "Beginner", time: "9 sec", note: "Warm up and build accuracy." },
  { key: "intermediate", icon: "⚡", label: "Intermediate", time: "6 sec", note: "Balanced speed practice." },
  { key: "advanced", icon: "🔥", label: "Advanced", time: "3 sec", note: "Exam-pressure recall." },
];

function generateQuestion(mapData) {
  const locations = mapData.locations || [];
  const loc = locations[Math.floor(Math.random() * locations.length)];
  const stateName = loc.name;
  const capital = STATE_CAPITALS[stateName] || "Unknown";

  // Randomly pick mode: identify state or identify capital
  const mode = Math.random() < 0.5 ? "state" : "capital";

  if (mode === "state") {
    const correct = stateName;
    const opts = new Set([correct]);
    while (opts.size < 4) {
      opts.add(ALL_STATE_NAMES[Math.floor(Math.random() * ALL_STATE_NAMES.length)]);
    }
    return {
      locationId: loc.id,
      questionText: "Which state is blinking?",
      correctValue: correct,
      options: shuffleArray([...opts]),
    };
  } else {
    const correct = capital;
    const opts = new Set([correct]);
    while (opts.size < 4) {
      opts.add(ALL_CAPITALS[Math.floor(Math.random() * ALL_CAPITALS.length)]);
    }
    return {
      locationId: loc.id,
      questionText: `Capital of the blinking state?`,
      correctValue: correct,
      options: shuffleArray([...opts]),
    };
  }
}

export default function IndiaMapQuiz() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const { playCorrect, playWrong, playStreak, playGameOver } = useAudio();
  const mapData = indiaMap.default || indiaMap;

  // Guest
  const [guestName, setGuestName] = useState(() => {
    if (currentUser) return currentUser.name;
    return getCookie(GUEST_COOKIE_NAME) || "";
  });
  const [guestInput, setGuestInput] = useState("");

  // Screen: guest → difficulty → game → end
  const [screen, setScreen] = useState(() => {
    if (currentUser) return "difficulty";
    if (getCookie(GUEST_COOKIE_NAME)) return "difficulty";
    return "guest";
  });

  const [difficulty, setDifficulty] = useState("intermediate");
  const [score, setScore] = useState(0);
  const [questionNum, setQuestionNum] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("neutral");
  const [resultState, setResultState] = useState({ selected: null, correct: null });
  const [finalMessage, setFinalMessage] = useState("");

  const [top5, setTop5] = useState([]);
  const [personalBest, setPersonalBest] = useState(0);
  const [loadingScores, setLoadingScores] = useState(false);

  const timerRef = useRef(null);
  const advanceRef = useRef(null);
  const endRef = useRef(null);

  const activeTimeLimit = DIFFICULTIES[difficulty].timeMs;

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (advanceRef.current) { clearTimeout(advanceRef.current); advanceRef.current = null; }
    if (endRef.current) { clearTimeout(endRef.current); endRef.current = null; }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const getScorePoints = (elapsedSec) => {
    const third = activeTimeLimit / 3000;
    if (elapsedSec < third) return 12;
    if (elapsedSec < third * 2) return 8;
    return 4;
  };

  const buildFinalMessage = (currentScore) => {
    if (currentScore >= 150) return "Quiz Master! 🏆";
    if (currentScore >= 100) return "Great job! 🎯";
    if (currentScore >= 50) return "Keep practicing! 📚";
    return "You'll get better! 💪";
  };

  const endGame = useCallback(async (reason, finalScore) => {
    clearTimers();
    setIsAnswered(true);
    const scoreToSave = finalScore ?? score;
    setFinalMessage(
      reason === "timeout" ? "Time ran out! ⏱" :
      reason === "wrong" ? "Wrong answer! 💥" :
      buildFinalMessage(scoreToSave)
    );
    playGameOver();

    const answeredQs = (reason === "wrong" || reason === "timeout") ? questionNum - 1 : questionNum;
    if (scoreToSave > 0) {
      await saveScore({
        name: guestName,
        score: scoreToSave,
        mode: "indiaMap",
        difficulty,
        questions: answeredQs,
      });
    }
    setScreen("end");
  }, [clearTimers, score, guestName, difficulty, questionNum, playGameOver]);

  const nextQuestion = useCallback(() => {
    clearTimers();
    const q = generateQuestion(mapData);
    setCurrentQuestion(q);
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
        setResultState({ selected: null, correct: q.correctValue });
        setFeedbackText("⏱ Time's up — Game Over!");
        setFeedbackTone("danger");
        endRef.current = setTimeout(() => {
          setScore((s) => { endGame("timeout", s); return s; });
        }, 1400);
      }
    }, 50);
  }, [clearTimers, mapData, activeTimeLimit, endGame]);

  const startGame = useCallback(() => {
    clearTimers();
    setScore(0);
    setQuestionNum(0);
    setStreak(0);
    setFinalMessage("");
    recordRecentGame("indiaMap");
    setScreen("game");
    nextQuestion();
  }, [clearTimers, nextQuestion]);

  const handleChoice = useCallback((choice) => {
    if (isAnswered || screen !== "game" || !currentQuestion) return;
    clearTimers();
    setIsAnswered(true);

    const elapsed = activeTimeLimit / 1000 - timeLeft;
    const isCorrect = choice === currentQuestion.correctValue;

    if (isCorrect) {
      const points = getScorePoints(elapsed);
      const nextScore = score + points;
      const nextStreak = streak + 1;
      setScore(nextScore);
      setStreak(nextStreak);
      setFeedbackTone("success");
      setResultState({ selected: choice, correct: currentQuestion.correctValue });
      setFeedbackText(
        nextStreak >= 3
          ? `🔥 ${nextStreak}x streak! +${points}pts`
          : `+${points} pts`
      );
      if (nextStreak >= 3) playStreak(nextStreak);
      else playCorrect();
      advanceRef.current = setTimeout(() => nextQuestion(), 1000);
    } else {
      setStreak(0);
      setFeedbackTone("danger");
      setResultState({ selected: choice, correct: currentQuestion.correctValue });
      playWrong();
      setFeedbackText(`✗ It was ${currentQuestion.correctValue} — Game Over!`);
      endRef.current = setTimeout(() => endGame("wrong", score), 1400);
    }
  }, [isAnswered, screen, currentQuestion, clearTimers, activeTimeLimit, timeLeft, score, streak, nextQuestion, endGame, playCorrect, playStreak, playWrong]);

  // Keyboard
  useEffect(() => {
    if (screen !== "game" || isAnswered || !currentQuestion) return;
    const handler = (e) => {
      const idx = ["a", "b", "c", "d"].indexOf(e.key.toLowerCase());
      if (idx >= 0 && currentQuestion.options[idx]) handleChoice(currentQuestion.options[idx]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, isAnswered, currentQuestion, handleChoice]);

  // Fetch scores on end
  useEffect(() => {
    if (screen === "end") {
      setLoadingScores(true);
      Promise.all([
        getLeaderboard("indiaMap", difficulty, 5),
        getUserHighScores(guestName),
      ]).then(([lb, hs]) => {
        setTop5(lb);
        setPersonalBest(hs["indiaMap__" + difficulty] || 0);
      }).catch(console.error).finally(() => setLoadingScores(false));
    }
  }, [screen, difficulty, guestName]);

  const handleGuestLogin = () => {
    const name = guestInput.trim() || `Guest_${Math.floor(Math.random() * 9000 + 1000)}`;
    setCookie(GUEST_COOKIE_NAME, name, 7);
    setGuestName(name);
    setScreen("difficulty");
  };

  const timerPercent = Math.max(0, (timeLeft / (activeTimeLimit / 1000)) * 100);
  const isTimerDanger = timerPercent < 33;

  const feedbackClass =
    feedbackTone === "success" ? "text-[#40f080]" :
    feedbackTone === "danger" ? "text-[#f04060]" :
    "text-slate-400";

  const selectedClass = (choice) => {
    if (choice === resultState.correct && isAnswered)
      return "border-[#40f080] bg-[#40f080]/10 text-[#40f080] shadow-[0_0_20px_rgba(64,240,128,0.18)]";
    if (choice === resultState.selected && isAnswered && resultState.selected !== resultState.correct)
      return "border-[#f04060] bg-[#f04060]/10 text-[#f04060] shadow-[0_0_20px_rgba(240,64,96,0.18)]";
    return "";
  };

  const accent = "#38bdf8";

  // ═══════════════════════════════════
  //  GUEST SCREEN
  // ═══════════════════════════════════
  if (screen === "guest") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="surface w-full overflow-hidden rounded-3xl p-5 animate-soft-pop sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#38bdf8]/25 bg-[#38bdf8]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#38bdf8]">
                Quick setup
              </div>
              <div className="text-5xl font-black uppercase tracking-[0.16em] text-white sm:text-6xl">
                🗺️
              </div>
              <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">
                India Map Quiz
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                A state will blink on the map — guess its name or capital from 4 options!
              </p>
            </div>
            <form
              className="rounded-3xl border border-white/10 bg-black/22 p-5 sm:p-6"
              onSubmit={(e) => { e.preventDefault(); handleGuestLogin(); }}
            >
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Display name</span>
                <input
                  type="text"
                  value={guestInput}
                  onChange={(e) => setGuestInput(e.target.value)}
                  placeholder="Your name"
                  maxLength={16}
                  autoFocus
                  className="touch-target w-full rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 text-center text-lg font-bold text-white tracking-[0.08em] placeholder:text-slate-500 outline-none transition focus:border-[#38bdf8]/60 focus:bg-white/[0.07]"
                />
              </label>
              <button type="submit" className="touch-target mt-5 w-full rounded-2xl border border-[#38bdf8]/60 bg-[#38bdf8]/12 px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-[#38bdf8] transition hover:bg-[#38bdf8]/20">
                Continue
              </button>
              <button type="button" onClick={() => navigate("/")} className="touch-target mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400 transition hover:bg-white/10 hover:text-white">
                Back to menu
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  // ═══════════════════════════════════
  //  DIFFICULTY SCREEN
  // ═══════════════════════════════════
  if (screen === "difficulty") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="surface w-full overflow-hidden rounded-3xl p-5 animate-soft-pop sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-500">
                Player <span className="text-[#38bdf8]">{guestName}</span>
              </div>
              <div className="text-5xl font-black uppercase tracking-[0.16em] text-white sm:text-6xl">🗺️</div>
              <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">India Map Quiz</h1>
              <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                A random state blinks on the India map. Identify the state or its capital from 4 options.
              </p>
              <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">Scoring</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">&lt;1s = 12pts · &lt;2s = 8pts · &lt;3s = 4pts · wrong = over</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-slate-500">Select difficulty</p>
              <div className="mt-4 grid gap-3">
                {DIFFICULTY_OPTIONS.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setDifficulty(d.key)}
                    aria-pressed={difficulty === d.key}
                    className={`interactive-lift rounded-2xl border p-4 text-left transition duration-200 ${
                      difficulty === d.key
                        ? "border-[#38bdf8]/60 bg-[#38bdf8]/12 shadow-[0_0_22px_rgba(56,189,248,0.13)]"
                        : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{d.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black uppercase tracking-[0.2em] text-white">{d.label}</span>
                          <span className="rounded-full bg-black/24 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{d.time}</span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{d.note}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button onClick={startGame} className="touch-target rounded-2xl border border-[#38bdf8]/60 bg-[#38bdf8]/12 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#38bdf8] transition hover:bg-[#38bdf8]/22" type="button">
                  Start quiz
                </button>
                <button onClick={() => navigate("/")} className="touch-target rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-400 transition hover:bg-white/10 hover:text-white" type="button">
                  Back to library
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ═══════════════════════════════════
  //  GAME SCREEN
  // ═══════════════════════════════════
  if (screen === "game" && currentQuestion) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-4xl flex-col items-center px-3 py-6 sm:px-6 lg:px-8">
        {/* Header bar */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tabular-nums" style={{ color: accent }}>{score}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">pts</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Q{questionNum}</span>
            {streak >= 3 && (
              <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f0e040]">
                🔥 {streak}x
              </span>
            )}
          </div>
          <button
            onClick={() => { clearTimers(); endGame("quit", score); }}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 transition hover:text-white"
            type="button"
          >
            Quit
          </button>
        </div>

        {/* Timer */}
        <div className="w-full h-1.5 rounded-full bg-white/10 mb-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-100 ${isTimerDanger ? "bg-[#f04060] animate-timer-warning" : "bg-[#38bdf8]"}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Question */}
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 text-center">
          {currentQuestion.questionText}
        </p>

        {/* SVG Map */}
        <div className="w-full max-w-md mx-auto mb-4 relative">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes mapBlink {
              0%, 100% { fill: rgba(56,189,248,0.5); filter: drop-shadow(0 0 8px rgba(56,189,248,0.7)); }
              50% { fill: rgba(56,189,248,0.15); filter: drop-shadow(0 0 2px rgba(56,189,248,0.3)); }
            }
            .map-quiz-svg { width: 100%; height: auto; stroke: #334155; stroke-width: 0.8; }
            .map-quiz-svg .state-path { fill: rgba(255,255,255,0.04); transition: fill 0.2s; }
            .map-quiz-svg .state-path.blinking { animation: mapBlink 1s ease-in-out infinite; stroke: #38bdf8; stroke-width: 1.5; }
          `}} />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={mapData.viewBox}
            className="map-quiz-svg"
            aria-label="India Map Quiz"
          >
            {mapData.locations.map((loc) => (
              <path
                key={loc.id}
                d={loc.path}
                className={`state-path ${loc.id === currentQuestion.locationId ? "blinking" : ""}`}
              />
            ))}
          </svg>
        </div>

        {/* Feedback */}
        {feedbackText && (
          <div className={`mb-3 text-center text-sm font-bold uppercase tracking-[0.15em] animate-soft-pop ${feedbackClass}`}>
            {feedbackText}
          </div>
        )}

        {/* Options */}
        <div className="w-full grid gap-2 sm:grid-cols-2 max-w-lg mx-auto">
          {currentQuestion.options.map((opt, i) => {
            const extra = selectedClass(opt);
            return (
              <button
                key={opt}
                onClick={() => handleChoice(opt)}
                disabled={isAnswered}
                className={`touch-target flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition duration-200 ${
                  extra || "border-white/10 bg-white/[0.04] text-white hover:border-white/20 hover:bg-white/[0.08]"
                } ${isAnswered ? "pointer-events-none" : ""}`}
                type="button"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-xs font-black text-slate-400">
                  {OPTION_KEYS[i]}
                </span>
                <span className="truncate">{opt}</span>
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  // ═══════════════════════════════════
  //  END SCREEN
  // ═══════════════════════════════════
  if (screen === "end") {
    const diffInfo = DIFFICULTIES[difficulty];
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-3xl items-center px-3 py-8 sm:px-6 lg:px-8">
        <section className="surface w-full overflow-hidden rounded-3xl p-5 animate-soft-pop sm:p-8 text-center">
          <div className="text-5xl mb-4">🗺️</div>
          <h2 className="text-2xl font-black text-white sm:text-3xl">{finalMessage}</h2>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
              <div className="text-3xl font-black tabular-nums" style={{ color: accent }}>{score}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Score</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
              <div className="text-3xl font-black tabular-nums text-white">{questionNum > 0 ? questionNum - 1 : 0}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Correct</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
              <div className="text-3xl font-black tabular-nums text-[#a78bfa]">{personalBest}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Best</div>
            </div>
          </div>

          {/* Top 5 */}
          {loadingScores ? (
            <div className="mt-6 text-sm text-slate-500">Loading scores...</div>
          ) : top5.length > 0 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden text-left">
              <div className="px-4 py-3 border-b border-white/8">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: accent }}>
                  Top 5 · {diffInfo.icon} {diffInfo.label}
                </span>
              </div>
              {top5.map((entry, i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                return (
                  <div key={`${entry.name}-${i}`} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.04] last:border-b-0">
                    <div className="w-6 text-center shrink-0">
                      {medal ? <span className="text-base">{medal}</span> : <span className="text-xs font-black text-slate-500">{i + 1}</span>}
                    </div>
                    <div className="min-w-0 flex-1 truncate text-sm font-bold text-white">{entry.name}</div>
                    <div className="shrink-0 text-lg font-black tabular-nums" style={{ color: i < 3 ? accent : "#94a3b8" }}>{entry.score}</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button onClick={startGame} className="touch-target rounded-2xl border border-[#38bdf8]/60 bg-[#38bdf8]/12 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#38bdf8] transition hover:bg-[#38bdf8]/22" type="button">
              Play again
            </button>
            <button onClick={() => navigate("/")} className="touch-target rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-400 transition hover:bg-white/10 hover:text-white" type="button">
              Back to library
            </button>
          </div>
        </section>
      </main>
    );
  }

  return null;
}
