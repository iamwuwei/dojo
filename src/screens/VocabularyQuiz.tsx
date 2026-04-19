import { useGameStore } from "../store/useGameStore";
import { ChoiceQuiz } from "../components/ChoiceQuiz";
import { vocabularyByLevel, vocabularyQuestions } from "../data/vocabulary";

export function VocabularyQuiz() {
  const mode = useGameStore((s) => s.mode) ?? "combo";
  const isMastered = useGameStore((s) => s.isMastered);
  const vocabLevel = useGameStore((s) => s.vocabLevel);

  const levelPool =
    vocabLevel === "all" ? vocabularyQuestions : vocabularyByLevel[vocabLevel];

  const adapted = levelPool
    .filter((q) => !isMastered(q.id))
    .map((q) => ({
      id: q.id,
      prompt: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      raw: q,
    }));

  const title =
    vocabLevel === "all" ? "単語クイズ" : `単語クイズ・${vocabLevel}`;

  return (
    <ChoiceQuiz
      title={title}
      questions={adapted}
      mode={mode}
      quizType="vocabulary"
    />
  );
}
