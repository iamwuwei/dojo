import { useGameStore } from "../store/useGameStore";
import { ChoiceQuiz } from "../components/ChoiceQuiz";
import { grammarQuestions } from "../data/grammar";

export function GrammarQuiz() {
  const mode = useGameStore((s) => s.mode) ?? "combo";

  const adapted = grammarQuestions.map((q) => ({
    id: q.id,
    prompt: q.sentence.replace("___", "_ _ _"),
    subPrompt: `中: ${q.translation}`,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    raw: q,
  }));

  return <ChoiceQuiz title="文法穴埋め" questions={adapted} mode={mode} />;
}
