import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function OneWordSubstitutionQuiz() {
  return <QuizGame game={quizGames.oneWordSub} />;
}
