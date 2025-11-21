import { Delta } from "@block-kit/delta";
import type { O } from "@block-kit/utils/dist/es/types";
import type { Token } from "marked";
import { marked } from "marked";

import { getDeltaPointerPosition } from "../utils/delta";
import { normalizeFragment, normalizeTokenTree } from "../utils/normalize";
import { parseLexerToken } from "../utils/token";
import type { DeltaComposer } from "./delta-composer";

// https://astexplorer.net/
// https://marked.js.org/demo/?outputType=lexer

export class MdComposer {
  /** 正在解析的内容 */
  protected content: string;
  /** 索引幂等的记录 */
  public indexIds: O.Map<O.Map<string>>;
  /** 归档的主级节点索引值 */
  public archiveLexerIndex: number;

  /**
   * 构造函数
   */
  public constructor(protected dc: DeltaComposer) {
    this.content = "";
    this.indexIds = {};
    this.archiveLexerIndex = 0;
  }

  /**
   * 追加内容
   */
  public compose(text: string) {
    this.content = this.content + text;
    return this.parse();
  }

  /**
   * 解析当前内容
   */
  public parse() {
    const tokens = marked.lexer(normalizeFragment(this.content));
    const tree = normalizeTokenTree(tokens);
    const delta = new Delta().retain(this.dc.archiveIndex);
    // 这里的指针需要合并已经归档的长度
    // 因为 delta 首个值是 retain, 这里同样需要对齐其长度表达
    let archiveLength = this.dc.archiveIndex;
    const archiveLexerIndex = this.archiveLexerIndex;
    // 只迭代 root 的首层子节点
    for (let i = 0; i < tree.length; i++) {
      const prev = tree[i - 1];
      const child = tree[i];
      // 首层子节点存在第二级时, 归档上一个节点
      // 此外诸如表格等节点可以正则等额外的匹配策略来避免过早归档
      // 但这样需要避免前次循环不归档而后续归档, 导致归档数据本身不连续
      if (prev && child) {
        this.archive(prev);
        archiveLength = archiveLength + this.dc.archive();
        const deltaLength = getDeltaPointerPosition(delta);
        // 若归档长度大于当前 delta 长度, 则需要移动指针
        // 主要是因为后续的处理是 merge diff, 此时的长度并非是 dc 的长度
        if (archiveLength - deltaLength > 0) {
          delta.push({ retain: archiveLength - deltaLength });
        }
      }
      const section = parseLexerToken(child, {
        depth: 0,
        mc: this,
        parent: null,
        index: archiveLexerIndex + i,
      });
      const diff = this.dc.compose(section);
      delta.merge(diff);
    }
    return delta.chop();
  }

  /**
   * 归档部分内容
   * @returns archived 字符长度
   */
  public archive(block: Token) {
    this.archiveLexerIndex++;
    const len = block.raw.length;
    this.content = this.content.slice(len);
    return len;
  }

  /**
   * 重置当前解析器
   */
  public reset() {
    this.content = "";
    this.indexIds = {};
    this.archiveLexerIndex = 0;
  }
}
