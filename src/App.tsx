import { useGameStore } from "./store/useGameStore";
import { HomeScreen } from "./screens/HomeScreen";
import { VocabularyQuiz } from "./screens/VocabularyQuiz";
import { GrammarQuiz } from "./screens/GrammarQuiz";
import { SentenceMatch } from "./screens/SentenceMatch";
import { Flashcards } from "./screens/Flashcards";
import { ResultScreen } from "./screens/ResultScreen";
import { MistakeBook } from "./screens/MistakeBook";

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const quizType = useGameStore((s) => s.quizType);

  return (
    <div className="scanlines">
      {screen === "home" && <HomeScreen />}
      {screen === "mistakes" && <MistakeBook />}
      {screen === "result" && <ResultScreen />}
      {screen === "playing" && quizType === "vocabulary" && <VocabularyQuiz />}
      {screen === "playing" && quizType === "grammar" && <GrammarQuiz />}
      {screen === "playing" && quizType === "sentence" && <SentenceMatch />}
      {screen === "playing" && quizType === "flashcard" && <Flashcards />}
    </div>
  );
}
