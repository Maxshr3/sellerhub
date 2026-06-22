import {
  MarketplaceConnector,
  NormalizedMarketplaceSyncData,
} from "./MarketplaceConnectorTypes";

export class YandexMarketMockConnector implements MarketplaceConnector {
  source = "YANDEX_MARKET" as const;

  async fetchData(): Promise<NormalizedMarketplaceSyncData> {
    return {
      source: this.source,
      products: [
        {
          sku: "YM-LAMP-PRO-001",
          title: "Яндекс Маркет: умная лампа Pro",
          price: "3490.00",
          stock: 34,
          rating: "4.70",
          isActive: true,
        },
        {
          sku: "YM-CHARGE-STAND-002",
          title: "Яндекс Маркет: зарядная станция Stand",
          price: "4290.00",
          stock: 11,
          rating: "4.40",
          isActive: true,
        },
        {
          sku: "YM-DESK-HUB-003",
          title: "Яндекс Маркет: настольный хаб DeskHub",
          price: "5990.00",
          stock: 6,
          rating: "4.10",
          isActive: true,
        },
      ],
      orders: [
        {
          externalId: "YM-ORDER-1001",
          productSku: "YM-LAMP-PRO-001",
          status: "DELIVERED",
          quantity: 2,
          totalPrice: "6980.00",
          orderedAt: new Date("2026-06-18T10:00:00.000Z"),
        },
        {
          externalId: "YM-ORDER-1002",
          productSku: "YM-CHARGE-STAND-002",
          status: "DELIVERED",
          quantity: 1,
          totalPrice: "4290.00",
          orderedAt: new Date("2026-06-19T12:00:00.000Z"),
        },
        {
          externalId: "YM-ORDER-1003",
          productSku: "YM-DESK-HUB-003",
          status: "RETURNED",
          quantity: 1,
          totalPrice: "5990.00",
          orderedAt: new Date("2026-06-20T16:00:00.000Z"),
        },
      ],
      reviews: [
        {
          productSku: "YM-LAMP-PRO-001",
          authorName: "Покупатель Яндекс Маркета",
          rating: 5,
          text: "Лампа отличная, удобно управлять и яркость хорошая.",
          status: "NEW",
        },
        {
          productSku: "YM-DESK-HUB-003",
          authorName: "Андрей",
          rating: 3,
          text: "Товар хороший, но упаковка приехала мятая.",
          status: "NEW",
        },
      ],
      analytics: [
        {
          productSku: "YM-LAMP-PRO-001",
          date: new Date("2026-06-20T00:00:00.000Z"),
          views: 940,
          ordersCount: 2,
          revenue: "6980.00",
          conversionRate: "0.21",
        },
        {
          productSku: "YM-CHARGE-STAND-002",
          date: new Date("2026-06-20T00:00:00.000Z"),
          views: 520,
          ordersCount: 1,
          revenue: "4290.00",
          conversionRate: "0.19",
        },
        {
          productSku: "YM-DESK-HUB-003",
          date: new Date("2026-06-20T00:00:00.000Z"),
          views: 610,
          ordersCount: 1,
          revenue: "5990.00",
          conversionRate: "0.16",
        },
      ],
      recommendations: [
        {
          productSku: "YM-DESK-HUB-003",
          type: "STOCK",
          title: "Пополнить остатки на Яндекс Маркете",
          content:
            "Остаток товара YM-DESK-HUB-003 ниже 10 единиц. Рекомендуется пополнить склад, чтобы не потерять продажи.",
        },
        {
          productSku: "YM-DESK-HUB-003",
          type: "REVIEW_REPLY",
          title: "Ответить на негативный отзыв",
          content:
            "Есть отзыв с оценкой 3. Нужно ответить покупателю и показать, что продавец контролирует качество упаковки.",
        },
      ],
    };
  }
}