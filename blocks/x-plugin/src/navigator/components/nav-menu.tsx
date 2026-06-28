import "../styles/nav-menu.scss";

import type { BlockEditor } from "@block-kit/x-core";
import type { FC, ReactElement } from "react";
import { useMemo } from "react";

import { Trigger } from "../../shared/component/trigger";
import type { NavigatorContext } from "../types";
import type { NavPluginCache } from "../utils/schedule";

export const NavMenu: FC<{
  popupVisible: boolean;
  setPopupVisible: (visible: boolean) => void;
  closePopup: () => void;
  editor: BlockEditor;
  navPlugins: NavPluginCache;
  navContext: NavigatorContext;
  children: ReactElement;
}> = props => {
  const MenuList = useMemo(() => {
    const els: React.ReactNode[] = [];
    for (const func of props.navPlugins.menus) {
      const el = func(props.navContext);
      els.push(el);
    }
    return els;
  }, [props.navContext, props.navPlugins.menus]);

  const Menus = (
    <div className="block-kit-x-nav-menus" onMouseDown={e => e.preventDefault()}>
      {MenuList}
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
