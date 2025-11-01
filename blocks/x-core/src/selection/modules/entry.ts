import type { BlockEditor } from "../../editor";
import { getLCAWithChildren } from "../../state/utils/tree";
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
   * 判断块 Entry
   * @param entry
   */
  public static isBlockEntry(entry: RangeEntry): entry is BlockEntry {
    return entry.type === T.BLOCK;
  }

  /**
   * 判断文本 Entry
   * @param entry
   */
  public static isTextEntry(entry: RangeEntry): entry is TextEntry {
    return entry.type === T.TEXT;
  }

  /**
   * 判断 Entry 是否相等
   * @param entry1
   * @param entry2
   */
  public static isEqual(entry1: RangeEntry | null, entry2: RangeEntry | null): boolean {
    if (entry1 === entry2) return true;
    if (!entry1 || !entry2) return false;
    const n1 = entry1 as TextEntry;
    const n2 = entry2 as TextEntry;
    return n1.id === n2.id && n1.type === n2.type && n1.start === n2.start && n1.len === n2.len;
  }

  /**
   * 判断 Entry1 是否在 Entry2 之前
   * - 即 < (e1 e2), 反之则 >= (e2 e1)
   * @param entry1
   * @param entry2
   */
  public static isBefore(
    editor: BlockEditor,
    entry1: RangeEntry | null,
    entry2: RangeEntry | null
  ): boolean {
    if (!entry1 || !entry2) return false;
    if (entry1.id === entry2.id) {
      if (entry1.type !== entry2.type) return false;
      if (Entry.isBlockEntry(entry1)) return true;
      if (Entry.isTextEntry(entry1)) return entry1.start < (<TextEntry>entry2).start;
      return true;
    }
    const s1 = editor.state.getBlock(entry1.id);
    const s2 = editor.state.getBlock(entry2.id);
    if (!s1 || !s2) return false;
    const tuple = getLCAWithChildren(s1, s2);
    return tuple ? tuple.child1.index < tuple.child2.index : false;
  }

  /**
   * 判断 Entry1 是否在 Entry2 之后
   * - 即 > (e2 e1), 反之则 <= (e1 e2)
   * @param entry1
   * @param entry2
   */
  public static isAfter(
    editor: BlockEditor,
    entry1: RangeEntry | null,
    entry2: RangeEntry | null
  ): boolean {
    if (!entry1 || !entry2) return false;
    if (entry1.id === entry2.id) {
      if (entry1.type !== entry2.type) return false;
      if (Entry.isBlockEntry(entry1)) return true;
      if (Entry.isTextEntry(entry1)) return entry1.start > (<TextEntry>entry2).start;
      return true;
    }
    const s1 = editor.state.getBlock(entry1.id);
    const s2 = editor.state.getBlock(entry2.id);
    if (!s1 || !s2) return false;
    const tuple = getLCAWithChildren(s1, s2);
    return tuple ? tuple.child1.index > tuple.child2.index : false;
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
   * @param entry
   * @param start [?=undef]
   * @param len [?=undef]
   */
  public static fromPoint(entry: BlockPoint): BlockEntry;
  public static fromPoint(entry: TextPoint, start: number, len?: number): TextEntry;
  public static fromPoint(entry: RangePoint, start?: number, len?: number): RangeEntry {
    if (entry.type === T.BLOCK) {
      return { id: entry.id, type: entry.type } as BlockEntry;
    } else {
      return { id: entry.id, type: entry.type, start, len: len || 0 } as TextEntry;
    }
  }
}
