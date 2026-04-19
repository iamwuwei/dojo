import rawYaml from "./learning-n5-vocabulary.yml?raw";
import { buildVocabFromYaml } from "./vocab-builder";

export const n5VocabularyQuestions = buildVocabFromYaml(rawYaml, "n5-v-");
