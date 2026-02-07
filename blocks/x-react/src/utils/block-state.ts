import type { BlockEditor, BlockState } from "@block-kit/x-core";

export type BlockViewProps = {
  editor: BlockEditor;
  state: BlockState;
  childClsName?: string;
};

export const blockPropsAreEqual = (
  prev: Readonly<React.PropsWithChildren<BlockViewProps>>,
  next: Readonly<React.PropsWithChildren<BlockViewProps>>
): boolean => {
  return (
    prev.editor === next.editor &&
    prev.state === next.state &&
    prev.childClsName === next.childClsName &&
    prev.state.linear === next.state.linear &&
    prev.state.data.delta === next.state.data.delta &&
    prev.state.data.children === next.state.data.children
  );
};
