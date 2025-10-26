import { isDOMText } from "@block-kit/utils";

import type { Editor } from "../../editor";
import { getLeafNode, getLineNode } from "../../model/utils/dom";
import { Point } from "../modules/point";
import { Range } from "../modules/range";
import type { DOMPoint, ModelPointContext } from "../types";
import { isEmbedZeroNode, isEnterZeroNode, isVoidZeroNode } from "./dom";
import { normalizeDOMPoint } from "./native";

/**
 * 将 DOMPoint 转换为 ModelPoint
 * @param editor
 * @param domPoint
 * @param context
 */
export const toModelPoint = (editor: Editor, domPoint: DOMPoint, context: ModelPointContext) => {
  const { offset, node } = domPoint;
  const { nodeContainer, nodeOffset, isCollapsed, isEndNode } = context;

  const leafNode = getLeafNode(node);
  let lineIndex = 0;
  let leafOffset = 0;

  const lineNode = getLineNode(leafNode);
  const lineModel = editor.model.getLineState(lineNode);
  // COMPAT: 在没有 LineModel 的情况, 选区会置于 BlockState 最前
  if (lineModel) {
    lineIndex = lineModel.index;
  }

  const leafModel = editor.model.getLeafState(leafNode);
  // COMPAT: 在没有 LeafModel 的情况, 选区会置于 Line 最前
  if (leafModel) {
    leafOffset = leafModel.offset + offset;
  }

  // COMPAT: 此处开始根据 case 修正 zero/void offset [节点级别]
  // Case 1: 当前节点为 data-zero-enter 时, 需要将其修正为前节点末尾
  // content\n[caret] => content[caret]\n
  const isEnterZero = isEnterZeroNode(node);
  if (isEnterZero && offset) {
    leafOffset = Math.max(leafOffset - 1, 0);
    return new Point(lineIndex, leafOffset);
  }
  // Case 2: 光标位于 data-zero-void 节点前时, 需要将其修正为节点末
  // 若不修正则会导致选区位置问题, 一些诸如删除之类的操作会失效
  // [[caret]void]\n => [void[caret]]\n
  // Case 3: 光标位于 data-zero-void 节点后其他位置时, 修正为节点末
  // 唤起 IME 输入时会导致原本零宽字符出现过多文本, 导致选区映射问题
  // [[z]xxx[caret]]\n => [[z][caret]xxx]\n
  const isVoidZero = isVoidZeroNode(node);
  if (isVoidZero && offset !== 1) {
    return new Point(lineIndex, 1);
  }
  // Case 4: 光标位于 data-zero-embed 节点上时, 需要将其修正为节点前
  // 若不校正会携带先前 Model CASE1 的零选区位置, 按下左键无法正常移动光标
  // 主体原则是落于零宽字符时, 光标置于节点前, `div`位置表示节点后, 对齐浏览器
  // [[z][caret]]\n => [[caret][z]]\n
  // [[z][div[caret]]][123]\n => [[z][div]][[caret]123]\n
  // Case 5: 光标在 Embed 节点内时, 光标可能会在其内部文本上(offset 可能 > 1)
  // 无论是选区折叠与否, 若不校正会导致选区越界, 会导致拖拽选区时出现偏移问题
  // 若是非折叠的选区, 则需要判断是否是 End 节点决定边界, 将整个 Embed 选区选中
  // [embed[caret > 1]] => [embed[caret = 1]]
  if (leafModel && leafModel.embed && offset >= 1) {
    const isEmbedZeroContainer = isEmbedZeroNode(nodeContainer);
    // 若是光标在 Embed 节点的零宽字符上, 修正到 Embed 节点前
    if (isEmbedZeroContainer && nodeOffset) {
      return new Point(lineIndex, leafModel.offset);
    }
    // 非折叠状态下, 需要判断 End 节点来决定选中边界
    if (!isCollapsed && isDOMText(nodeContainer)) {
      const index = isEndNode ? 1 : 0;
      return new Point(lineIndex, leafModel.offset + index);
    }
    // 默认情况下, 点击内部文本直接将光标放置于节点后
    return new Point(lineIndex, leafModel.offset + 1);
  }

  return new Point(lineIndex, leafOffset);
};

/**
 * 将 DOMStaticRange 转换为 ModelRange
 * @param editor
 * @param staticSel
 * @param isBackward
 */
export const toModelRange = (editor: Editor, staticSel: StaticRange, isBackward: boolean) => {
  const { startContainer, endContainer, collapsed, startOffset, endOffset } = staticSel;
  let startRangePoint: Point;
  let endRangePoint: Point;
  // ModelRange 必然是 Start -> End, 无需根据 Backward 修正
  if (!collapsed) {
    const startPoint = { node: startContainer, offset: startOffset };
    const endPoint = { node: endContainer, offset: endOffset };
    const startDOMPoint = normalizeDOMPoint(startPoint, {
      isCollapsed: false,
      isEndNode: false,
    });
    const endDOMPoint = normalizeDOMPoint(endPoint, {
      isCollapsed: false,
      isEndNode: true,
    });
    startRangePoint = toModelPoint(editor, startDOMPoint, {
      isCollapsed: false,
      isEndNode: false,
      nodeContainer: startContainer,
      nodeOffset: startOffset,
    });
    endRangePoint = toModelPoint(editor, endDOMPoint, {
      isCollapsed: false,
      isEndNode: true,
      nodeContainer: endContainer,
      nodeOffset: endOffset,
    });
  } else {
    const domPoint = { node: startContainer, offset: startOffset };
    const anchorDOMPoint = normalizeDOMPoint(domPoint, {
      isCollapsed: true,
      isEndNode: false,
    });
    startRangePoint = toModelPoint(editor, anchorDOMPoint, {
      isCollapsed: true,
      isEndNode: false,
      nodeContainer: startContainer,
      nodeOffset: startOffset,
    });
    endRangePoint = startRangePoint.clone();
  }
  // FIX: 修正选区折叠状态, 以 Range 的值计算为准
  return new Range(startRangePoint, endRangePoint, isBackward);
};
