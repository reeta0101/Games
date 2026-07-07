import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function StateCapitalQuiz() {
  return <QuizGame game={quizGames.stateCapital} />;
}
