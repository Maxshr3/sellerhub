import "./StatusBadge.css";

type StatusBadgeProps = {
  tone: "success" | "warning" | "danger" | "neutral" | "info";
  children: string | number;
};

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return <span className={`app-status-badge app-status-badge--${tone}`}>{children}</span>;
}