import type { BlockEditor } from "../../editor";
import type {
  BlockEntry,
  BlockPoint,
  BlockType,
  RangeEntry,
  RangePoint,
  TextEntry,
  TextPoint,
} from "../types";
import { BLOCK_TYPE as T } from "../utils/constant";

export class Entry {
  /** 内建节点 */
  public readonly node: RangeEntry;

  /** 构造函数 */
  public constructor(node: RangeEntry) {
    this.node = node;
  }

  /**
   * 判断块 Point
   * @param point
   */
  public static isBlockEntry(point: RangeEntry): point is BlockEntry {
    return point.type === T.BLOCK;
  }

  /**
   * 判断文本 Point
   * @param point
   */
  public static isTextEntry(point: RangeEntry): point is TextEntry {
    return point.type === T.TEXT;
  }

  /**
   * 判断 Point 是否相等
   * @param point1
   * @param point2
   */
  public static isEqual(point1: RangeEntry | null, point2: RangeEntry | null): boolean {
    if (point1 === point2) return true;
    if (!point1 || !point2) return false;
    const n1 = point1 as TextEntry;
    const n2 = point2 as TextEntry;
    return n1.id === n2.id && n1.type === n2.type && n1.start === n2.start && n1.len === n2.len;
  }

  /**
   * 判断 Point1 是否在 Point2 之前
   * - 即 < (p1 p2), 反之则 >= (p2 p1)
   * @param point1
   * @param point2
   */
  public static isBefore(
    editor: BlockEditor,
    point1: RangeEntry | null,
    point2: RangeEntry | null
  ): boolean {
    if (!point1 || !point2) return false;
    if (point1.id === point2.id) {
      if (point1.type !== point2.type) return false;
      if (Entry.isBlockEntry(point1)) return true;
      if (Entry.isTextEntry(point1)) return point1.start < (<TextEntry>point2).start;
      return true;
    }
    const root = editor.state.getBlock(editor.state.rootId);
    const nodes = root && root.getTreeNodes();
    if (!root || !nodes || !nodes.length) return false;
    for (const node of nodes) {
      if (node.id === point1.id) return true;
      if (node.id === point2.id) return false;
    }
    return false;
  }

  /**
   * 判断 Point1 是否在 Point2 之后
   * - 即 > (p2 p1), 反之则 <= (p1 p2)
   * @param point1
   * @param point2
   */
  public static isAfter(
    editor: BlockEditor,
    point1: RangeEntry | null,
    point2: RangeEntry | null
  ): boolean {
    if (!point1 || !point2) return false;
    if (point1.id === point2.id) {
      if (point1.type !== point2.type) return false;
      if (Entry.isBlockEntry(point1)) return true;
      if (Entry.isTextEntry(point1)) return point1.start > (<TextEntry>point2).start;
      return true;
    }
    const root = editor.state.getBlock(editor.state.rootId);
    const nodes = root && root.getTreeNodes();
    if (!root || !nodes || !nodes.length) return false;
    for (const node of nodes) {
      if (node.id === point1.id) return false;
      if (node.id === point2.id) return true;
    }
    return false;
  }

  /**
   * 创建 Range Entry
   * @param id
   * @param type
   * @param start [?=undef]
   * @param len [?=undef]
   */
  public static create(id: string, type: typeof T.BLOCK): BlockEntry;
  public static create(id: string, type: typeof T.TEXT, start: number, len: number): TextEntry;
  public static create(id: string, type: BlockType, start?: number, len?: number): RangeEntry {
    if (type === T.BLOCK) {
      return { id, type } as BlockEntry;
    } else {
      return { id, type, start, len: len || 0 } as TextEntry;
    }
  }

  /**
   * 从 Point 创建 Range Entry
   * @param point
   * @param start [?=undef]
   * @param len [?=undef]
   */
  public static fromPoint(point: BlockPoint): BlockEntry;
  public static fromPoint(point: TextPoint, start: number, len?: number): TextEntry;
  public static fromPoint(point: RangePoint, start?: number, len?: number): RangeEntry {
    if (point.type === T.BLOCK) {
      return { id: point.id, type: point.type } as BlockEntry;
    } else {
      return { id: point.id, type: point.type, start, len: len || 0 } as TextEntry;
    }
  }
}
