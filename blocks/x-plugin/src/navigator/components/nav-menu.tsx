import "../styles/nav-menu.scss";

import { IconScissor } from "@arco-design/web-react/icon";
import type { BlockEditor } from "@block-kit/x-core";
import type { ReactBlockWrapContext } from "@block-kit/x-react";
import type { FC, ReactElement } from "react";

import { Trigger } from "../../shared/component/trigger";

export const NavMenu: FC<{
  popupVisible: boolean;
  setPopupVisible: (visible: boolean) => void;
  closePopup: () => void;
  editor: BlockEditor;
  context: ReactBlockWrapContext;
  children: ReactElement;
}> = props => {
  const Menus = (
    <div className="block-kit-x-nav-menus" onMouseDown={e => e.preventDefault()}>
      <div className="block-kit-x-nav-menu" onClick={props.closePopup}>
        <IconScissor />
        剪切
      </div>
    </div>
  );

  return (
    <Trigger
      popup={() => Menus}
      duration={300}
      position="lt"
      popupAlign={{ top: 0, left: -5 }}
      popupVisible={props.popupVisible}
      setPopupVisible={props.setPopupVisible}
    >
      {props.children}
    </Trigger>
  );
};
