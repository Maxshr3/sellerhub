import type { ReactNode } from "react";
import "./PageSection.css";

type PageSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function PageSection({
  title,
  description,
  children,
}: PageSectionProps) {
  return (
    <section className="page-section">
      <div className="page-section__header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      </div>

      {children}
    </section>
  );
}