import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function OrganizationHqQuiz() {
  return <QuizGame game={quizGames.orgHq} />;
}
