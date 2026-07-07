import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function ElementSymbolQuiz() {
  return <QuizGame game={quizGames.elementSymbol} />;
}
