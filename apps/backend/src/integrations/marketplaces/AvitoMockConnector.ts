import {
  MarketplaceConnector,
  NormalizedMarketplaceSyncData,
} from "./MarketplaceConnectorTypes";

export class AvitoMockConnector implements MarketplaceConnector {
  source = "AVITO" as const;

  async fetchData(): Promise<NormalizedMarketplaceSyncData> {
    return {
      source: this.source,
      products: [
        {
          sku: "AVITO-SMART-STAND-301",
          title: "Avito: умная подставка для рабочего стола",
          price: "4990.00",
          stock: 14,
          rating: "4.50",
          isActive: true,
        },
        {
          sku: "AVITO-LED-PANEL-302",
          title: "Avito: LED-панель для контента",
          price: "6990.00",
          stock: 5,
          rating: "4.00",
          isActive: true,
        },
      ],
      orders: [
        {
          externalId: "AVITO-ORDER-3001",
          productSku: "AVITO-SMART-STAND-301",
          status: "DELIVERED",
          quantity: 1,
          totalPrice: "4990.00",
          orderedAt: new Date("2026-06-18T11:15:00.000Z"),
        },
        {
          externalId: "AVITO-ORDER-3002",
          productSku: "AVITO-LED-PANEL-302",
          status: "PAID",
          quantity: 1,
          totalPrice: "6990.00",
          orderedAt: new Date("2026-06-20T15:45:00.000Z"),
        },
      ],
      reviews: [
        {
          productSku: "AVITO-SMART-STAND-301",
          authorName: "Покупатель Avito",
          rating: 5,
          text: "Быстро отправили, товар соответствует описанию.",
          status: "NEW",
        },
      ],
      analytics: [
        {
          productSku: "AVITO-SMART-STAND-301",
          date: new Date("2026-06-20T00:00:00.000Z"),
          views: 410,
          ordersCount: 1,
          revenue: "4990.00",
          conversionRate: "0.24",
        },
        {
          productSku: "AVITO-LED-PANEL-302",
          date: new Date("2026-06-20T00:00:00.000Z"),
          views: 390,
          ordersCount: 1,
          revenue: "6990.00",
          conversionRate: "0.26",
        },
      ],
      recommendations: [
        {
          productSku: "AVITO-LED-PANEL-302",
          type: "SEO",
          title: "Усилить описание объявления Avito",
          content:
            "Добавьте больше ключевых слов в заголовок и описание: LED, свет для видео, контент, рабочее место.",
        },
        {
          productSku: "AVITO-LED-PANEL-302",
          type: "STOCK",
          title: "Низкий остаток Avito-товара",
          content:
            "Осталось 5 единиц. Если спрос сохранится, товар закончится быстрее, чем через неделю.",
        },
      ],
    };
  }
}