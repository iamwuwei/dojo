import { useEffect } from "react";
import { useGameStore } from "./store/useGameStore";
import { HomeScreen } from "./screens/HomeScreen";
import { VocabularyQuiz } from "./screens/VocabularyQuiz";
import { VocabLevelPicker } from "./screens/VocabLevelPicker";
import { GrammarQuiz } from "./screens/GrammarQuiz";
import { SentenceMatch } from "./screens/SentenceMatch";
import { Flashcards } from "./screens/Flashcards";
import { ResultScreen } from "./screens/ResultScreen";
import { MistakeBook } from "./screens/MistakeBook";
import { AuthScreen } from "./screens/AuthScreen";

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const quizType = useGameStore((s) => s.quizType);
  const user = useGameStore((s) => s.user);
  const authLoading = useGameStore((s) => s.authLoading);
  const loadUser = useGameStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-ink">
        <div className="pixel-border bg-white p-5 shadow-pixel text-center">
          <p className="text-sm">正在連線 Supabase，請稍等...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="scanlines">
      {screen === "home" && <HomeScreen />}
      {screen === "vocabLevel" && <VocabLevelPicker />}
      {screen === "mistakes" && <MistakeBook />}
      {screen === "result" && <ResultScreen />}
      {screen === "playing" && quizType === "vocabulary" && <VocabularyQuiz />}
      {screen === "playing" && quizType === "grammar" && <GrammarQuiz />}
      {screen === "playing" && quizType === "sentence" && <SentenceMatch />}
      {screen === "playing" && quizType === "flashcard" && <Flashcards />}
    </div>
  );
}
