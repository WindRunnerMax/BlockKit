import type { P } from "@block-kit/utils/dist/es/types";
import type { BlockEditor } from "@block-kit/x-core";
import type { ReactBlockWrapContext } from "@block-kit/x-react";
import type { FC, ReactElement } from "react";

import { Trigger } from "../../shared/component/trigger";
import type { NavigatorResult } from "../types";

export const NavMenu: FC<{
  editor: BlockEditor;
  context: ReactBlockWrapContext;
  nav: P.NonNullable<NavigatorResult>;
  children: ReactElement;
}> = props => {
  return (
    <Trigger popup={() => <div></div>} duration={300}>
      {props.children}
    </Trigger>
  );
};
