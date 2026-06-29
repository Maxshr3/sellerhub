import type { ProductDetail } from "../types/product";

type ProductHealthTone = "success" | "warning" | "danger";

export type ProductHealthFactor = {
  type: "positive" | "negative" | "neutral";
  title: string;
  description: string;
};

export type ProductTimelineEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "review" | "stock" | "analytics" | "recommendation" | "system";
};

export type ProductIntelligence = {
  healthScore: number;
  healthTone: ProductHealthTone;
  healthLabel: string;
  mainRisk: string;
  recommendedAction: string;
  factors: ProductHealthFactor[];
  stockPlanner: {
    averageDailyOrders: number;
    daysLeft: number | null;
    recommendedRestock: number;
    message: string;
  };
  lostRevenue: {
    total: number;
    stockRisk: number;
    conversionRisk: number;
    message: string;
  };
  timeline: ProductTimelineEvent[];
};

export type ProductScenario = {
  currentRevenue: number;
  projectedRevenue: number;
  revenueDelta: number;
  projectedPrice: number;
  projectedStock: number;
  projectedConversion: number;
  riskLabel: string;
  recommendation: string;
};

function parseNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalizedValue = value.replace(",", ".");

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getAnalyticsTotals(product: ProductDetail) {
  const views = product.analytics.reduce((sum, item) => sum + item.views, 0);
  const orders = product.analytics.reduce(
    (sum, item) => sum + item.ordersCount,
    0,
  );
  const revenue = product.analytics.reduce(
    (sum, item) => sum + parseNumber(item.revenue),
    0,
  );

  const dates = product.analytics.map((item) => new Date(item.date).getTime());
  const minDate = dates.length > 0 ? Math.min(...dates) : Date.now();
  const maxDate = dates.length > 0 ? Math.max(...dates) : Date.now();

  const daysPeriod = Math.max(
    1,
    Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1,
  );

  const conversionRate = views > 0 ? (orders / views) * 100 : 0;
  const averageDailyOrders = orders / daysPeriod;

  return {
    views,
    orders,
    revenue,
    daysPeriod,
    conversionRate,
    averageDailyOrders,
  };
}

