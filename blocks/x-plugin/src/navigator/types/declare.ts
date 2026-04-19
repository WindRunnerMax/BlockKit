import type { NavigatorContext } from "./index";

declare module "@block-kit/x-react/dist/es/plugin" {
  export interface BlockXPlugin {
    renderNavigator?(context: NavigatorContext): React.ReactNode;
  }
}
