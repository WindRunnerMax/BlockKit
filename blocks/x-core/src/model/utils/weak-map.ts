import type { BlockState } from "../../state/modules/state";

export const STATE_TO_RENDER = new WeakMap<BlockState, () => void>();
