import "../styles/nav-trigger.scss";

import { cs, isHTMLElement, isUndef } from "@block-kit/utils";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { BlockEditor } from "@block-kit/x-core";
import type { ReactBlockWrapContext } from "@block-kit/x-react";
import type { FC, ReactElement } from "react";
import { useMemo, useState } from "react";

import { Trigger } from "../../shared/component/trigger";
import { useTriggerContext } from "../../shared/hooks/use-trigger";
import type { NavigatorContext, NavigatorPlugin } from "../types";
import { getNavigatorPlugins } from "../utils/schedule";
import { NavMenu } from "./nav-menu";

export const NavTrigger: FC<{
  editor: BlockEditor;
  context: ReactBlockWrapContext;
  plugins: NavigatorPlugin[];
}> = props => {
  const trigger = useTriggerContext();
  const [iconVisible, setIconVisible] = useState(false);
  const [menuPopupVisible, setMenuPopupVisible] = useState(false);

  const plugins = useMemo(() => {
    return getNavigatorPlugins(props.editor, props.plugins);
  }, [props.editor, props.plugins]);

  const closePopup = useMemoFn(() => {
    setMenuPopupVisible(false);
    setIconVisible(false);
  });

  const navContext = useMemo(() => {
    const context = props.context;
    const ctx: NavigatorContext = {
      block: context,
      editor: context.state.container.editor,
      closePopup,
    };
    return ctx;
  }, [props.context, closePopup]);

  const icon = useMemo(() => {
    for (const func of plugins.icons) {
      const res = func(navContext);
      if (!isUndef(res)) return res;
    }
    return null;
  }, [plugins, navContext]);

  if (!icon || !icon.el) {
    return props.children as ReactElement;
  }

  const onNavRef = (ref: HTMLElement | null) => {
    if (!ref) return;
    const firstChild = ref.children[0];
    if (!isHTMLElement(firstChild)) return;
    firstChild.onmouseenter = e => trigger.current.onMouseEnter(e);
    firstChild.onmouseleave = e => trigger.current.onMouseLeave(e);
  };

  const MenuIcon = (
    <NavMenu
      popupVisible={menuPopupVisible}
      setPopupVisible={setMenuPopupVisible}
      closePopup={closePopup}
      editor={props.editor}
      navPlugins={plugins}
      navContext={navContext}
    >
      <div
        className={cs("block-kit-x-nav-icon", icon.className)}
        onMouseDown={e => e.preventDefault()}
      >
        {icon.el}
      </div>
    </NavMenu>
  );

  return (
    <Trigger
      uncontrolled
      popupVisible={iconVisible}
      setPopupVisible={setIconVisible}
      onContextRef={trigger}
      popup={() => MenuIcon}
      position={icon.position}
      popupAlign={icon.popupAlign || { top: 0, left: -5 }}
      duration={300}
    >
      <div
        ref={onNavRef}
        className={cs("block-kit-x-nav", menuPopupVisible && iconVisible && "block-kit-x-active")}
        data-nav-menu
      >
        {props.children}
      </div>
    </Trigger>
  );
};
