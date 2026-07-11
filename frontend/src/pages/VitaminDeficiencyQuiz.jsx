import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function VitaminDeficiencyQuiz() {
  return <QuizGame game={quizGames.vitaminDeficiency} />;
}
