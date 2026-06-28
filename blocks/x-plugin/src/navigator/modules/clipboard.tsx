import { IconObliqueLine } from "@arco-design/web-react/icon";
import { Fragment } from "react";

import type { NavigatorPlugin } from "../types";

export const ClipboardNavPlugin: NavigatorPlugin = {
  __PRIORITY__renderNavigator: 999,
  renderNavigator: () => ({
    menu: context => {
      return (
        <Fragment key="clipboard">
          <div className="block-kit-x-nav-menu" onClick={context.closePopup}>
            <IconObliqueLine />
            测试
          </div>
        </Fragment>
      );
    },
  }),
};
