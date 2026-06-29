import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  createMarketplaceConnection,
  getMarketplaceConnections,
  getMarketplaceProviders,
  syncMarketplaceConnection,
  updateMarketplaceConnectionStatus,
} from "../api/marketplacesApi";
import { AlertMessage } from "../components/AlertMessage";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PageSection } from "../components/PageSection";
import { StatusBadge } from "../components/StatusBadge";
import type {
  MarketplaceConnection,
  MarketplaceProvider,
  MarketplaceSyncReport,
  MarketplaceType,
} from "../types/marketplace";
import { getUniqueMarketplaceOptions } from "../utils/marketplaceOptions";
import "./MarketplacesPage.css";

const statusLabels = {
  CONNECTED: "Подключён",
  DISCONNECTED: "Отключён",
  NEEDS_ATTENTION: "Требует внимания",
};

function getStatusTone(status: MarketplaceConnection["status"]) {
  if (status === "CONNECTED") {
    return "success";
  }

  if (status === "NEEDS_ATTENTION") {
    return "warning";
  }

  return "neutral";
}

function getChangeTone(
  severity: MarketplaceSyncReport["changes"][number]["severity"],
) {
  if (severity === "SUCCESS") {
    return "success";
  }

  if (severity === "WARNING") {
    return "warning";
  }

  if (severity === "CRITICAL") {
    return "danger";
  }

  return "info";
}

