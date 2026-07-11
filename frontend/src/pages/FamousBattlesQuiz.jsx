import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function FamousBattlesQuiz() {
  return <QuizGame game={quizGames.famousBattles} />;
}
