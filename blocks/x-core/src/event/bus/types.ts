import type { EventBus } from "@block-kit/utils";

import type { EventMap } from "./index";

/** 事件类型扩展 */
export interface EventMapExtension {}

/** 内建事件总线类型 */
export type InternalEventBus = EventBus<EventMap & EventMapExtension>;
