import QuizGame from "../components/QuizGame";
import { quizGames } from "../data/quizGames";

export default function AnimalKingdomQuiz() {
  return <QuizGame game={quizGames.animalKingdom} />;
}
