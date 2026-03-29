import { IconLink } from "@arco-design/web-react/icon";
import { LINK_KEY } from "@block-kit/plugin";
import { cs } from "@block-kit/utils";
import type { FC } from "react";

import type { RenderToolbarContext } from "../../toolbar/utils/schedule";

export const LinkTool: FC<{
  context: RenderToolbarContext;
}> = props => {
  const { keys, range, isTextRange } = props.context;

  if (range.length > 1 || !isTextRange) {
    return null;
  }

  return (
    <div className={cs("block-kit-x-toolbar-item", keys[LINK_KEY] && "active")}>
      <IconLink />
    </div>
  );
};
