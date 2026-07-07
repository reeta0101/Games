import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function PeriodicTableQuiz() {
  return <QuizGame game={quizGames.periodicTable} />;
}
