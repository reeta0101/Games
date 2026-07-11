import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function SiUnitsQuiz() {
  return <QuizGame game={quizGames.siUnits} />;
}
