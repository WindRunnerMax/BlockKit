// eslint-disable-next-line simple-import-sort/imports
import Prism from "prismjs";
import "prismjs/themes/prism.min.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-java";
import { CODE_HL_KEY, DEFAULT_LANGUAGE } from "./constant";
import { Delta } from "@block-kit/delta";
import { isString, NIL } from "@block-kit/utils";

export const tokenize = (code: string, language: string) => {
  const delta = new Delta();
  if (language === DEFAULT_LANGUAGE) {
    delta.retain(code.length, { [CODE_HL_KEY]: NIL });
    return delta;
  }
  const tokens = Prism.tokenize(code, Prism.languages[language.toLowerCase()]);
  for (const token of tokens) {
    if (!isString(token)) {
      const length = token.content.length;
      delta.retain(length, { [CODE_HL_KEY]: token.type });
    } else {
      delta.retain(token.length, { [CODE_HL_KEY]: NIL });
    }
  }
  return delta;
};
