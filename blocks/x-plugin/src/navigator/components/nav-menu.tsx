import "../styles/nav-menu.scss";

import { cs, isHTMLElement, isUndef } from "@block-kit/utils";
import type { BlockEditor } from "@block-kit/x-core";
import type { ReactBlockWrapContext } from "@block-kit/x-react";
import type { FC } from "react";
import { useMemo } from "react";

import { Trigger } from "../../shared/component/trigger";
import { useTriggerContext } from "../../shared/hooks/use-trigger";
import type { NavigatorResult } from "../types";
import { getNavigatorPlugins } from "../utils/schedule";

export const NavMenu: FC<{
  editor: BlockEditor;
  context: ReactBlockWrapContext;
}> = props => {
  const trigger = useTriggerContext();

  const onNavRef = (ref: HTMLElement | null) => {
    if (!ref) return;
    trigger.current.onChildRef(ref);
    const firstChild = ref.children[0];
    if (!isHTMLElement(firstChild)) return;
    firstChild.onmouseenter = () => {
      trigger.current.onMouseEnter();
    };
    firstChild.onmouseleave = () => {
      trigger.current.onMouseLeave();
    };
  };

  const result: NavigatorResult = useMemo(() => {
    const plugins = getNavigatorPlugins(props.editor);
    for (const plugin of plugins) {
      const res = plugin.renderNavigator(props.context);
      if (!isUndef(res)) return res;
    }
    return null;
  }, [props.context, props.editor]);

  const MenuIcon =
    result && result.icon ? (
      <div className={cs("block-kit-x-nav-icon", result.icon.className)}>{result.icon.el}</div>
    ) : null;

  return (
    <Trigger
      onContextRef={trigger}
      popup={() => MenuIcon}
      popupAlign={{ top: 0, left: -35 }}
      duration={300}
    >
      <div className={cs("block-kit-x-nav")} data-nav-menu ref={onNavRef}>
        {props.children}
      </div>
    </Trigger>
  );
};
