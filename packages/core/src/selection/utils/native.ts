import { FALSY, isDOMElement, isDOMText } from "@block-kit/utils";

import type { Editor } from "../../editor";
import {
  BLOCK_KEY,
  EDITABLE,
  ISOLATED_KEY,
  LEAF_STRING,
  PLACEHOLDER_KEY,
  VOID_KEY,
  VOID_LEN_KEY,
  ZERO_EMBED_KEY,
  ZERO_SPACE_KEY,
  ZERO_VOID_KEY,
} from "../../model/types";
import type { Point } from "../modules/point";
import type { Range } from "../modules/range";
import type { DOMPoint, DOMRange, DOMStaticRange, NormalizePointContext } from "../types";
import { DIRECTION } from "../types";
import { getEditableChildAndIndex, getTextNode, isEmbedZeroNode, isNotEditableNode } from "./dom";

/**
 * 规范化 DOMPoint
 * @param domPoint DOM 节点
 * @param context 环境信息
 */
export const normalizeDOMPoint = (domPoint: DOMPoint, context: NormalizePointContext): DOMPoint => {
  let { node, offset } = domPoint;
  const { isCollapsed, isEndNode } = context;

  // If it's an element node, its offset refers to the index of its children
  // 此处说明节点非 Text 节点, 需要将选区转移到 Text 节点
  // 例如 行节点、Void、Leaf 节点
  if (isDOMElement(node) && node.childNodes.length) {
    // COMPAT: 特殊判断选区节点在 ContentEditable 上的情况
    // 在 Embed 情况下可以直接取得前向节点, 减少后续的查找消耗
    // 即 [[z][editable(false)[caret]]] 的情况
    if (
      isNotEditableNode(node) &&
      node.previousElementSibling &&
      isEmbedZeroNode(node.previousElementSibling.firstChild)
    ) {
      // 当拖蓝选区在 Embed 节点上时, 需要确定是否将内容节点完全覆盖
      // 强制选择存在两种情况, 正向拖选其为末尾时, 以及反向拖选其为起始时
      const turning = !isCollapsed && isEndNode ? 1 : 0;
      return { node: node.previousElementSibling.firstChild, offset: turning };
    }

    // 选区节点的偏移可以是最右侧的插值位置, offset 则为其之前的节点总数
    let isLast = offset === node.childNodes.length;
    let index = isLast ? offset - 1 : offset;
    // including comment nodes, so try to find the right text child node.
    [node, index] = getEditableChildAndIndex(
      node,
      index,
      isLast ? DIRECTION.BACKWARD : DIRECTION.FORWARD
    );

    // If the editable child found is in front of input offset,
    // we instead seek to its end
    // 若是新的 index 小于选区的 offset, 则应该认为需要从新节点末尾开始查找
    // 注意此时的 offset 和查找的 index 都是 node 节点的子节点, 因此可以比较
    isLast = index < offset;

    // If the node has children, traverse until we have a leaf node.
    // Leaf nodes can be either text nodes, or other void DOM nodes.
    while (isDOMElement(node) && node.childNodes.length) {
      const i = isLast ? node.childNodes.length - 1 : 0;
      [node] = getEditableChildAndIndex(node, i, isLast ? DIRECTION.BACKWARD : DIRECTION.FORWARD);
    }

    // Determine the new offset inside the text node.
    // `backward` and the text is not empty, cursor is at the end of the `leaf node`
    // otherwise the cursor is at the start of the `leaf node`
    offset = isLast && node.textContent !== null ? node.textContent.length : 0;
  }

  // If the node is a text node itself, use the offset directly.
  return { node, offset };
};

/**
 * 创建文本节点迭代器
 * - 查找节点, 剪枝 + 惰性迭代
 * @param root 根节点
 */
export const createTextNodeWalker = (root: Node) => {
  // 类似于选择器 `span[${LEAF_STRING}], span[${ZERO_SPACE_KEY}]`
  // 虽然配合 :not() 可以实现剪枝, 但仍然会遍历内部节点, 在编辑器嵌套时会有较多无效查找
  // 使用 Walker 除了可以控制实现剪枝之外, 还可以实现惰性迭代, 无需预先遍历所有 DOM 结构
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      // 剪枝条件, 存在如下条件时, 则拒绝整个子树
      if (
        node instanceof HTMLElement === false ||
        node.getAttribute(EDITABLE) === FALSY ||
        node.hasAttribute(VOID_KEY) ||
        node.hasAttribute(BLOCK_KEY) ||
        node.hasAttribute(ISOLATED_KEY) ||
        node.hasAttribute(PLACEHOLDER_KEY)
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      // 接受条件, 如果节点存在文本 Key, 则接受
      if (node.hasAttribute(LEAF_STRING) || node.hasAttribute(ZERO_SPACE_KEY)) {
        return NodeFilter.FILTER_ACCEPT;
      }
      // 默认情况, 跳过该节点, 但继续检查子节点
      return NodeFilter.FILTER_SKIP;
    },
  });
  function* iterator() {
    let current = walker.nextNode();
    let next = walker.nextNode();
    while (current) {
      yield [current, next] as [HTMLElement, HTMLElement | null];
      current = next;
      next = walker.nextNode();
    }
  }
  return iterator();
};

/**
 * 将 ModalPoint 转换为 DOMPoint
 * @param editor
 * @param point
 */
