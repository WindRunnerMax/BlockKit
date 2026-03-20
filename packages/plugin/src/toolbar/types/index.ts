export const PASS_FOCUS_KEY = "data-pass-focus" as const;

export type ToolbarProps = {
  className?: string;
  children: React.ReactNode;
  styles?: React.CSSProperties;
  onRef?: React.MutableRefObject<HTMLDivElement | null>;
};
