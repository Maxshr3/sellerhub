import type { ReactNode } from "react";
import "./EmptyState.css";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="app-empty-state">
      <div className="app-empty-state__icon">◇</div>
      <strong>{title}</strong>
      <p>{description}</p>
      {action ? <div className="app-empty-state__action">{action}</div> : null}
    </div>
  );
}