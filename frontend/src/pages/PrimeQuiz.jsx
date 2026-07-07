import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function PrimeQuiz() {
  return <QuizGame game={quizGames.prime} />;
}
