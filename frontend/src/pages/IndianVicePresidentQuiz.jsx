import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function IndianVicePresidentQuiz() {
  return <QuizGame game={quizGames.indianVicePresident} />;
}
