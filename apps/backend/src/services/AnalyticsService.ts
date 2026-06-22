import {
  AnalyticsKpiCardDto,
  AnalyticsProductDto,
  DashboardAnalyticsDto,
  MarketplaceRevenueDto,
  SalesFunnelDto,
  TopProductDto,
} from "../dto/AnalyticsDto";
import { AnalyticsRepository } from "../repositories/AnalyticsRepository";

type LowStockProductFromDatabase = Awaited<
  ReturnType<AnalyticsRepository["findLowStockProducts"]>
>[number];

type TopProductFromDatabase = Awaited<
  ReturnType<AnalyticsRepository["findTopProducts"]>
>[number];

type OrderWithMarketplace = Awaited<
  ReturnType<AnalyticsRepository["findOrdersWithMarketplace"]>
>[number];

export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async getDashboardAnalytics(): Promise<DashboardAnalyticsDto> {
    const [
      ordersAggregate,
      productsAggregate,
      reviewsAggregate,
      productAnalyticsAggregate,
      orderStatusCounts,
      ordersWithMarketplace,
      unansweredReviewsCount,
      lowStockProducts,
      topProducts,
    ] = await Promise.all([
      this.analyticsRepository.getOrdersAggregate(),
      this.analyticsRepository.getProductsAggregate(),
      this.analyticsRepository.getReviewsAggregate(),
      this.analyticsRepository.getProductAnalyticsAggregate(),
      this.analyticsRepository.getOrderStatusCounts(),
      this.analyticsRepository.findOrdersWithMarketplace(),
      this.analyticsRepository.getUnansweredReviewsCount(),
      this.analyticsRepository.findLowStockProducts(),
      this.analyticsRepository.findTopProducts(),
    ]);

    const totalRevenueNumber = Number(
      ordersAggregate._sum.totalPrice?.toString() ?? "0",
    );
    const totalOrders = ordersAggregate._count.id;
    const totalSoldItems = ordersAggregate._sum.quantity ?? 0;
    const totalViews = productAnalyticsAggregate._sum.views ?? 0;
    const analyticsOrdersCount =
      productAnalyticsAggregate._sum.ordersCount ?? 0;

    const deliveredOrders = this.getStatusCount(orderStatusCounts, "DELIVERED");
    const returnedOrders = this.getStatusCount(orderStatusCounts, "RETURNED");
    const cancelledOrders = this.getStatusCount(orderStatusCounts, "CANCELLED");

    const conversionRate =
      totalViews > 0
        ? ((analyticsOrdersCount / totalViews) * 100).toFixed(2)
        : "0.00";

    const averageOrderValue =
      totalOrders > 0 ? (totalRevenueNumber / totalOrders).toFixed(2) : "0.00";

    const returnRate =
      totalOrders > 0 ? ((returnedOrders / totalOrders) * 100).toFixed(2) : "0.00";

    const cancellationRate =
      totalOrders > 0
        ? ((cancelledOrders / totalOrders) * 100).toFixed(2)
        : "0.00";

    const buyoutRate =
      deliveredOrders + returnedOrders > 0
        ? (
            (deliveredOrders / (deliveredOrders + returnedOrders)) *
            100
          ).toFixed(2)
        : "0.00";

    const averageRevenuePerProduct =
      productsAggregate.totalProducts > 0
        ? (totalRevenueNumber / productsAggregate.totalProducts).toFixed(2)
        : "0.00";

    const averageDailySales =
      totalSoldItems > 0 ? totalSoldItems / 30 : 0;

    const stockCoverageDays =
      averageDailySales > 0
        ? (productsAggregate.totalStock / averageDailySales).toFixed(1)
        : "0.0";

    const salesFunnel: SalesFunnelDto = {
      views: totalViews,
      orders: totalOrders,
      deliveredOrders,
      returnedOrders,
      cancelledOrders,
    };

    return {
      summary: {
        totalRevenue: totalRevenueNumber.toFixed(2),
        totalOrders,
        totalSoldItems,
        totalProducts: productsAggregate.totalProducts,
        activeProducts: productsAggregate.activeProducts,
        lowStockProducts: productsAggregate.lowStockProducts,
        averageRating:
          reviewsAggregate._avg.rating !== null
            ? reviewsAggregate._avg.rating.toFixed(2)
            : null,
        totalViews,
        conversionRate,
      },
      kpiCards: this.buildKpiCards({
        totalRevenue: totalRevenueNumber.toFixed(2),
        totalOrders,
        totalSoldItems,
        averageOrderValue,
        conversionRate,
        returnRate,
        cancellationRate,
        buyoutRate,
        averageRevenuePerProduct,
        stockCoverageDays,
        unansweredReviewsCount,
      }),
      marketplaceRevenue:
        this.buildMarketplaceRevenue(ordersWithMarketplace),
      salesFunnel,
      lowStockProducts: lowStockProducts.map((product) =>
        this.mapProductToAnalyticsProduct(product),
      ),
      topProducts: topProducts.map((item) => this.mapTopProduct(item)),
    };
  }

  private buildKpiCards(data: {
    totalRevenue: string;
    totalOrders: number;
    totalSoldItems: number;
    averageOrderValue: string;
    conversionRate: string;
    returnRate: string;
    cancellationRate: string;
    buyoutRate: string;
    averageRevenuePerProduct: string;
    stockCoverageDays: string;
    unansweredReviewsCount: number;
  }): AnalyticsKpiCardDto[] {
    return [
      {
        id: "totalRevenue",
        label: "Выручка",
        value: `${data.totalRevenue} ₽`,
        description: "Сумма всех заказов в выбранном периоде.",
        formula: "Выручка = сумма totalPrice всех заказов",
        interpretation:
          "Главный показатель продаж. Если растёт, бизнес масштабируется.",
      },
      {
        id: "totalOrders",
        label: "Заказы",
        value: String(data.totalOrders),
        description: "Количество заказов по всем подключённым маркетплейсам.",
        formula: "Заказы = количество записей в таблице orders",
        interpretation:
          "Показывает общий спрос. Важно смотреть вместе с выручкой и средним чеком.",
      },
      {
        id: "averageOrderValue",
        label: "Средний чек",
        value: `${data.averageOrderValue} ₽`,
        description: "Средняя сумма одного заказа.",
        formula: "Средний чек = выручка / количество заказов",
        interpretation:
          "Если средний чек низкий, можно тестировать комплекты, апсейлы и повышение цены.",
      },
      {
        id: "conversionRate",
        label: "Конверсия",
        value: `${data.conversionRate}%`,
        description: "Доля заказов относительно просмотров карточек.",
        formula: "Конверсия = ordersCount / views × 100%",
        interpretation:
          "Низкая конверсия может означать слабые фото, цену, описание или отзывы.",
      },
      {
        id: "buyoutRate",
        label: "Процент выкупа",
        value: `${data.buyoutRate}%`,
        description: "Доля доставленных заказов среди доставленных и возвращённых.",
        formula: "Выкуп = доставленные / (доставленные + возвраты) × 100%",
        interpretation:
          "Низкий выкуп может говорить о проблемах с ожиданиями, качеством или карточкой товара.",
      },
      {
        id: "returnRate",
        label: "Доля возвратов",
        value: `${data.returnRate}%`,
        description: "Процент возвращённых заказов.",
        formula: "Возвраты = returned orders / total orders × 100%",
        interpretation:
          "Высокий процент возвратов снижает прибыль и может ухудшать позиции товара.",
      },
      {
        id: "cancellationRate",
        label: "Доля отмен",
        value: `${data.cancellationRate}%`,
        description: "Процент отменённых заказов.",
        formula: "Отмены = cancelled orders / total orders × 100%",
        interpretation:
          "Высокие отмены часто связаны с остатками, сроками доставки или ценой.",
      },
      {
        id: "averageRevenuePerProduct",
        label: "Выручка на товар",
        value: `${data.averageRevenuePerProduct} ₽`,
        description: "Средняя выручка на одну товарную карточку.",
        formula: "Выручка на товар = общая выручка / количество товаров",
        interpretation:
          "Помогает понять, насколько эффективно работает ассортимент.",
      },
      {
        id: "stockCoverageDays",
        label: "Запас в днях",
        value: `${data.stockCoverageDays} дней`,
        description: "Оценка, на сколько дней хватит текущих остатков.",
        formula: "Запас в днях = общий stock / средние продажи в день",
        interpretation:
          "Если показатель низкий, товар может закончиться и потерять позиции.",
      },
      {
        id: "unansweredReviews",
        label: "Отзывы без ответа",
        value: String(data.unansweredReviewsCount),
        description: "Количество новых отзывов, на которые продавец ещё не ответил.",
        formula: "Отзывы без ответа = reviews со статусом NEW",
        interpretation:
          "Быстрые ответы повышают доверие покупателей и качество сервиса.",
      },
    ];
  }

  private buildMarketplaceRevenue(
    orders: OrderWithMarketplace[],
  ): MarketplaceRevenueDto[] {
    const revenueByMarketplace = new Map<
      string,
      MarketplaceRevenueDto
    >();

    for (const order of orders) {
      const current = revenueByMarketplace.get(order.marketplaceId);

      if (!current) {
        revenueByMarketplace.set(order.marketplaceId, {
          marketplaceId: order.marketplaceId,
          marketplaceName: order.marketplace.name,
          marketplaceType: order.marketplace.type,
          revenue: order.totalPrice.toString(),
          ordersCount: 1,
        });

        continue;
      }

      const nextRevenue =
        Number(current.revenue) + Number(order.totalPrice.toString());

      revenueByMarketplace.set(order.marketplaceId, {
        ...current,
        revenue: nextRevenue.toFixed(2),
        ordersCount: current.ordersCount + 1,
      });
    }

    return Array.from(revenueByMarketplace.values()).sort(
      (first, second) => Number(second.revenue) - Number(first.revenue),
    );
  }

  private getStatusCount(
    statusCounts: Array<{ status: string; _count: { id: number } }>,
    status: string,
  ): number {
    return statusCounts.find((item) => item.status === status)?._count.id ?? 0;
  }

  private mapProductToAnalyticsProduct(
    product: LowStockProductFromDatabase,
  ): AnalyticsProductDto {
    return {
      id: product.id,
      title: product.title,
      sku: product.sku,
      marketplaceName: product.marketplace.name,
      marketplaceType: product.marketplace.type,
      price: product.price.toString(),
      stock: product.stock,
      rating: product.rating ? product.rating.toString() : null,
    };
  }

  private mapTopProduct(item: TopProductFromDatabase): TopProductDto {
    return {
      id: item.product.id,
      title: item.product.title,
      sku: item.product.sku,
      marketplaceName: item.product.marketplace.name,
      marketplaceType: item.product.marketplace.type,
      price: item.product.price.toString(),
      stock: item.product.stock,
      rating: item.product.rating ? item.product.rating.toString() : null,
      revenue: item.revenue.toString(),
      ordersCount: item.ordersCount,
      views: item.views,
    };
  }
}