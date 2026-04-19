import { useGameStore } from "../store/useGameStore";
import { ChoiceQuiz } from "../components/ChoiceQuiz";
import { vocabularyQuestions } from "../data/vocabulary";

export function VocabularyQuiz() {
  const mode = useGameStore((s) => s.mode) ?? "combo";
  const isMastered = useGameStore((s) => s.isMastered);

  const adapted = vocabularyQuestions
    .filter((q) => !isMastered(q.id))
    .map((q) => ({
      id: q.id,
      prompt: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      raw: q,
    }));

  return <ChoiceQuiz title="単語クイズ" questions={adapted} mode={mode} />;
}
