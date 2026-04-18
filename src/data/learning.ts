import YAML from "yaml";

export interface LearningAiHints {
  instructions?: string;
}

export interface LearningVocabularyItem {
  word: string;
  reading: string;
  meaning?: string;
  example?: string;
}

export interface LearningGrammarItem {
  pattern: string;
  meaning?: string;
  example?: string;
}

export interface LearningSentenceItem {
  prompt: string;
  lefts: string[];
  rights: string[];
  note?: string;
}

export interface LearningFlashcardItem {
  front: string;
  reading?: string;
  back: string;
  example?: string;
}

export interface LearningContent {
  title?: string;
  description?: string;
  ai?: LearningAiHints;
  vocabulary?: LearningVocabularyItem[];
  grammar?: LearningGrammarItem[];
  sentence?: LearningSentenceItem[];
  flashcards?: LearningFlashcardItem[];
}

export async function loadLearningContent(): Promise<LearningContent | null> {
  try {
    const response = await fetch("/learning.yml");
    if (!response.ok) {
      return null;
    }

    const text = await response.text();
    const data = YAML.parse(text) as LearningContent;
    return data;
  } catch {
    return null;
  }
}
