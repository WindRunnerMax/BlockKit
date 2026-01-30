import type { O } from "@block-kit/utils/dist/es/types";

export type XSchemaRule = {
  /**
   * 自动模式
   * - 默认自动模式, 根据 delta 字段来决定 BOX/TEXT 模式
   */
  auto?: boolean;
  /**
   * 容器节点, 例如 Quote、Cols、Table 块类型
   * 1. 不存在 delta 字段
   * 2. 至少包含 1 个 children 内子级块节点
   * 3. 子节点的表现形式为直接嵌套, 而并非缩进形式
   */
  box?: boolean;
  /**
   * 文本节点, 例如 Text、Bullet、Ordered 块类型
   * 1. 必然存在 delta 字段
   * 2. 可以存在 children 子节点, 表现为缩进的形式
   */
  text?: boolean;
  /**
   * 容器文本节点, 例如 Code 块类型
   * 1. 存在 delta 字段
   * 2. 不存在 children 内的子节点
   */
  box_text?: boolean;
  /**
   * 空节点, 例如 Image 块类型
   * 1. 可以存在 delta 字段
   * 2. 不存在 children 内的子节点
   */
  void?: boolean;
};

/**
 * 编辑器块节点模式规则
 * - key: 块节点类型, 即块的 type 字段
 * - value: 块节点模式规则
 */
export type EditorXRules = O.Map<XSchemaRule>;
