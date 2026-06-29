import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getDashboardAnalytics } from "../api/analyticsApi";
import { AlertMessage } from "../components/AlertMessage";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PageSection } from "../components/PageSection";
import { StatusBadge } from "../components/StatusBadge";
import "./DashboardPage.css";

type DashboardData = Awaited<ReturnType<typeof getDashboardAnalytics>>["data"];

type DashboardPageProps = {
  onOpenProduct: (productId: string) => void;
};

const priorityLabels = {
  HIGH: "Высокий",
  MEDIUM: "Средний",
  LOW: "Низкий",
};

function getPriorityTone(priority: "HIGH" | "MEDIUM" | "LOW") {
  if (priority === "HIGH") {
    return "danger";
  }

  if (priority === "MEDIUM") {
    return "warning";
  }

  return "neutral";
}

export function DashboardPage({ onOpenProduct }: DashboardPageProps) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [marketplaceId, setMarketplaceId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  function loadDashboard(filters?: {
    marketplaceId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    setIsLoading(true);
    setErrorText("");

    getDashboardAnalytics(filters)
      .then((response) => {
        setDashboard(response.data);
      })
      .catch(() => {
        setErrorText("Не удалось загрузить аналитику. Проверь backend.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    getDashboardAnalytics()
      .then((response) => {
        setDashboard(response.data);
      })
      .catch(() => {
        setErrorText("Не удалось загрузить аналитику. Проверь backend.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function handleFiltersSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    loadDashboard({
      marketplaceId: marketplaceId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  }

  function handleResetFilters() {
    setMarketplaceId("");
    setDateFrom("");
    setDateTo("");
    loadDashboard();
  }

  return (
    <>
      <div className="dashboard-sticky-toolbar">
        <PageSection
          title="Dashboard"
          description="Главная аналитика по продажам, остаткам, отзывам и проблемным товарам."
        >
          <form className="dashboard-filters" onSubmit={handleFiltersSubmit}>
            <label>
              <span>Маркетплейс</span>
              <select
                value={marketplaceId}
                onChange={(event) => setMarketplaceId(event.target.value)}
              >
                <option value="">Все маркетплейсы</option>

                {dashboard?.marketplaceOptions.map((marketplace) => (
                  <option key={marketplace.id} value={marketplace.id}>
                    {marketplace.name} · {marketplace.type}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Дата от</span>
              <input
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                type="date"
              />
            </label>

            <label>
              <span>Дата до</span>
              <input
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                type="date"
              />
            </label>

            <div className="dashboard-filter-actions">
              <button className="primary-button" type="submit">
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
          </form>
        </PageSection>
      </div>

      {errorText ? (
        <PageSection title="Ошибка загрузки">
          <AlertMessage type="error">{errorText}</AlertMessage>
        </PageSection>
      ) : null}

      {isLoading ? (
        <PageSection title="Загрузка аналитики">
          <LoadingState title="Загружаем показатели Dashboard..." rows={6} />
        </PageSection>
      ) : null}

      {!isLoading && dashboard ? (
        <>
          <PageSection
            title="Ключевые показатели"
            description="Основные метрики селлера. Подсказки объясняют, как считается каждый показатель."
          >
            <div className="dashboard-kpi-grid">
              {dashboard.kpiCards.map((card) => (
                <article className="dashboard-kpi-card" key={card.id}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <p>{card.description}</p>

                  <details>
                    <summary>Как считается</summary>
                    <small>{card.formula}</small>
                    <small>{card.interpretation}</small>
                  </details>
                </article>
              ))}
            </div>
          </PageSection>

          <section className="dashboard-grid-two">
            <PageSection
              title="Что требует внимания"
              description="Автоматические подсказки по проблемам и возможностям."
            >
              {dashboard.actionItems.length > 0 ? (
                <div className="dashboard-action-list">
                  {dashboard.actionItems.map((item) => (
                    <article className="dashboard-action-card" key={item.id}>
                      <div>
                        <StatusBadge tone={getPriorityTone(item.priority)}>
                          {priorityLabels[item.priority]}
                        </StatusBadge>
                        <h3>{item.title}</h3>
                      </div>

                      <p>{item.description}</p>

                      <footer>
                        <span>{item.metric}</span>
                        <strong>{item.recommendation}</strong>
                      </footer>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Критичных действий нет"
                  description="Сейчас SellerHUB не видит срочных проблем в данных."
                />
              )}
            </PageSection>

            <PageSection
              title="Воронка продаж"
              description="Путь от просмотров до заказов и проблемных статусов."
            >
              <div className="sales-funnel">
                <article>
                  <span>Просмотры</span>
                  <strong>{dashboard.salesFunnel.views}</strong>
                </article>

                <article>
                  <span>Заказы</span>
                  <strong>{dashboard.salesFunnel.orders}</strong>
                </article>

                <article>
                  <span>Доставлено</span>
                  <strong>{dashboard.salesFunnel.deliveredOrders}</strong>
                </article>

                <article>
                  <span>Возвраты</span>
                  <strong>{dashboard.salesFunnel.returnedOrders}</strong>
                </article>

                <article>
                  <span>Отмены</span>
                  <strong>{dashboard.salesFunnel.cancelledOrders}</strong>
                </article>
              </div>
            </PageSection>
          </section>

          <section className="dashboard-grid-two">
            <PageSection
              title="Выручка по маркетплейсам"
              description="Где сейчас основная выручка и количество заказов."
            >
              {dashboard.marketplaceRevenue.length > 0 ? (
                <div className="marketplace-revenue-list">
                  {dashboard.marketplaceRevenue.map((marketplace) => (
                    <article
                      className="marketplace-revenue-card"
                      key={marketplace.marketplaceId}
                    >
                      <div>
                        <h3>{marketplace.marketplaceName}</h3>
                        <span>{marketplace.marketplaceType}</span>
                      </div>

                      <strong>{marketplace.revenue} ₽</strong>
                      <p>{marketplace.ordersCount} заказов</p>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Выручки пока нет"
                  description="Подключи маркетплейс и запусти синхронизацию, чтобы увидеть выручку."
                />
              )}
            </PageSection>

            <PageSection
              title="Товары с низким остатком"
              description="Товары, которые могут скоро закончиться."
            >
              {dashboard.lowStockProducts.length > 0 ? (
                <div className="compact-product-list">
                  {dashboard.lowStockProducts.map((product) => (
                    <article className="compact-product-card" key={product.id}>
  <div>
    <h3>{product.title}</h3>
    <span>
      {product.marketplaceName} · {product.sku}
    </span>
  </div>

  <div className="dashboard-card-actions">
    <StatusBadge
      tone={product.stock <= 3 ? "danger" : "warning"}
    >
      {`${product.stock} шт.`}
    </StatusBadge>

    <button
      className="secondary-button"
      onClick={() => onOpenProduct(product.id)}
      type="button"
    >
      Открыть
    </button>
  </div>
</article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Низких остатков нет"
                  description="Сейчас нет товаров, которые срочно требуют пополнения."
                />
              )}
            </PageSection>
          </section>

          <PageSection
            title="Проблемные товары"
            description="Карточки, где есть признаки проблем: низкая конверсия, рейтинг, остатки или слабая динамика."
          >
            {dashboard.problemProducts.length > 0 ? (
              <div className="problem-products-grid">
                {dashboard.problemProducts.map((product) => (
                  <article className="problem-product-card" key={product.id}>
                    <div className="problem-product-card__header">
                      <div>
                        <h3>{product.title}</h3>
                        <span>
                          {product.marketplaceName} · {product.sku}
                        </span>
                      </div>

                      <div className="dashboard-card-actions">
  <StatusBadge tone="warning">
    {`${product.problems.length} проблем`}
  </StatusBadge>

  <button
    className="secondary-button"
    onClick={() => onOpenProduct(product.id)}
    type="button"
  >
    Открыть
  </button>
</div>
                    </div>

                    <div className="problem-product-card__metrics">
                      <span>Остаток: {product.stock}</span>
                      <span>Рейтинг: {product.rating ?? "—"}</span>
                      <span>Просмотры: {product.views}</span>
                      <span>Заказы: {product.ordersCount}</span>
                      <span>Конверсия: {product.conversionRate}%</span>
                    </div>

                    <ul>
                      {product.problems.map((problem) => (
                        <li key={problem}>{problem}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Проблемных товаров нет"
                description="По текущим данным товары выглядят нормально."
              />
            )}
          </PageSection>

          <PageSection
            title="Топ товаров"
            description="Товары, которые приносят больше всего выручки и заказов."
          >
            {dashboard.topProducts.length > 0 ? (
              <div className="top-products-table">
                <table>
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th>Маркетплейс</th>
                      <th>Выручка</th>
                      <th>Заказы</th>
                      <th>Просмотры</th>
                      <th>Остаток</th>
                      <th>Рейтинг</th>
                      <th>Действия</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dashboard.topProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <strong>{product.title}</strong>
                          <br />
                          <span>{product.sku}</span>
                        </td>
                        <td>
                          {product.marketplaceName}
                          <br />
                          <span>{product.marketplaceType}</span>
                        </td>
                        <td>{product.revenue} ₽</td>
                        <td>{product.ordersCount}</td>
                        <td>{product.views}</td>
                        <td>
                          <StatusBadge
                            tone={product.stock <= 10 ? "warning" : "success"}
                          >
                            {product.stock}
                          </StatusBadge>
                        </td>
                        <td>{product.rating ?? "—"}</td>
                        <td>
  <button
    className="secondary-button"
    onClick={() => onOpenProduct(product.id)}
    type="button"
  >
    Открыть
  </button>
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="Топ товаров пока нет"
                description="После появления заказов здесь появится рейтинг лучших товаров."
              />
            )}
          </PageSection>
        </>
      ) : null}
    </>
  );
}