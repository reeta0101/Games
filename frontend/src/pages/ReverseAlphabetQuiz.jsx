import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function ReverseAlphabetQuiz() {
  return <QuizGame game={quizGames.reverseAlphabet} />;
}
