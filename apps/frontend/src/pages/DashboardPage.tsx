import { useEffect, useState } from "react";
import {
  getDashboardAnalytics,
  type DashboardAnalyticsFilters,
} from "../api/analyticsApi";
import { PageSection } from "../components/PageSection";
import type { DashboardAnalytics } from "../types/analytics";
import "./DashboardPage.css";

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDateBefore(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return date.toISOString().slice(0, 10);
}

export function DashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [marketplaceId, setMarketplaceId] = useState("");
  const [dateFrom, setDateFrom] = useState(getDateBefore(30));
  const [dateTo, setDateTo] = useState(getTodayIsoDate());
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  function loadDashboard(filters?: DashboardAnalyticsFilters) {
    setIsLoading(true);
    setErrorText("");

    getDashboardAnalytics(filters)
      .then((response) => {
        setAnalytics(response.data);
      })
      .catch(() => {
        setErrorText("Не удалось загрузить аналитику. Проверь backend.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    getDashboardAnalytics({
      dateFrom: getDateBefore(30),
      dateTo: getTodayIsoDate(),
    })
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

  function handleApplyFilters() {
    loadDashboard({
      marketplaceId: marketplaceId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  }

  function handlePeriodPreset(days: number) {
    const nextDateFrom = getDateBefore(days);
    const nextDateTo = getTodayIsoDate();

    setDateFrom(nextDateFrom);
    setDateTo(nextDateTo);

    loadDashboard({
      marketplaceId: marketplaceId || undefined,
      dateFrom: nextDateFrom,
      dateTo: nextDateTo,
    });
  }

  function handleResetFilters() {
    const nextDateFrom = getDateBefore(30);
    const nextDateTo = getTodayIsoDate();

    setMarketplaceId("");
    setDateFrom(nextDateFrom);
    setDateTo(nextDateTo);

    loadDashboard({
      dateFrom: nextDateFrom,
      dateTo: nextDateTo,
    });
  }

  if (isLoading) {
    return <p>Загрузка dashboard...</p>;
  }

  if (errorText || !analytics) {
    return <p className="error-text">{errorText}</p>;
  }

  return (
    <>
      <PageSection
        title="Фильтры аналитики"
        description="Смотри показатели по всем маркетплейсам или отдельно по выбранной площадке."
      >
        <div className="dashboard-filters">
          <label>
            <span>Маркетплейс</span>
            <select
              value={marketplaceId}
              onChange={(event) => setMarketplaceId(event.target.value)}
            >
              <option value="">Все маркетплейсы</option>
              {analytics.marketplaceOptions.map((marketplace) => (
                <option key={marketplace.id} value={marketplace.id}>
                  {marketplace.name} · {marketplace.type}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Дата от</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </label>

          <label>
            <span>Дата до</span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </label>

          <div className="dashboard-filters__actions">
            <button
              className="primary-button"
              onClick={handleApplyFilters}
              type="button"
            >
              Применить
            </button>

            <button
              className="secondary-button"
              onClick={handleResetFilters}
              type="button"
            >
              Сбросить
            </button>
          </div>
        </div>

        <div className="period-presets">
          <button onClick={() => handlePeriodPreset(7)} type="button">
            7 дней
          </button>
          <button onClick={() => handlePeriodPreset(30)} type="button">
            30 дней
          </button>
          <button onClick={() => handlePeriodPreset(90)} type="button">
            90 дней
          </button>
        </div>
      </PageSection>

      <PageSection
        title="Что сделать сегодня"
        description="SellerHUB подсвечивает действия, которые сильнее всего влияют на продажи."
      >
        <div className="action-grid">
          {analytics.actionItems.map((item) => (
            <article
              className={`action-card action-card--${item.priority.toLowerCase()}`}
              key={item.id}
            >
              <div className="action-card__top">
                <span>{item.priority}</span>
                <strong>{item.metric}</strong>
              </div>

              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <small>{item.recommendation}</small>
            </article>
          ))}
        </div>
      </PageSection>

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
        title="Проблемные товары"
        description="Товары, которые требуют внимания: низкий остаток, слабый рейтинг, отзывы без ответа или низкая конверсия."
      >
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Товар</th>
                <th>Маркетплейс</th>
                <th>Остаток</th>
                <th>Рейтинг</th>
                <th>Конверсия</th>
                <th>Проблемы</th>
              </tr>
            </thead>

            <tbody>
              {analytics.problemProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.title}</strong>
                    <br />
                    <span className="muted-text">{product.sku}</span>
                  </td>
                  <td>{product.marketplaceName}</td>
                  <td>{product.stock}</td>
                  <td>{product.rating ?? "—"}</td>
                  <td>{product.conversionRate}%</td>
                  <td>
                    <div className="problem-tags">
                      {product.problems.map((problem) => (
                        <span key={problem}>{problem}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {analytics.problemProducts.length === 0 ? (
            <div className="empty-state">
              <strong>Проблемные товары не найдены</strong>
              <p>По выбранным фильтрам критичных проблем нет.</p>
            </div>
          ) : null}
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