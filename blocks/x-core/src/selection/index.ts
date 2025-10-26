import type { BlockEditor } from "../editor";
import type { Range } from "./modules/range";

export class Selection {
  /** 上次时间片快照 */
  protected lastRecord: number;
  /** 时间片内执行次数 */
  protected execution: number;
  /** 先前选区 */
  protected previous: Range | null;
  /** 当前选区 */
  protected current: Range | null;

  /**
   * 构造函数
   * @param editor
   */
  public constructor(protected editor: BlockEditor) {
    this.lastRecord = 0;
    this.execution = 0;
    this.previous = null;
    this.current = null;
  }
}
