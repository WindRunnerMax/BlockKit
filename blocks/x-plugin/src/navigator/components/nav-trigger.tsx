import "../styles/nav-menu.scss";

import { cs, isHTMLElement, isUndef, preventNativeEvent } from "@block-kit/utils";
import type { BlockEditor } from "@block-kit/x-core";
import type { ReactBlockWrapContext } from "@block-kit/x-react";
import type { FC, ReactElement } from "react";
import { useMemo } from "react";

import { Trigger } from "../../shared/component/trigger";
import { useTriggerContext } from "../../shared/hooks/use-trigger";
import type { NavigatorResult } from "../types";
import { getNavigatorPlugins } from "../utils/schedule";
import { NavMenu } from "./nav-menu";

export const NavTrigger: FC<{
  editor: BlockEditor;
  context: ReactBlockWrapContext;
}> = props => {
  const trigger = useTriggerContext();

  const onNavRef = (ref: HTMLElement | null) => {
    if (!ref) return;
    const firstChild = ref.children[0];
    if (!isHTMLElement(firstChild)) return;
    firstChild.onmouseenter = e => trigger.current.onMouseEnter(e);
    firstChild.onmouseleave = e => trigger.current.onMouseLeave(e);
  };

  const result: NavigatorResult = useMemo(() => {
    const plugins = getNavigatorPlugins(props.editor);
    for (const plugin of plugins) {
      const res = plugin.renderNavigator(props.context);
      if (!isUndef(res)) return res;
    }
    return null;
  }, [props.context, props.editor]);

  if (!result || !result.icon) {
    return props.children as ReactElement;
  }

  const MenuIcon = (
    <NavMenu editor={props.editor} context={props.context} nav={result}>
      <div
        className={cs("block-kit-x-nav-icon", result.icon.className)}
        onMouseDown={preventNativeEvent}
      >
        {result.icon.el}
      </div>
    </NavMenu>
  );

  return (
    <Trigger
      uncontrolled
      onContextRef={trigger}
      popup={() => MenuIcon}
      position={result.icon.position}
      popupAlign={result.icon.popupAlign || { top: 0, left: -5 }}
      duration={300}
    >
      <div className={cs("block-kit-x-nav")} data-nav-menu ref={onNavRef}>
        {props.children}
      </div>
    </Trigger>
  );
};
