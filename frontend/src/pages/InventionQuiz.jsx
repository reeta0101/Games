import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function InventionQuiz() {
  return <QuizGame game={quizGames.invention} />;
}
