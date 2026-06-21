import type { ReactBlockWrapContext } from "@block-kit/x-react";
import type { FC } from "react";

import { Trigger } from "../../shared/component/trigger";

export const NavMenu: FC<{
  context: ReactBlockWrapContext;
}> = props => {
  return (
    <Trigger
      // 开发中, 暂时禁用触发器
      disabled
      popup={() => <div>Popup</div>}
      popupAlign={{ top: 5, left: -50 }}
      duration={300}
    >
      <div className="block-kit-x-nav" data-nav-menu>
        {props.children}
      </div>
    </Trigger>
  );
};
