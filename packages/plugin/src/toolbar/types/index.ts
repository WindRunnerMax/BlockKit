export const TOOLBAR_NO_PREVENT = "data-no-prevent" as const;

export type ToolbarProps = {
  className?: string;
  children: React.ReactNode;
  styles?: React.CSSProperties;
  onRef?: React.MutableRefObject<HTMLDivElement | null>;
};
