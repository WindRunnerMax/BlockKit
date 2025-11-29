import type { BlockEditor, BlockState } from "../../src/";

export const logTreeState = (editor: BlockEditor): void => {
  function formatTree(root: BlockState): string[] {
    const result: string[] = [];
    /**
     * 递归函数，用于深度优先遍历树并构建目录结构字符串。
     *
     * @param node 当前处理的节点。
     * @param prefix 当前节点前缀（控制分支线 | 和空格）。
     * @param isTail 当前节点是否是其父节点的最后一个子节点。
     */
    function traverse(node: BlockState, prefix: string, isTail: boolean) {
      // 1. 构造当前行的内容
      // isTail 为 true: └── (L字形，表示结束)
      // isTail 为 false: ├── (T字形，表示后面还有同级兄弟)
      const connector = isTail ? "└── " : "├── ";
      result.push(prefix + connector + node.id);
      // 2. 准备下一级（子节点）的前缀
      let nextPrefix = prefix;
      // 如果当前节点不是最后一个子节点 (isTail=false)，
      // 那么下一级的前缀需要保留垂直线 | (否则就全是空格了)
      if (!isTail) {
        nextPrefix += "│   "; // 垂直线 + 三个空格
      } else {
        nextPrefix += "    "; // 四个空格
      }
      // 3. 递归遍历子节点
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        // 判断子节点是否是它父节点的最后一个子节点
        const childIsTail = i === node.children.length - 1;

        traverse(child, nextPrefix, childIsTail);
      }
    }
    // 从根节点开始遍历 (根节点没有父节点，所以 isTail 概念不适用，这里设为 false 即可)
    traverse(root, "", false);
    return result;
  }
  console.log(formatTree(editor.state.getRootBlock()).join("\n"));
};
