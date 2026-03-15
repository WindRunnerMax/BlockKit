export const TOOLBAR_KEY = "toolbar" as const;

export type ToolbarProps = {
  className?: string;
  children: React.ReactNode;
  styles?: React.CSSProperties;
  onRef?: React.MutableRefObject<HTMLDivElement | null>;
};
