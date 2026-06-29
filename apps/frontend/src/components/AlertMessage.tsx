import "./AlertMessage.css";

type AlertMessageProps = {
  type: "success" | "error" | "info";
  children: string;
};

export function AlertMessage({ type, children }: AlertMessageProps) {
  return (
    <p className={`app-alert app-alert--${type}`}>
      <span>{type === "success" ? "✓" : type === "error" ? "!" : "i"}</span>
      {children}
    </p>
  );
}