import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function CompoundFormulaQuiz() {
  return <QuizGame game={quizGames.compoundFormula} />;
}
