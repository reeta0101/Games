import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function AlphabetQuiz() {
  return <QuizGame game={quizGames.alphabet} />;
}
