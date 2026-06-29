import { StatusBadge } from "./StatusBadge";
import "./ProductHealthBadge.css";

type ProductForHealth = {
  stock: number;
  rating: string | number | null;
  isActive: boolean;
};

type ProductHealthBadgeProps = {
  product: ProductForHealth;
  compact?: boolean;
};

function parseNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsedValue = Number(value.replace(",", "."));

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function calculateHealthScore(product: ProductForHealth) {
  const rating = parseNumber(product.rating);

  let score = 100;

  if (!product.isActive) {
    score -= 18;
  }

  if (product.stock <= 0) {
    score -= 35;
  } else if (product.stock <= 3) {
    score -= 28;
  } else if (product.stock <= 10) {
    score -= 16;
  }

  if (rating === 0) {
    score -= 8;
  } else if (rating < 3.5) {
    score -= 22;
  } else if (rating < 4.3) {
    score -= 12;
  }

  return Math.min(Math.max(Math.round(score), 0), 100);
}

function getHealthTone(score: number) {
  if (score >= 75) {
    return "success";
  }

  if (score >= 45) {
    return "warning";
  }

  return "danger";
}

function getHealthLabel(score: number) {
  if (score >= 75) {
    return "Здоровая карточка";
  }

  if (score >= 45) {
    return "Нужен контроль";
  }

  return "Зона риска";
}

function getMainSignal(product: ProductForHealth) {
  const rating = parseNumber(product.rating);

  if (!product.isActive) {
    return "Товар выключен";
  }

  if (product.stock <= 0) {
    return "Нет остатка";
  }

  if (product.stock <= 3) {
    return "Критический остаток";
  }

  if (product.stock <= 10) {
    return "Низкий остаток";
  }

  if (rating > 0 && rating < 4.3) {
    return "Рейтинг требует внимания";
  }

  return "Показатели в норме";
}

export function ProductHealthBadge({
  product,
  compact = false,
}: ProductHealthBadgeProps) {
  const score = calculateHealthScore(product);
  const tone = getHealthTone(score);
  const label = getHealthLabel(score);
  const signal = getMainSignal(product);

  if (compact) {
    return (
      <div className="product-health-badge product-health-badge--compact">
        <StatusBadge tone={tone}>{`${score}/100`}</StatusBadge>
        <span>{signal}</span>
      </div>
    );
  }

  return (
    <div className={`product-health-badge product-health-badge--${tone}`}>
      <div>
        <span>Health Score</span>
        <strong>{score}/100</strong>
      </div>

      <div>
        <StatusBadge tone={tone}>{label}</StatusBadge>
        <p>{signal}</p>
      </div>
    </div>
  );
}