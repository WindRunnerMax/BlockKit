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
  Path,
  Side,
  Snapshot,
  TextOp,
} from "./types";
export { clone as cloneSnapshot, SIDE } from "./utils";

export const json = new JSONType();
export const text = new TextType();