export function MarketplacesPage() {
  const [providers, setProviders] = useState<MarketplaceProvider[]>([]);
  const [connections, setConnections] = useState<MarketplaceConnection[]>([]);
  const [selectedType, setSelectedType] =
    useState<MarketplaceType>("YANDEX_MARKET");
  const [storeName, setStoreName] = useState("");
  const [externalId, setExternalId] = useState("");
  const [syncReport, setSyncReport] = useState<MarketplaceSyncReport | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  const uniqueConnections = useMemo(
    () => getUniqueMarketplaceOptions(connections),
    [connections],
  );

  useEffect(() => {
    Promise.all([getMarketplaceProviders(), getMarketplaceConnections()])
      .then(([providersResponse, connectionsResponse]) => {
        setProviders(providersResponse.data);
        setConnections(connectionsResponse.data);

        if (providersResponse.data.length > 0) {
          setSelectedType(providersResponse.data[0].type);
        }
      })
      .catch(() => {
        setErrorText("Не удалось загрузить маркетплейсы.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function handleCreateConnection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (storeName.trim().length < 2) {
      setErrorText("Название магазина должно содержать минимум 2 символа.");
      setSuccessText("");
      return;
    }

    setIsCreating(true);
    setErrorText("");
    setSuccessText("");
    setSyncReport(null);

    createMarketplaceConnection({
      name: storeName.trim(),
      type: selectedType,
      syncMode: "MOCK",
      externalId: externalId.trim() || null,
    })
      .then((response) => {
        setConnections((currentConnections) => [
          response.data,
          ...currentConnections,
        ]);
        setStoreName("");
        setExternalId("");
        setSuccessText("Маркетплейс подключён.");
      })
      .catch((error) => {
        if (String(error).includes("409")) {
          setErrorText("Такой магазин уже подключён. Дубликат не создан.");
        } else {
          setErrorText("Не удалось подключить маркетплейс.");
        }
      })
      .finally(() => {
        setIsCreating(false);
      });
  }

  function handleSync(connection: MarketplaceConnection) {
    setSyncingId(connection.id);
    setErrorText("");
    setSuccessText("");
    setSyncReport(null);

    syncMarketplaceConnection(connection.id)
      .then((response) => {
        setConnections((currentConnections) =>
          currentConnections.map((currentConnection) =>
            currentConnection.id === response.data.id
              ? response.data
              : currentConnection,
          ),
        );
        setSyncReport(response.report);
        setSuccessText(`Синхронизация ${response.data.name} завершена.`);
      })
      .catch(() => {
        setErrorText("Не удалось выполнить синхронизацию.");
      })
      .finally(() => {
        setSyncingId("");
      });
  }

  function handleToggleStatus(connection: MarketplaceConnection) {
    const nextStatus =
      connection.status === "CONNECTED" ? "DISCONNECTED" : "CONNECTED";

    setErrorText("");
    setSuccessText("");

    updateMarketplaceConnectionStatus(connection.id, {
      status: nextStatus,
    })
      .then((response) => {
        setConnections((currentConnections) =>
          currentConnections.map((currentConnection) =>
            currentConnection.id === response.data.id
              ? response.data
              : currentConnection,
          ),
        );
        setSuccessText(
          nextStatus === "CONNECTED"
            ? "Подключение включено."
            : "Подключение отключено.",
        );
      })
      .catch(() => {
        setErrorText("Не удалось изменить статус подключения.");
      });
  }

  return (
    <>
      <PageSection
        title="Маркетплейсы"
        description="Подключения магазинов и синхронизация данных SellerHUB."
      >
        <div className="page-message-stack">
          {errorText ? <AlertMessage type="error">{errorText}</AlertMessage> : null}
          {successText ? (
            <AlertMessage type="success">{successText}</AlertMessage>
          ) : null}
        </div>

        {isLoading ? (
          <LoadingState title="Загрузка маркетплейсов..." rows={4} />
        ) : null}

        {!isLoading ? (
          <div className="marketplaces-layout">
            <form
              className="marketplace-connect-card"
              onSubmit={handleCreateConnection}
            >
              <h3>Подключить магазин</h3>

              <label>
                <span>Маркетплейс</span>
                <select
                  value={selectedType}
                  onChange={(event) =>
                    setSelectedType(event.target.value as MarketplaceType)
                  }
                >
                  {providers.map((provider) => (
                    <option key={provider.type} value={provider.type}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Название магазина</span>
                <input
                  value={storeName}
                  onChange={(event) => setStoreName(event.target.value)}
                  placeholder="Например: SellerHUB Demo Store"
                />
              </label>

              <label>
                <span>Внешний ID магазина</span>
                <input
                  value={externalId}
                  onChange={(event) => setExternalId(event.target.value)}
                  placeholder="Можно оставить пустым"
                />
              </label>

              <button
                className="primary-button"
                disabled={isCreating}
                type="submit"
              >
                {isCreating ? "Подключаю..." : "Подключить"}
              </button>
            </form>

            <section className="marketplace-providers-card">
              <h3>Доступные интеграции</h3>

              <div className="provider-list">
                {providers.map((provider) => (
                  <article className="provider-card" key={provider.type}>
                    <div>
                      <h4>{provider.name}</h4>
                      <p>{provider.description}</p>
                    </div>

                    <StatusBadge
                      tone={provider.isAvailable ? "success" : "neutral"}
                    >
                      {provider.isAvailable ? "Доступно" : "Скоро"}
                    </StatusBadge>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </PageSection>

      {!isLoading ? (
        <PageSection
          title="Подключённые магазины"
          description="Здесь можно синхронизировать данные или отключить магазин."
        >
          {uniqueConnections.length > 0 ? (
            <div className="marketplace-connections-grid">
              {uniqueConnections.map((connection) => (
                <article
                  className="marketplace-connection-card"
                  key={connection.id}
                >
                  <div className="marketplace-connection-card__header">
                    <div>
                      <h3>{connection.name}</h3>
                      <span>{connection.type}</span>
                    </div>

                    <StatusBadge tone={getStatusTone(connection.status)}>
                      {statusLabels[connection.status]}
                    </StatusBadge>
                  </div>

                  <dl>
                    <div>
                      <dt>Sync mode</dt>
                      <dd>{connection.syncMode}</dd>
                    </div>
                    <div>
                      <dt>External ID</dt>
                      <dd>{connection.externalId ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Last sync</dt>
                      <dd>
                        {connection.lastSyncAt
                          ? new Date(connection.lastSyncAt).toLocaleString(
                              "ru-RU",
                            )
                          : "Синхронизации ещё не было"}
                      </dd>
                    </div>
                  </dl>

                  <div className="marketplace-connection-card__actions">
                    <button
                      className="primary-button"
                      disabled={
                        syncingId === connection.id ||
                        connection.status === "DISCONNECTED"
                      }
                      onClick={() => handleSync(connection)}
                      type="button"
                    >
                      {syncingId === connection.id
                        ? "Синхронизирую..."
                        : "Sync"}
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() => handleToggleStatus(connection)}
                      type="button"
                    >
                      {connection.status === "CONNECTED"
                        ? "Отключить"
                        : "Включить"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Магазины ещё не подключены"
              description="Подключи тестовый магазин, чтобы SellerHUB мог загрузить товары, отзывы и аналитику."
            />
          )}
        </PageSection>
      ) : null}

      {syncReport ? (
        <PageSection
          title="Marketplace Sync Report"
          description="Что изменилось после последней синхронизации."
        >
          <div className="sync-report">
            <header className="sync-report__header">
              <div>
                <span>{syncReport.marketplaceType}</span>
                <h3>{syncReport.marketplaceName}</h3>
                <p>
                  Синхронизация завершена{" "}
                  {new Date(syncReport.syncedAt).toLocaleString("ru-RU")}
                </p>
              </div>

              <StatusBadge tone="success">Sync complete</StatusBadge>
            </header>

            <div className="sync-report-summary">
              <article>
                <span>Товары</span>
                <strong>{syncReport.summary.productsUpdated}</strong>
              </article>

              <article>
                <span>Отзывы</span>
                <strong>{syncReport.summary.reviewsFound}</strong>
              </article>

              <article>
                <span>Негатив</span>
                <strong>{syncReport.summary.negativeReviews}</strong>
              </article>

              <article>
                <span>Низкий остаток</span>
                <strong>{syncReport.summary.lowStockProducts}</strong>
              </article>

              <article>
                <span>Рекомендации</span>
                <strong>{syncReport.summary.recommendationsCreated}</strong>
              </article>
            </div>

            <div className="sync-report-changes">
              {syncReport.changes.map((change) => (
                <article className="sync-report-change-card" key={change.id}>
                  <StatusBadge tone={getChangeTone(change.severity)}>
                    {change.type}
                  </StatusBadge>

                  <div>
                    <h4>{change.title}</h4>
                    <p>{change.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </PageSection>
      ) : null}
    </>
  );
}