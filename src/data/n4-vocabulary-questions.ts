import rawYaml from "./learning-n4-vocabulary.yml?raw";
import { buildVocabFromYaml } from "./vocab-builder";

export const n4VocabularyQuestions = buildVocabFromYaml(rawYaml, "n4-v-");