export const toDOMPoint = (editor: Editor, point: Point): DOMPoint => {
  const { line, offset } = point;
  const blockState = editor.state.block;
  const lineState = blockState && blockState.getLine(line);
  // 这里理论上可以增加从 DOM 找最近的 LineNode 的逻辑
  // 可以防止修改内容后状态变更, 此时立即更新选区导致的节点查找问题
  const lineNode = editor.model.getLineNode(lineState);
  if (!lineNode) {
    return { node: null, offset: 0 };
  }
  if (isDOMText(lineNode)) {
    return { node: lineNode, offset: offset };
  }
  let start = 0;
  const walker = createTextNodeWalker(lineNode);
  for (const [leaf, nextLeaf] of walker) {
    if (!leaf || leaf.textContent === null) {
      continue;
    }
    // Leaf 节点的长度, 即处理 offset 关注的实际偏移量
    let len = leaf.textContent.length;
    if (leaf.hasAttribute(ZERO_SPACE_KEY)) {
      // 先通用地处理为 1, 此时长度不应该为 0, 具体长度需要检查 fake len
      // 存在由于 IME 破坏该节点内容的情况, 此时直接取 text len 不可靠
      len = 1;
      // 这里的长度可能会被 void 的 fake length 影响
      const fakeLen = leaf.getAttribute(VOID_LEN_KEY);
      const dataLength = fakeLen && Number.parseInt(fakeLen, 10);
      if (dataLength && !Number.isNaN(dataLength)) {
        len = dataLength;
      }
    }

    const end = start + len;
    if (offset <= end) {
      // Offset 在此处会被处理为相对于当前节点的偏移量
      // 例如: text1text2 offset: 7 -> text1te|xt2
      // current node is text2 -> start = 5
      // end = 5(start) + 5(len) = 10
      // offset = 7 < 10 -> new offset = 7(offset) - 5(start) = 2
      const nodeOffset = Math.max(offset - start, 0);
      // CASE1: 对同个光标位置, 且存在两个节点相邻时, 实际上是存在两种表达
      // 即 <s>1|</s><s>1</s> / <s>1</s><s>|1</s>
      // 当前计算方法的默认行为是 1, 而 Embed 节点在末尾时则需要额外的零宽字符放置光标
      // 且在 Embed 选区表现会存在特殊问题, 即使光标在节点右侧, 视觉上仍会保持节点左侧
      // 因此如果当前节点是 Embed 节点, 并且 offset 为 1, 并且存在下一个节点时
      // 需要将焦点转移到下一个节点, 并且 offset 为 0
      if (leaf.hasAttribute(ZERO_EMBED_KEY) && nodeOffset && nextLeaf) {
        return { node: nextLeaf, offset: 0 };
      }
      // CASE2: 当 Embed 元素前存在内容且光标位于节点末时, 需要校正到 Embed 节点上
      // <s>1|</s><e> </e> => <s>1</s><e>| </e>
      // 这部分主要是避免按下右键时需要受控处理光标移动, 但与 Model Case2 冲突依然需要受控
      // 因此这里先注释 CASE2 的逻辑, 避免在 Safari 旧版本中的光标位置无法正常获取的问题
      {
        // if (nodeOffset === len && nextLeaf && nextLeaf.hasAttribute(ZERO_EMBED_KEY)) {
        //   return { node: nextLeaf, offset: 0 };
        // }
      }
      // CASE3: 当光标位于 Void 节点时, 且此时存在后续的 leaf 节点, 需要兜底处理节点偏移
      // 由于是 Void 而不是 Embed, 通常这种情况不会存在, 但是需要兜底这种情况, 防止 crash
      if (leaf.hasAttribute(ZERO_VOID_KEY) && nextLeaf) {
        return { node: leaf, offset: 1 };
      }
      return { node: leaf, offset: nodeOffset };
    }
    start = end;
  }

  return { node: null, offset: 0 };
};

/**
 * 将 ModalRange 转换为 DOMRange
 * @param editor
 * @param range
 */
export const toDOMRange = (editor: Editor, range: Range): DOMRange | null => {
  const { start, end } = range;
  const startDOMPoint = toDOMPoint(editor, start);
  const endDOMPoint = range.isCollapsed ? startDOMPoint : toDOMPoint(editor, end);
  if (!startDOMPoint.node || !endDOMPoint.node) {
    return null;
  }
  const domRange = window.document.createRange();
  // FIX: 选区方向必然是 start -> end
  const { node: startNode, offset: startOffset } = startDOMPoint;
  const { node: endNode, offset: endOffset } = endDOMPoint;
  const startTextNode = getTextNode(startNode);
  const endTextNode = getTextNode(endNode);
  if (startTextNode && endTextNode) {
    domRange.setStart(startTextNode, Math.min(startOffset, startTextNode.length));
    domRange.setEnd(endTextNode, Math.min(endOffset, endTextNode.length));
    return domRange;
  }
  return null;
};

/**
 * 判断两个 DOMStaticRange 是否相等
 * @param a
 * @param b
 */
export const isEqualDOMRange = (a: DOMStaticRange | null, b: DOMStaticRange | null): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;

  return (
    a.startContainer === b.startContainer &&
    a.startOffset === b.startOffset &&
    a.endContainer === b.endContainer &&
    a.endOffset === b.endOffset
  );
};
