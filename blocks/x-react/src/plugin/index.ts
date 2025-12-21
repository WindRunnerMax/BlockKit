import { CorePlugin } from "@block-kit/x-core";

import type { ReactBlockContext, ReactWrapContext } from "./types";

export abstract class BlockPlugin extends CorePlugin {
  /**
   * 渲染块包装节点
   * - 调度优先级值越大 DOM 结构在越外层
   */
  public renderWrap?(context: ReactWrapContext): React.ReactNode;

  /**
   * 渲染块级节点
   * - 调度优先级值越大 DOM 结构在越外层
   */
  public renderBlock?(context: ReactBlockContext): React.ReactNode;
}
