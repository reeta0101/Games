import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function IndianNationalQuiz() {
  return <QuizGame game={quizGames.indianNational} />;
}
