import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function NationalOfficialsQuiz() {
  return <QuizGame game={quizGames.nationalOfficials} />;
}
