import type { Editor } from "../../editor";
import type { Range } from "./range";
import { RawPoint } from "./raw-point";

/**
 * Raw Modal Range
 */
export class RawRange {
  constructor(
    /** 起始点 */
    public start: number,
    /** 长度 */
    public len: number
  ) {}

  /**
   * 克隆 RawRange
   */
  public clone() {
    return new RawRange(this.start, this.len);
  }

  /**
   * 转换为 RawPoint
   */
  public toPoint() {
    return {
      start: new RawPoint(this.start),
      end: new RawPoint(this.start + this.len),
    };
  }

  /**
   * 构建 RawRange
   * @param start
   * @param len
   * @usage RawRange.from(3, 6) => RawRange { start: 3, len: 6 }
   */
  public static from(start: number, len: number) {
    return new RawRange(start, len);
  }

  /**
   * 从边界构建 RawRange
   * @param start
   * @param len
   * @usage RawRange.fromEdge(3, 6) => RawRange { start: 3, len: 3 }
   */
  public static fromEdge(start: number, end: number) {
    const s = Math.min(start, end);
    const e = Math.max(start, end);
    return new RawRange(s, e - s);
  }

  /**
   * 从 RawPoint 构建 RawRange
   * @param start
   * @param end
   */
  public static fromPoint(start: RawPoint, end: RawPoint) {
    return RawRange.fromEdge(start.offset, end.offset);
  }

  /**
   * 将 Range 转换为 RawRange
   * @param editor
   * @param range
   */
  public static fromRange(editor: Editor, range: Range | null): RawRange | null {
    if (!range) return null;
    const start = RawPoint.fromPoint(editor, range.start);
    const end = range.isCollapsed ? start : RawPoint.fromPoint(editor, range.end);
    if (start && end) {
      // 此处保证 start 指向 end
      return new RawRange(start.offset, Math.max(end.offset - start.offset, 0));
    }
    return null;
  }

  /**
   * 判断 RawRange 是否相等
   * @param range1
   * @param range2
   */
  public static equals(range1: RawRange | null, range2: RawRange | null): boolean {
    if (range1 === range2) return true;
    if (!range1 || !range2) return false;
    return range1.start === range2.start && range1.len === range2.len;
  }

  /**
   * 判断 Range1 是否包含 Range2
   * @param range1
   * @param range2
   */
  public static includes(range1: RawRange | null, range2: RawRange | null): boolean {
    if (!range1 || !range2) return false;
    const { start: start1, end: end1 } = range1.toPoint();
    const { start: start2, end: end2 } = range2.toPoint();
    // --start1--end1--start2--end2--
    // --start1--start2--end2--end1-- ✅
    const start1BeforeStart2 = !RawPoint.isAfter(start1, start2);
    const end1AfterEnd2 = !RawPoint.isBefore(end1, end2);
    return start1BeforeStart2 && end1AfterEnd2;
  }

  /**
   * 判断 range1 是否与 range2 交叉
   * @param range1
   * @param range2
   */
  public static intersects(range1: RawRange | null, range2: RawRange | null): boolean {
    if (!range1 || !range2) return false;
    const { start: start1, end: end1 } = range1.toPoint();
    const { start: start2, end: end2 } = range2.toPoint();
    // --start1--end1--start2--end2--
    // => --end1--start2--
    // --start1--start2--end1--end2-- ✅
    // => --start2--end1--
    const start = RawPoint.isBefore(start1, start2) ? start2 : start1;
    const end = RawPoint.isBefore(end1, end2) ? end1 : end2;
    return !RawPoint.isAfter(start, end);
  }
}
