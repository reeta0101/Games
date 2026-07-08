import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function StateOfficialsQuiz() {
  return <QuizGame game={quizGames.stateOfficials} />;
}
