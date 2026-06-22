import {
  MarketplaceConnector,
  NormalizedMarketplaceSyncData,
} from "./MarketplaceConnectorTypes";

export class WildberriesMockConnector implements MarketplaceConnector {
  source = "WILDBERRIES" as const;

  async fetchData(): Promise<NormalizedMarketplaceSyncData> {
    return {
      source: this.source,
      products: [
        {
          sku: "WB-ORG-RGB-101",
          title: "Wildberries: органайзер RGB",
          price: "2790.00",
          stock: 51,
          rating: "4.80",
          isActive: true,
        },
        {
          sku: "WB-CABLE-SET-102",
          title: "Wildberries: набор кабелей USB-C",
          price: "990.00",
          stock: 120,
          rating: "4.60",
          isActive: true,
        },
        {
          sku: "WB-MINI-LIGHT-103",
          title: "Wildberries: мини-светильник для стола",
          price: "1890.00",
          stock: 9,
          rating: "4.20",
          isActive: true,
        },
      ],
      orders: [
        {
          externalId: "WB-ORDER-2001",
          productSku: "WB-ORG-RGB-101",
          status: "DELIVERED",
          quantity: 3,
          totalPrice: "8370.00",
          orderedAt: new Date("2026-06-17T09:30:00.000Z"),
        },
        {
          externalId: "WB-ORDER-2002",
          productSku: "WB-CABLE-SET-102",
          status: "DELIVERED",
          quantity: 5,
          totalPrice: "4950.00",
          orderedAt: new Date("2026-06-18T14:20:00.000Z"),
        },
        {
          externalId: "WB-ORDER-2003",
          productSku: "WB-MINI-LIGHT-103",
          status: "CANCELLED",
          quantity: 1,
          totalPrice: "1890.00",
          orderedAt: new Date("2026-06-19T18:10:00.000Z"),
        },
      ],
      reviews: [
        {
          productSku: "WB-ORG-RGB-101",
          authorName: "Клиент WB",
          rating: 5,
          text: "Выглядит дорого, подсветка красивая.",
          status: "ANSWERED",
          answerText: "Спасибо за покупку и отзыв!",
        },
        {
          productSku: "WB-MINI-LIGHT-103",
          authorName: "Мария",
          rating: 4,
          text: "Светильник хороший, но хотелось бы длиннее провод.",
          status: "NEW",
        },
      ],
      analytics: [
        {
          productSku: "WB-ORG-RGB-101",
          date: new Date("2026-06-20T00:00:00.000Z"),
          views: 1850,
          ordersCount: 3,
          revenue: "8370.00",
          conversionRate: "0.16",
        },
        {
          productSku: "WB-CABLE-SET-102",
          date: new Date("2026-06-20T00:00:00.000Z"),
          views: 2400,
          ordersCount: 5,
          revenue: "4950.00",
          conversionRate: "0.21",
        },
        {
          productSku: "WB-MINI-LIGHT-103",
          date: new Date("2026-06-20T00:00:00.000Z"),
          views: 730,
          ordersCount: 1,
          revenue: "1890.00",
          conversionRate: "0.14",
        },
      ],
      recommendations: [
        {
          productSku: "WB-CABLE-SET-102",
          type: "PRICE",
          title: "Проверить цену на ходовой товар",
          content:
            "У товара высокий спрос и стабильные продажи. Можно протестировать повышение цены на 3–5%.",
        },
        {
          productSku: "WB-MINI-LIGHT-103",
          type: "STOCK",
          title: "Низкий остаток на Wildberries",
          content:
            "Остаток ниже 10 единиц. Есть риск потерять карточку в выдаче из-за отсутствия товара.",
        },
      ],
    };
  }
}