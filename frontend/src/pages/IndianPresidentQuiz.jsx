import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function IndianPresidentQuiz() {
  return <QuizGame game={quizGames.indianPresident} />;
}
