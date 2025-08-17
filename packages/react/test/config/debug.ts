import type { LineState } from "@block-kit/core";

export const echoLines = (lines: LineState[]) => {
  lines.forEach(echoLineState);
};

export const echoLineState = (lineState: LineState) => {
  console.log("LineState", lineState.getOps());
};

export const stringifyHTML = (node: Node) => {
  const serializer = new XMLSerializer();
  const html = serializer.serializeToString(node);
  console.log("HTML", html);
};
