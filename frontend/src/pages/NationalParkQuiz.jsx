import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function NationalParkQuiz() {
  return <QuizGame game={quizGames.nationalPark} />;
}
