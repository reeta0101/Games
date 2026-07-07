import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function MultiplicationQuiz() {
  return <QuizGame game={quizGames.multiplication} />;
}
