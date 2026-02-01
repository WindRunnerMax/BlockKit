// eslint-disable-next-line simple-import-sort/imports
import Prism from "prismjs";
import "prismjs/themes/prism.min.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-java";
import { CODE_HL_KEY, DEFAULT_LANGUAGE } from "./constant";
import { Delta } from "@block-kit/delta";

const getLength = (token: Prism.Token | string) => {
  if (typeof token === "string") {
    return token.length;
  } else if (typeof token.content === "string") {
    return token.content.length;
  }
  return 0;
};

export const tokenize = (code: string, language: string) => {
  const delta = new Delta();
  if (language === DEFAULT_LANGUAGE) return delta;
  const tokens = Prism.tokenize(code, Prism.languages[language.toLowerCase()]);
  for (const token of tokens) {
    const length = getLength(token);
    if (typeof token !== "string") {
      delta.retain(length, { [CODE_HL_KEY]: token.type });
    } else {
      delta.retain(length);
    }
  }
  return delta;
};
