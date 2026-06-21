import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  AIRecommendationType,
  MarketplaceType,
  OrderStatus,
  PrismaClient,
  ReviewStatus,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Start seeding SellerHUB database...");

  await prisma.aIRecommendation.deleteMany();
  await prisma.aIAssistantLog.deleteMany();
  await prisma.productAnalytics.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.marketplace.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: "demo@sellerhub.ru",
      passwordHash: "demo_password_hash",
      name: "Demo Seller",
    },
  });

  const marketplace = await prisma.marketplace.create({
    data: {
      name: "Demo Ozon Store",
      type: MarketplaceType.OZON,
      apiKey: "mock-api-key",
      userId: user.id,
    },
  });

  const deskLamp = await prisma.product.create({
    data: {
      marketplaceId: marketplace.id,
      title: "Умная настольная лампа RGB",
      sku: "LAMP-RGB-001",
      price: "2490.00",
      stock: 42,
      rating: "4.70",
      isActive: true,
    },
  });

  const chargingStation = await prisma.product.create({
    data: {
      marketplaceId: marketplace.id,
      title: "Беспроводная зарядная станция 3-в-1",
      sku: "CHARGE-3IN1-002",
      price: "3990.00",
      stock: 18,
      rating: "4.50",
      isActive: true,
    },
  });

  const deskOrganizer = await prisma.product.create({
    data: {
      marketplaceId: marketplace.id,
      title: "Органайзер для рабочего стола с подсветкой",
      sku: "DESK-ORG-003",
      price: "3190.00",
      stock: 8,
      rating: "4.20",
      isActive: true,
    },
  });

  await prisma.order.createMany({
    data: [
      {
        marketplaceId: marketplace.id,
        productId: deskLamp.id,
        externalId: "OZON-ORDER-1001",
        status: OrderStatus.DELIVERED,
        quantity: 2,
        totalPrice: "4980.00",
        orderedAt: new Date("2026-06-10T10:30:00.000Z"),
      },
      {
        marketplaceId: marketplace.id,
        productId: chargingStation.id,
        externalId: "OZON-ORDER-1002",
        status: OrderStatus.PAID,
        quantity: 1,
        totalPrice: "3990.00",
        orderedAt: new Date("2026-06-12T13:15:00.000Z"),
      },
      {
        marketplaceId: marketplace.id,
        productId: deskOrganizer.id,
        externalId: "OZON-ORDER-1003",
        status: OrderStatus.SHIPPED,
        quantity: 3,
        totalPrice: "9570.00",
        orderedAt: new Date("2026-06-14T16:45:00.000Z"),
      },
      {
        marketplaceId: marketplace.id,
        productId: deskLamp.id,
        externalId: "OZON-ORDER-1004",
        status: OrderStatus.NEW,
        quantity: 1,
        totalPrice: "2490.00",
        orderedAt: new Date("2026-06-16T09:10:00.000Z"),
      },
    ],
  });

  await prisma.review.createMany({
    data: [
      {
        productId: deskLamp.id,
        authorName: "Алексей",
        rating: 5,
        text: "Лампа выглядит стильно, подсветка яркая, для рабочего стола отлично.",
        status: ReviewStatus.ANSWERED,
        answerText: "Спасибо за отзыв! Рады, что лампа вам понравилась.",
      },
      {
        productId: chargingStation.id,
        authorName: "Марина",
        rating: 4,
        text: "Заряжает хорошо, но хотелось бы кабель подлиннее.",
        status: ReviewStatus.NEW,
      },
      {
        productId: deskOrganizer.id,
        authorName: "Илья",
        rating: 4,
        text: "Хороший органайзер, удобно хранить мелочи на столе.",
        status: ReviewStatus.NEW,
      },
    ],
  });

  await prisma.productAnalytics.createMany({
    data: [
      {
        productId: deskLamp.id,
        date: new Date("2026-06-16T00:00:00.000Z"),
        views: 1240,
        ordersCount: 3,
        revenue: "7470.00",
        conversionRate: "0.24",
      },
      {
        productId: chargingStation.id,
        date: new Date("2026-06-16T00:00:00.000Z"),
        views: 860,
        ordersCount: 1,
        revenue: "3990.00",
        conversionRate: "0.12",
      },
      {
        productId: deskOrganizer.id,
        date: new Date("2026-06-16T00:00:00.000Z"),
        views: 640,
        ordersCount: 3,
        revenue: "9570.00",
        conversionRate: "0.47",
      },
    ],
  });

  await prisma.aIRecommendation.createMany({
    data: [
      {
        productId: deskLamp.id,
        type: AIRecommendationType.SEO,
        title: "Улучшить SEO-название товара",
        content:
          "Добавьте в название ключевые слова: настольная лампа, RGB, рабочий стол, USB.",
        isApplied: false,
      },
      {
        productId: chargingStation.id,
        type: AIRecommendationType.PRICE,
        title: "Проверить цену",
        content:
          "Цена товара выше средней. Можно протестировать скидку 5–7% для роста конверсии.",
        isApplied: false,
      },
      {
        productId: deskOrganizer.id,
        type: AIRecommendationType.STOCK,
        title: "Пополнить остатки",
        content:
          "На складе осталось меньше 10 единиц. Рекомендуется пополнить товар.",
        isApplied: false,
      },
    ],
  });

  await prisma.aIAssistantLog.createMany({
    data: [
      {
        userId: user.id,
        prompt: "Какие товары требуют внимания?",
        response:
          "Органайзер требует пополнения остатков. Зарядная станция требует проверки цены.",
      },
      {
        userId: user.id,
        prompt: "Как улучшить карточку лампы?",
        response:
          "Добавьте SEO-ключи в название и сделайте акцент на RGB-подсветке.",
      },
    ],
  });

  console.log("SellerHUB seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });