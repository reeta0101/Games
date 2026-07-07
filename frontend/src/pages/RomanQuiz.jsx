import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function RomanQuiz() {
  return <QuizGame game={quizGames.roman} />;
}