export function buildProductIntelligence(
  product: ProductDetail,
): ProductIntelligence {
  const price = parseNumber(product.price);
  const rating = parseNumber(product.rating);
  const totals = getAnalyticsTotals(product);

  const newReviews = product.reviews.filter((review) => review.status === "NEW");
  const negativeReviews = product.reviews.filter((review) => review.rating <= 3);
  const unansweredReviews = product.reviews.filter(
    (review) => !review.answerText,
  );

  const factors: ProductHealthFactor[] = [];
  let score = 100;

  if (!product.isActive) {
    score -= 12;
    factors.push({
      type: "negative",
      title: "Товар неактивен",
      description: "Карточка выключена и не участвует в продажах.",
    });
  } else {
    factors.push({
      type: "positive",
      title: "Товар активен",
      description: "Карточка доступна для продаж.",
    });
  }

  if (product.stock <= 0) {
    score -= 35;
    factors.push({
      type: "negative",
      title: "Товар закончился",
      description: "При нулевом остатке карточка теряет продажи и позиции.",
    });
  } else if (product.stock <= 3) {
    score -= 28;
    factors.push({
      type: "negative",
      title: "Критический остаток",
      description: `Осталось ${product.stock} шт. Нужно срочно пополнить склад.`,
    });
  } else if (product.stock <= 10) {
    score -= 16;
    factors.push({
      type: "negative",
      title: "Низкий остаток",
      description: `Осталось ${product.stock} шт. Есть риск потерять продажи.`,
    });
  } else {
    factors.push({
      type: "positive",
      title: "Остаток в норме",
      description: `На складе ${product.stock} шт.`,
    });
  }

  if (rating === 0) {
    score -= 8;
    factors.push({
      type: "neutral",
      title: "Нет рейтинга",
      description: "Недостаточно оценок для уверенной диагностики.",
    });
  } else if (rating < 3.5) {
    score -= 22;
    factors.push({
      type: "negative",
      title: "Низкий рейтинг",
      description: `Рейтинг ${rating}. Это может снижать доверие покупателей.`,
    });
  } else if (rating < 4.3) {
    score -= 12;
    factors.push({
      type: "negative",
      title: "Средний рейтинг",
      description: `Рейтинг ${rating}. Карточку стоит улучшить.`,
    });
  } else {
    factors.push({
      type: "positive",
      title: "Хороший рейтинг",
      description: `Рейтинг ${rating}. Это помогает продажам.`,
    });
  }

  if (totals.views === 0) {
    score -= 10;
    factors.push({
      type: "neutral",
      title: "Нет аналитики",
      description: "После синхронизации появятся просмотры, заказы и конверсия.",
    });
  } else if (totals.conversionRate < 1) {
    score -= 20;
    factors.push({
      type: "negative",
      title: "Очень низкая конверсия",
      description: `Конверсия ${totals.conversionRate.toFixed(
        2,
      )}%. Карточка получает трафик, но плохо продаёт.`,
    });
  } else if (totals.conversionRate < 2.5) {
    score -= 10;
    factors.push({
      type: "negative",
      title: "Конверсия ниже целевой",
      description: `Конверсия ${totals.conversionRate.toFixed(
        2,
      )}%. Есть потенциал роста.`,
    });
  } else {
    factors.push({
      type: "positive",
      title: "Конверсия выглядит нормально",
      description: `Конверсия ${totals.conversionRate.toFixed(2)}%.`,
    });
  }

  if (negativeReviews.length > 0) {
    score -= Math.min(18, negativeReviews.length * 6);
    factors.push({
      type: "negative",
      title: "Есть негативные отзывы",
      description: `${negativeReviews.length} отзывов с оценкой 1–3.`,
    });
  }

  if (unansweredReviews.length > 0) {
    score -= Math.min(10, unansweredReviews.length * 3);
    factors.push({
      type: "negative",
      title: "Есть отзывы без ответа",
      description: `${unansweredReviews.length} отзывов ожидают ответа продавца.`,
    });
  }

  const healthScore = clamp(Math.round(score), 0, 100);

  const healthTone: ProductHealthTone =
    healthScore >= 75 ? "success" : healthScore >= 45 ? "warning" : "danger";

  const healthLabel =
    healthScore >= 75
      ? "Карточка в хорошем состоянии"
      : healthScore >= 45
        ? "Карточка требует внимания"
        : "Карточка в зоне риска";

  const mainRisk =
    product.stock <= 10
      ? "Низкий остаток"
      : negativeReviews.length > 0
        ? "Негативные отзывы"
        : totals.conversionRate > 0 && totals.conversionRate < 2.5
          ? "Слабая конверсия"
          : "Критичных рисков нет";

  const recommendedAction =
    product.stock <= 3
      ? "Срочно пополнить склад и проверить, не теряет ли товар позиции."
      : product.stock <= 10
        ? "Запланировать пополнение остатка в ближайшие дни."
        : negativeReviews.length > 0
          ? "Ответить на негативные отзывы и устранить повторяющуюся проблему."
          : totals.conversionRate > 0 && totals.conversionRate < 2.5
            ? "Проверить цену, описание, фото и отзывы — трафик есть, но продаж мало."
            : "Продолжать мониторинг карточки.";

  const daysLeft =
    totals.averageDailyOrders > 0
      ? Math.floor(product.stock / totals.averageDailyOrders)
      : null;

  const recommendedRestock =
    totals.averageDailyOrders > 0
      ? Math.ceil(totals.averageDailyOrders * 21)
      : Math.max(20, product.stock);

  const stockMessage =
    daysLeft === null
      ? "Недостаточно продаж для прогноза окончания остатка."
      : daysLeft <= 3
        ? `Товар может закончиться примерно через ${daysLeft} дн. Это критично.`
        : daysLeft <= 10
          ? `Товар может закончиться примерно через ${daysLeft} дн. Лучше пополнить склад заранее.`
          : `Остатка хватит примерно на ${daysLeft} дн.`;

  const targetConversionRate = 3;
  const conversionGap = Math.max(0, targetConversionRate - totals.conversionRate);
  const lostOrdersByConversion = totals.views * (conversionGap / 100);
  const conversionRisk = lostOrdersByConversion * price;

  const stockRisk =
    daysLeft !== null && daysLeft <= 7
      ? totals.averageDailyOrders * price * Math.max(1, 7 - daysLeft)
      : 0;

  const lostRevenueTotal = conversionRisk + stockRisk;

  const lostRevenueMessage =
    lostRevenueTotal > 0
      ? "Есть потенциально упущенная выручка из-за остатка или слабой конверсии."
      : "Крупной упущенной выручки по текущим данным не видно.";

  const timeline: ProductTimelineEvent[] = [
    ...newReviews.map((review) => ({
      id: `review-${review.id}`,
      date: review.createdAt,
      title:
        review.rating <= 3
          ? "Появился негативный отзыв"
          : "Появился новый отзыв",
      description: `${review.authorName}: ${review.text}`,
      type: "review" as const,
    })),
    ...product.analytics.map((item) => ({
      id: `analytics-${item.id}`,
      date: item.date,
      title: "Обновилась аналитика",
      description: `Просмотры: ${item.views}, заказы: ${item.ordersCount}, выручка: ${item.revenue} ₽.`,
      type: "analytics" as const,
    })),
    ...product.recommendations.map((recommendation) => ({
      id: `recommendation-${recommendation.id}`,
      date: recommendation.createdAt,
      title: "Создана AI-рекомендация",
      description: recommendation.title,
      type: "recommendation" as const,
    })),
  ]
    .sort(
      (firstEvent, secondEvent) =>
        new Date(secondEvent.date).getTime() - new Date(firstEvent.date).getTime(),
    )
    .slice(0, 8);

  if (product.stock <= 10) {
    timeline.unshift({
      id: "stock-risk",
      date: new Date().toISOString(),
      title: "Остаток требует внимания",
      description: `Сейчас на складе ${product.stock} шт.`,
      type: "stock",
    });
  }

  return {
    healthScore,
    healthTone,
    healthLabel,
    mainRisk,
    recommendedAction,
    factors,
    stockPlanner: {
      averageDailyOrders: Number(totals.averageDailyOrders.toFixed(2)),
      daysLeft,
      recommendedRestock,
      message: stockMessage,
    },
    lostRevenue: {
      total: Math.round(lostRevenueTotal),
      stockRisk: Math.round(stockRisk),
      conversionRisk: Math.round(conversionRisk),
      message: lostRevenueMessage,
    },
    timeline,
  };
}

