import type { EventContext } from "@block-kit/utils";

/**
 * 阻止所有编辑器分发的事件
 * @param event
 * @param context
 */
export const preventContextEvent = (event: Event, context: EventContext) => {
  context.stop();
  event.preventDefault();
  event.stopPropagation();
};

/**
 * 滚动到指定元素
 * @param container
 * @param child
 */
export const scrollIfNeeded = (container: HTMLDivElement, child: Element, buffer = 0) => {
  const rect = child.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  if (rect.bottom > containerRect.bottom) {
    container.scrollTop = container.scrollTop + rect.bottom - containerRect.bottom + buffer;
  } else if (rect.top < containerRect.top) {
    container.scrollTop = container.scrollTop - containerRect.top + rect.top - buffer;
  }
};
