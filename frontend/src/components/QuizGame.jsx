import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const OPTION_KEYS = ["A", "B", "C", "D"];

export default function QuizGame({ game }) {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const advanceTimeoutRef = useRef(null);
  const endTimeoutRef = useRef(null);

  const [screen, setScreen] = useState("start");
  const [score, setScore] = useState(0);
  const [questionNum, setQuestionNum] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(game.timeLimit / 1000);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("neutral");
  const [resultState, setResultState] = useState({
    selected: null,
    correct: null,
  });
  const [finalMessage, setFinalMessage] = useState("");

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
      setFinalMessage(buildFinalMessage(reason, score));
      setScreen("end");
    },
    [buildFinalMessage, clearTimers, score],
  );

  const nextQuestion = useCallback(() => {
    clearTimers();

    const question = game.generateQuestion();
    setCurrentQuestion(question);
    setQuestionNum((value) => value + 1);
    setIsAnswered(false);
    setFeedbackText("");
    setFeedbackTone("neutral");
    setResultState({ selected: null, correct: null });
    setTimeLeft(game.timeLimit / 1000);

    const startedAt = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, (game.timeLimit - elapsed) / 1000);
      setTimeLeft(remaining);

      if (elapsed >= game.timeLimit) {
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
  }, [clearTimers, endGame, game]);

  const startGame = () => {
    clearTimers();
    setScore(0);
    setQuestionNum(0);
    setStreak(0);
    setFinalMessage("");
    setScreen("game");
    nextQuestion();
  };

  const handleChoice = useCallback(
    (choice) => {
      if (isAnswered || screen !== "game" || !currentQuestion) return;

      clearTimers();
      setIsAnswered(true);

      const elapsed = game.timeLimit / 1000 - timeLeft;
      const isCorrect = choice === currentQuestion.correctValue;

      if (isCorrect) {
        const points = game.getScorePoints(elapsed);
        const nextScore = score + points;
        const nextStreak = streak + 1;

        setScore(nextScore);
        setStreak(nextStreak);
        setFeedbackTone("success");
        setResultState({
          selected: choice,
          correct: currentQuestion.correctValue,
        });
        setFeedbackText(
          nextStreak >= 3
            ? `🔥 ${nextStreak}x streak! +${points}pts`
            : `+${points} pts`,
        );

        advanceTimeoutRef.current = setTimeout(() => {
          nextQuestion();
        }, 1200);
        return;
      }

      setStreak(0);
      setFeedbackTone("danger");
      setResultState({
        selected: choice,
        correct: currentQuestion.correctValue,
      });
      setFeedbackText(`✗ It was ${currentQuestion.correctValue} — Game Over!`);

      endTimeoutRef.current = setTimeout(() => {
        endGame("wrong");
      }, 1400);
    },
    [
      currentQuestion,
      endGame,
      clearTimers,
      game,
      isAnswered,
      nextQuestion,
      screen,
      score,
      streak,
      timeLeft,
    ],
  );

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

  const timerPercent = Math.max(0, (timeLeft / (game.timeLimit / 1000)) * 100);
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

    if (
      choice === resultState.selected &&
      isAnswered &&
      resultState.selected !== resultState.correct
    ) {
      return "border-[#f04060] bg-[#f04060]/10 text-[#f04060] shadow-[0_0_20px_rgba(240,64,96,0.18)]";
    }

    return "";
  };

  if (screen === "start") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8">
          <div className="text-center">
            <div className="mb-4 text-5xl font-black uppercase tracking-[0.2em] text-white sm:text-6xl">
              {game.bigLetter}
            </div>
            <h1 className="text-4xl font-black text-white sm:text-5xl">
              {game.title}
            </h1>
            <p className="mt-4 text-lg text-slate-300">{game.intro}</p>
            <p className="mt-4 text-sm uppercase tracking-[0.3em] text-[#404070]">
              {game.rules}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={startGame}
                className="rounded-full border border-[#f0e040]/60 bg-[#f0e040]/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-[#f0e040] transition hover:bg-[#f0e040]/15"
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
            <div className="mt-8 text-sm uppercase tracking-[0.2em] text-slate-500">
              {game.reference}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "end") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center shadow-[0_30px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Finished!
          </h1>
          <p className="mt-4 text-lg text-slate-300">Your score</p>
          <div className="my-5 text-6xl font-black text-[#40e0f0] drop-shadow-[0_0_24px_rgba(64,224,240,0.35)]">
            {score}
          </div>
          <p className="text-lg text-slate-200">{finalMessage}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={startGame}
              className="rounded-full border border-[#f0e040]/60 bg-[#f0e040]/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-[#f0e040] transition hover:bg-[#f0e040]/15"
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

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm uppercase tracking-[0.35em] text-[#f0e040]">
            {game.title}
          </div>
          <div className="flex gap-6 text-sm uppercase tracking-[0.25em] text-slate-400">
            <div>
              Score <span className="text-white">{score}</span>
            </div>
            <div>
              Q <span className="text-white">{questionNum}</span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-[width] duration-75"
              style={{
                width: `${timerPercent}%`,
                background: game.accent,
                boxShadow: `0 0 12px ${game.accent}`,
              }}
            />
          </div>
          <div className="mt-2 text-right text-xs uppercase tracking-[0.2em] text-slate-500">
            {timeLeft.toFixed(1)}s
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-8 text-center">
          <div className="text-xs uppercase tracking-[0.35em] text-slate-500">
            {game.prompt}
          </div>
          <div className="mt-4 text-7xl font-black text-white sm:text-8xl">
            {currentQuestion?.display}
          </div>
          <div className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-400">
            {game.subtext}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {currentQuestion?.options.map((choice, index) => {
            const isCorrect = choice === currentQuestion.correctValue;
            const statusClass = selectedClass(choice);

            return (
              <button
                key={`${choice}-${index}`}
                data-key={OPTION_KEYS[index]}
                disabled={isAnswered}
                onClick={() => handleChoice(choice)}
                className={`relative overflow-hidden rounded-[1rem] border border-white/10 bg-white/5 px-5 py-5 text-center text-2xl font-black tracking-[0.18em] text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#f0e040] hover:text-[#f0e040] disabled:cursor-not-allowed ${statusClass}`}
              >
                <span className="absolute left-3 top-2 text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  {OPTION_KEYS[index]}
                </span>
                <span
                  className={isCorrect && isAnswered ? "text-[#40f080]" : ""}
                >
                  {choice}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className={`mt-6 min-h-6 text-center text-sm uppercase tracking-[0.3em] ${feedbackClass}`}
        >
          {feedbackText}
        </div>

        <div className="mt-5 flex justify-center">
          <button
            onClick={() => {
              endGame("quit");
            }}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-400 transition hover:bg-white/10"
          >
            Quit
          </button>
        </div>
      </section>
    </main>
  );
}
