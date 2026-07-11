import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function LandmarkCountryQuiz() {
  return <QuizGame game={quizGames.landmarkCountry} />;
}
