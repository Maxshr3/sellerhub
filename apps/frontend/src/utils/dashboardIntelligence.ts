type Priority = "HIGH" | "MEDIUM" | "LOW";

type ProblemProduct = {
  id: string;
  title: string;
  marketplaceName: string;
  sku: string;
  stock: number;
  rating: string | number | null;
  views: number;
  ordersCount: number;
  conversionRate: string | number;
  problems: string[];
};

type TopProduct = {
  id: string;
  title: string;
  sku: string;
  marketplaceName: string;
  marketplaceType: string;
  revenue: string | number;
  ordersCount: number;
  views: number;
  stock: number;
  rating: string | number | null;
};

type LowStockProduct = {
  id: string;
  title: string;
  marketplaceName: string;
  sku: string;
  stock: number;
};

type ActionItem = {
  id: string;
  priority: Priority;
  title: string;
  description: string;
  metric: string;
  recommendation: string;
};

type MarketplaceRevenue = {
  marketplaceId: string;
  marketplaceName: string;
  marketplaceType: string;
  revenue: string | number;
  ordersCount: number;
};

type DashboardLike = {
  problemProducts: ProblemProduct[];
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];
  actionItems: ActionItem[];
  marketplaceRevenue: MarketplaceRevenue[];
  salesFunnel: {
    views: number;
    orders: number;
    deliveredOrders: number;
    returnedOrders: number;
    cancelledOrders: number;
  };
};

export type DashboardHealthProduct = {
  id: string;
  title: string;
  marketplaceName: string;
  sku: string;
  healthScore: number;
  healthLabel: string;
  healthTone: "success" | "warning" | "danger";
  lostRevenue: number;
  mainProblem: string;
  recommendation: string;
};

export type DashboardInsight = {
  id: string;
  title: string;
  description: string;
  tone: "success" | "warning" | "danger" | "info";
};

