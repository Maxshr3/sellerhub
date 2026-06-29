import "./LoadingState.css";

type LoadingStateProps = {
  title?: string;
  rows?: number;
};

export function LoadingState({
  title = "Загрузка данных...",
  rows = 3,
}: LoadingStateProps) {
  return (
    <div className="app-loading-state">
      <strong>{title}</strong>

      <div className="app-loading-state__list">
        {Array.from({ length: rows }).map((_, index) => (
          <div className="app-loading-state__row" key={index}>
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    </div>
  );
}