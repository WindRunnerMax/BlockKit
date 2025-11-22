import type { EventBus, EventKeys, Listener as EventListener } from "@block-kit/utils";

import type { EventMap } from "./index";

/** 事件类型扩展 */
export interface EventMapExtension {}

/** 内建事件组 */
export type InternalEvent = EventMap & EventMapExtension;

/** 内建事件总线类型 */
export type InternalEventBus = EventBus<InternalEvent>;

/** 事件监听方法 */
export type Listener<T extends EventKeys<InternalEvent>> = EventListener<InternalEvent, T>;