export function simulateProductScenario(
  product: ProductDetail,
  priceChangePercent: number,
  stockChange: number,
): ProductScenario {
  const price = parseNumber(product.price);
  const totals = getAnalyticsTotals(product);

  const projectedPrice = Math.max(1, price * (1 + priceChangePercent / 100));
  const projectedStock = Math.max(0, product.stock + stockChange);

  const pricePenalty =
    priceChangePercent > 0 ? Math.min(1.8, priceChangePercent * 0.06) : 0;

  const priceBoost =
    priceChangePercent < 0 ? Math.min(1.2, Math.abs(priceChangePercent) * 0.04) : 0;

  const stockPenalty = projectedStock <= 3 ? 0.8 : projectedStock <= 10 ? 0.35 : 0;

  const projectedConversion = Math.max(
    0.2,
    totals.conversionRate - pricePenalty + priceBoost - stockPenalty,
  );

  const projectedOrders = totals.views * (projectedConversion / 100);
  const projectedRevenue = projectedOrders * projectedPrice;
  const currentRevenue = totals.revenue;
  const revenueDelta = projectedRevenue - currentRevenue;

  const riskLabel =
    projectedStock <= 3
      ? "Высокий риск: товар может закончиться"
      : priceChangePercent >= 15
        ? "Средний риск: цена может снизить конверсию"
        : revenueDelta >= 0
          ? "Сценарий выглядит перспективно"
          : "Сценарий может ухудшить выручку";

  const recommendation =
    projectedStock <= 3
      ? "Сначала пополни остаток, потом тестируй цену."
      : priceChangePercent > 12
        ? "Повышай цену осторожно. Лучше тестировать шагами по 5–8%."
        : revenueDelta > 0
          ? "Сценарий можно протестировать на коротком периоде."
          : "Этот сценарий лучше не применять без улучшения карточки.";

  return {
    currentRevenue: Math.round(currentRevenue),
    projectedRevenue: Math.round(projectedRevenue),
    revenueDelta: Math.round(revenueDelta),
    projectedPrice: Math.round(projectedPrice),
    projectedStock,
    projectedConversion: Number(projectedConversion.toFixed(2)),
    riskLabel,
    recommendation,
  };
}