export type DashboardIntelligence = {
  averageHealthScore: number;
  averageHealthTone: "success" | "warning" | "danger";
  totalLostRevenue: number;
  highRiskProductsCount: number;
  mediumRiskProductsCount: number;
  lowStockProductsCount: number;
  urgentActionsCount: number;
  bestMarketplaceName: string;
  healthProducts: DashboardHealthProduct[];
  insights: DashboardInsight[];
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getToneByScore(score: number): "success" | "warning" | "danger" {
  if (score >= 75) {
    return "success";
  }

  if (score >= 45) {
    return "warning";
  }

  return "danger";
}

function getLabelByScore(score: number) {
  if (score >= 75) {
    return "Хорошо";
  }

  if (score >= 45) {
    return "Требует внимания";
  }

  return "Зона риска";
}

function calculateHealthScore(product: {
  stock: number;
  rating: string | number | null;
  views: number;
  ordersCount: number;
  conversionRate?: string | number;
  problems?: string[];
}) {
  const rating = parseNumber(product.rating);
  const conversionRate =
    product.conversionRate !== undefined
      ? parseNumber(product.conversionRate)
      : product.views > 0
        ? (product.ordersCount / product.views) * 100
        : 0;

  let score = 100;

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

  if (product.views === 0) {
    score -= 8;
  } else if (conversionRate < 1) {
    score -= 20;
  } else if (conversionRate < 2.5) {
    score -= 10;
  }

  score -= Math.min(20, (product.problems?.length ?? 0) * 6);

  return clamp(Math.round(score), 0, 100);
}

function calculateLostRevenue(product: {
  stock: number;
  views: number;
  ordersCount: number;
  revenue?: string | number;
  conversionRate?: string | number;
}) {
  const revenue = parseNumber(product.revenue);
  const averageOrderValue =
    product.ordersCount > 0 && revenue > 0 ? revenue / product.ordersCount : 1500;

  const conversionRate =
    product.conversionRate !== undefined
      ? parseNumber(product.conversionRate)
      : product.views > 0
        ? (product.ordersCount / product.views) * 100
        : 0;

  const targetConversionRate = 3;
  const conversionGap = Math.max(0, targetConversionRate - conversionRate);
  const conversionRisk = product.views * (conversionGap / 100) * averageOrderValue;

  const stockRisk =
    product.stock <= 0
      ? averageOrderValue * 10
      : product.stock <= 3
        ? averageOrderValue * 7
        : product.stock <= 10
          ? averageOrderValue * 3
          : 0;

  return Math.round(conversionRisk + stockRisk);
}

function getMainProblem(product: {
  stock: number;
  rating: string | number | null;
  conversionRate?: string | number;
  problems?: string[];
}) {
  const rating = parseNumber(product.rating);
  const conversionRate = parseNumber(product.conversionRate);

  if (product.stock <= 3) {
    return "Критический остаток";
  }

  if (product.stock <= 10) {
    return "Низкий остаток";
  }

  if (rating > 0 && rating < 4) {
    return "Слабый рейтинг";
  }

  if (conversionRate > 0 && conversionRate < 2.5) {
    return "Низкая конверсия";
  }

  if ((product.problems?.length ?? 0) > 0) {
    return product.problems?.[0] ?? "Есть проблемы";
  }

  return "Требует контроля";
}

function getRecommendation(problem: string) {
  if (problem === "Критический остаток") {
    return "Срочно пополнить склад, чтобы не потерять продажи.";
  }

  if (problem === "Низкий остаток") {
    return "Запланировать пополнение товара на ближайшие дни.";
  }

  if (problem === "Слабый рейтинг") {
    return "Проверить негативные отзывы и устранить повторяющуюся причину.";
  }

  if (problem === "Низкая конверсия") {
    return "Проверить цену, фото, описание и соответствие ожиданиям покупателя.";
  }

  return "Открыть карточку товара и проверить диагностику.";
}

export function buildDashboardIntelligence(
  dashboard: DashboardLike,
): DashboardIntelligence {
  const topProductsById = new Map(
    dashboard.topProducts.map((product) => [product.id, product]),
  );

  const healthProductsFromProblems = dashboard.problemProducts.map((product) => {
    const topProduct = topProductsById.get(product.id);
    const healthScore = calculateHealthScore(product);
    const mainProblem = getMainProblem(product);
    const lostRevenue = calculateLostRevenue({
      ...product,
      revenue: topProduct?.revenue,
    });

    return {
      id: product.id,
      title: product.title,
      marketplaceName: product.marketplaceName,
      sku: product.sku,
      healthScore,
      healthLabel: getLabelByScore(healthScore),
      healthTone: getToneByScore(healthScore),
      lostRevenue,
      mainProblem,
      recommendation: getRecommendation(mainProblem),
    };
  });

  const fallbackHealthProducts = dashboard.topProducts
    .slice(0, 6)
    .map((product) => {
      const healthScore = calculateHealthScore(product);
      const mainProblem = getMainProblem(product);
      const lostRevenue = calculateLostRevenue(product);

      return {
        id: product.id,
        title: product.title,
        marketplaceName: product.marketplaceName,
        sku: product.sku,
        healthScore,
        healthLabel: getLabelByScore(healthScore),
        healthTone: getToneByScore(healthScore),
        lostRevenue,
        mainProblem,
        recommendation: getRecommendation(mainProblem),
      };
    });

  const healthProducts =
    healthProductsFromProblems.length > 0
      ? healthProductsFromProblems
      : fallbackHealthProducts;

  const sortedHealthProducts = [...healthProducts].sort(
    (firstProduct, secondProduct) =>
      firstProduct.healthScore - secondProduct.healthScore,
  );

  const averageHealthScore =
    sortedHealthProducts.length > 0
      ? Math.round(
          sortedHealthProducts.reduce(
            (sum, product) => sum + product.healthScore,
            0,
          ) / sortedHealthProducts.length,
        )
      : 100;

  const totalLostRevenue = sortedHealthProducts.reduce(
    (sum, product) => sum + product.lostRevenue,
    0,
  );

  const highRiskProductsCount = sortedHealthProducts.filter(
    (product) => product.healthScore < 45,
  ).length;

  const mediumRiskProductsCount = sortedHealthProducts.filter(
    (product) => product.healthScore >= 45 && product.healthScore < 75,
  ).length;

  const urgentActionsCount = dashboard.actionItems.filter(
    (item) => item.priority === "HIGH",
  ).length;

  const bestMarketplace = [...dashboard.marketplaceRevenue].sort(
    (firstMarketplace, secondMarketplace) =>
      parseNumber(secondMarketplace.revenue) - parseNumber(firstMarketplace.revenue),
  )[0];

  const bestMarketplaceName = bestMarketplace?.marketplaceName ?? "нет данных";

  const insights: DashboardInsight[] = [];

  if (highRiskProductsCount > 0) {
    insights.push({
      id: "high-risk-products",
      title: "Есть товары в зоне риска",
      description: `${highRiskProductsCount} товаров имеют Health Score ниже 45. Их лучше проверить в первую очередь.`,
      tone: "danger",
    });
  } else {
    insights.push({
      id: "no-critical-products",
      title: "Критичных товаров нет",
      description: "По текущим данным нет товаров с крайне низким Health Score.",
      tone: "success",
    });
  }

  if (dashboard.lowStockProducts.length > 0) {
    insights.push({
      id: "low-stock",
      title: "Нужно проверить остатки",
      description: `${dashboard.lowStockProducts.length} товаров могут скоро закончиться.`,
      tone: "warning",
    });
  }

  if (totalLostRevenue > 0) {
    insights.push({
      id: "lost-revenue",
      title: "Есть потенциально упущенная выручка",
      description: `Оценка риска: около ${totalLostRevenue} ₽ из-за остатков, рейтинга или слабой конверсии.`,
      tone: "warning",
    });
  }

  if (urgentActionsCount > 0) {
    insights.push({
      id: "urgent-actions",
      title: "Есть срочные действия",
      description: `${urgentActionsCount} рекомендаций имеют высокий приоритет.`,
      tone: "danger",
    });
  }

  if (bestMarketplace) {
    insights.push({
      id: "best-marketplace",
      title: "Главный источник выручки",
      description: `${bestMarketplace.marketplaceName} сейчас приносит больше всего выручки.`,
      tone: "info",
    });
  }

  return {
    averageHealthScore,
    averageHealthTone: getToneByScore(averageHealthScore),
    totalLostRevenue,
    highRiskProductsCount,
    mediumRiskProductsCount,
    lowStockProductsCount: dashboard.lowStockProducts.length,
    urgentActionsCount,
    bestMarketplaceName,
    healthProducts: sortedHealthProducts.slice(0, 6),
    insights,
  };
}