import type { BlockEditor } from "../../editor";
import type { BlockPoint, RangePoint, TextPoint } from "../types";
import { POINT_TYPE } from "../utils/constant";

export class Point {
  /**
   * 判断块 Point
   * @param point
   */
  public static isBlockPoint(point: RangePoint): point is BlockPoint {
    return point.type === POINT_TYPE.BLOCK;
  }

  /**
   * 判断文本 Point
   * @param point
   */
  public static isTextPoint(point: RangePoint): point is TextPoint {
    return point.type === POINT_TYPE.TEXT;
  }

  /**
   * 判断 Point 是否相等
   * @param point1
   * @param point2
   */
  public static isEqual(point1: RangePoint | null, point2: RangePoint | null): boolean {
    if (point1 === point2) return true;
    if (!point1 || !point2) return false;
    const n1 = point1 as TextPoint;
    const n2 = point2 as TextPoint;
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
    point1: RangePoint | null,
    point2: RangePoint | null
  ): boolean {
    if (!point1 || !point2) return false;
    if (point1.id === point2.id) {
      if (point1.type !== point2.type) return false;
      if (Point.isBlockPoint(point1)) return true;
      if (Point.isTextPoint(point1)) return point1.start < (<TextPoint>point2).start;
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
    point1: RangePoint | null,
    point2: RangePoint | null
  ): boolean {
    if (!point1 || !point2) return false;
    if (point1.id === point2.id) {
      if (point1.type !== point2.type) return false;
      if (Point.isBlockPoint(point1)) return true;
      if (Point.isTextPoint(point1)) return point1.start > (<TextPoint>point2).start;
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
}
