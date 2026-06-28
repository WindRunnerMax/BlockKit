import "../styles/nav-trigger.scss";

import { cs, isHTMLElement, isUndef } from "@block-kit/utils";
import type { BlockEditor } from "@block-kit/x-core";
import type { ReactBlockWrapContext } from "@block-kit/x-react";
import type { FC, ReactElement } from "react";
import { useMemo, useState } from "react";

import { Trigger } from "../../shared/component/trigger";
import { useTriggerContext } from "../../shared/hooks/use-trigger";
import { getNavigatorPlugins } from "../utils/schedule";
import { NavMenu } from "./nav-menu";

export const NavTrigger: FC<{
  editor: BlockEditor;
  context: ReactBlockWrapContext;
}> = props => {
  const trigger = useTriggerContext();
  const [iconVisible, setIconVisible] = useState(false);
  const [menuPopupVisible, setMenuPopupVisible] = useState(false);

  const onNavRef = (ref: HTMLElement | null) => {
    if (!ref) return;
    const firstChild = ref.children[0];
    if (!isHTMLElement(firstChild)) return;
    firstChild.onmouseenter = e => trigger.current.onMouseEnter(e);
    firstChild.onmouseleave = e => trigger.current.onMouseLeave(e);
  };

  const result = useMemo(() => {
    const plugins = getNavigatorPlugins(props.editor);
    for (const func of plugins.icons) {
      const res = func(props.context);
      if (!isUndef(res)) return res;
    }
    return null;
  }, [props.context, props.editor]);

  if (!result || !result.el) {
    return props.children as ReactElement;
  }

  const closePopup = () => {
    setMenuPopupVisible(false);
    setIconVisible(false);
  };

  const MenuIcon = (
    <NavMenu
      popupVisible={menuPopupVisible}
      setPopupVisible={setMenuPopupVisible}
      closePopup={closePopup}
      editor={props.editor}
      context={props.context}
    >
      <div
        className={cs("block-kit-x-nav-icon", result.className)}
        onMouseDown={e => e.preventDefault()}
      >
        {result.el}
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
      position={result.position}
      popupAlign={result.popupAlign || { top: 0, left: -5 }}
      duration={300}
    >
      <div
        className={cs("block-kit-x-nav", menuPopupVisible && iconVisible && "block-kit-x-active")}
        data-nav-menu
        ref={onNavRef}
      >
        {props.children}
      </div>
    </Trigger>
  );
};
