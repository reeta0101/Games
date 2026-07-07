import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function SquareQuiz() {
  return <QuizGame game={quizGames.square} />;
}
