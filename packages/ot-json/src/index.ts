import { JSONType } from "./json0";
import { TextType } from "./text0";

export { JSONType } from "./json0";
export type { Subtype, SubtypeOp } from "./subtype";
export { subtypes } from "./subtype";
export { TextType } from "./text0";
export type {
  ListDeleteOp,
  ListInsertOp,
  ListMoveOp,
  ListReplaceOp,
  NumberAddOp,
  ObjectDeleteOp,
  ObjectInsertOp,
  ObjectReplaceOp,
  Op,
  Side,
  Snapshot,
  TextOp,
} from "./types";
export { SIDE } from "./utils";

export const json = new JSONType();
export const text = new TextType();
