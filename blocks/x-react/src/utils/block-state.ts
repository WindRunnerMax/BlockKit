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
  if (prev.state.linear !== next.state.linear) return false;
  return (
    prev.editor === next.editor &&
    prev.state === next.state &&
    prev.childClsName === next.childClsName
  );
};
