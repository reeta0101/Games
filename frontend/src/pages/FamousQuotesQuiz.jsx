import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function FamousQuotesQuiz() {
  return <QuizGame game={quizGames.famousQuotes} />;
}
