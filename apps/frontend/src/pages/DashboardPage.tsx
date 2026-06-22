import { useEffect, useState } from "react";
import { getDashboardAnalytics } from "../api/analyticsApi";
import { PageSection } from "../components/PageSection";
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
        title="Продажные KPI"
        description="Основные показатели, которые помогают селлеру понимать продажи, эффективность карточек и проблемы в ассортименте."
      >
        <div className="kpi-grid">
          {analytics.kpiCards.map((kpi) => (
            <article className="kpi-card" key={kpi.id}>
              <div className="kpi-card__top">
                <p>{kpi.label}</p>
                <span title={`${kpi.formula}. ${kpi.interpretation}`}>?</span>
              </div>

              <strong>{kpi.value}</strong>
              <small>{kpi.description}</small>

              <details>
                <summary>Как считается</summary>
                <p>
                  <b>Формула:</b> {kpi.formula}
                </p>
                <p>
                  <b>Как понимать:</b> {kpi.interpretation}
                </p>
              </details>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection
        title="Воронка продаж"
        description="Показывает путь от просмотров до заказов, доставок, возвратов и отмен."
      >
        <div className="funnel-grid">
          <div className="funnel-item">
            <span>Просмотры</span>
            <strong>{analytics.salesFunnel.views}</strong>
          </div>
          <div className="funnel-item">
            <span>Заказы</span>
            <strong>{analytics.salesFunnel.orders}</strong>
          </div>
          <div className="funnel-item">
            <span>Доставлено</span>
            <strong>{analytics.salesFunnel.deliveredOrders}</strong>
          </div>
          <div className="funnel-item">
            <span>Возвраты</span>
            <strong>{analytics.salesFunnel.returnedOrders}</strong>
          </div>
          <div className="funnel-item">
            <span>Отмены</span>
            <strong>{analytics.salesFunnel.cancelledOrders}</strong>
          </div>
        </div>
      </PageSection>

      <PageSection
        title="Выручка по маркетплейсам"
        description="Показывает, какие площадки дают больше всего денег."
      >
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Маркетплейс</th>
                <th>Тип</th>
                <th>Выручка</th>
                <th>Заказы</th>
              </tr>
            </thead>
            <tbody>
              {analytics.marketplaceRevenue.map((marketplace) => (
                <tr key={marketplace.marketplaceId}>
                  <td>{marketplace.marketplaceName}</td>
                  <td>{marketplace.marketplaceType}</td>
                  <td>{marketplace.revenue} ₽</td>
                  <td>{marketplace.ordersCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
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