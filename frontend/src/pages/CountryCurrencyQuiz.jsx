import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function CountryCurrencyQuiz() {
  return <QuizGame game={quizGames.countryCurrency} />;
}
