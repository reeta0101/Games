import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function RiverOriginQuiz() {
  return <QuizGame game={quizGames.riverOrigin} />;
}
