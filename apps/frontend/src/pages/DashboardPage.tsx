import { useEffect, useState } from "react";
import { getDashboardAnalytics } from "../api/analyticsApi";
import { PageSection } from "../components/PageSection";
import { StatCard } from "../components/StatCard";
import type { DashboardAnalytics } from "../types/analytics";
import "./DashboardPage.css";

export function DashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    getDashboardAnalytics()
      .then((response) => {
        setAnalytics(response.data);
      })
      .catch(() => {
        setErrorText("Не удалось загрузить аналитику. Проверь backend.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <p>Загрузка dashboard...</p>;
  }

  if (errorText || !analytics) {
    return <p className="error-text">{errorText}</p>;
  }

  return (
    <>
      <PageSection
        title="Общая аналитика"
        description="Ключевые показатели магазина по demo-данным."
      >
        <div className="stats-grid">
          <StatCard
            label="Выручка"
            value={`${analytics.summary.totalRevenue} ₽`}
            hint="По заказам"
          />
          <StatCard label="Заказы" value={analytics.summary.totalOrders} />
          <StatCard
            label="Продано единиц"
            value={analytics.summary.totalSoldItems}
          />
          <StatCard
            label="Товары"
            value={analytics.summary.totalProducts}
            hint={`${analytics.summary.activeProducts} активных`}
          />
          <StatCard
            label="Средний рейтинг"
            value={analytics.summary.averageRating ?? "—"}
          />
          <StatCard
            label="Конверсия"
            value={`${analytics.summary.conversionRate}%`}
          />
        </div>
      </PageSection>

      <PageSection
        title="Товары с низким остатком"
        description="Эти товары нужно пополнить в первую очередь."
      >
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Товар</th>
                <th>SKU</th>
                <th>Остаток</th>
                <th>Маркетплейс</th>
              </tr>
            </thead>
            <tbody>
              {analytics.lowStockProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.title}</td>
                  <td>{product.sku}</td>
                  <td>{product.stock}</td>
                  <td>{product.marketplaceName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageSection>

      <PageSection title="Топ товаров по выручке">
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Товар</th>
                <th>Выручка</th>
                <th>Заказы</th>
                <th>Просмотры</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.title}</td>
                  <td>{product.revenue} ₽</td>
                  <td>{product.ordersCount}</td>
                  <td>{product.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageSection>
    </>
  );
}