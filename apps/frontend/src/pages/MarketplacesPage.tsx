import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  createMarketplaceConnection,
  getMarketplaceConnections,
  getMarketplaceProviders,
  syncMarketplaceConnection,
  updateMarketplaceConnectionStatus,
} from "../api/marketplacesApi";
import { PageSection } from "../components/PageSection";
import type {
  MarketplaceConnection,
  MarketplaceProvider,
  MarketplaceSyncResult,
  MarketplaceType,
} from "../types/marketplace";
import "./MarketplacesPage.css";

const marketplaceLabels: Record<MarketplaceType, string> = {
  YANDEX_MARKET: "Яндекс Маркет",
  WILDBERRIES: "Wildberries",
  AVITO: "Avito",
  OZON: "Ozon",
  OTHER: "Other",
};

export function MarketplacesPage() {
  const [providers, setProviders] = useState<MarketplaceProvider[]>([]);
  const [connections, setConnections] = useState<MarketplaceConnection[]>([]);
  const [selectedType, setSelectedType] =
    useState<MarketplaceType>("YANDEX_MARKET");
  const [connectionName, setConnectionName] = useState("Мой Яндекс Маркет");
  const [externalAccountId, setExternalAccountId] = useState("DEMO-ACCOUNT-001");
  const [apiKey, setApiKey] = useState("demo-api-key");
  const [syncingId, setSyncingId] = useState("");
  const [lastSyncResult, setLastSyncResult] =
    useState<MarketplaceSyncResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  function loadConnections() {
    getMarketplaceConnections()
      .then((response) => {
        setConnections(response.data);
      })
      .catch(() => {
        setErrorText("Не удалось загрузить подключённые маркетплейсы.");
      });
  }

  useEffect(() => {
    Promise.all([getMarketplaceProviders(), getMarketplaceConnections()])
      .then(([providersResponse, connectionsResponse]) => {
        setProviders(providersResponse.data);
        setConnections(connectionsResponse.data);
      })
      .catch(() => {
        setErrorText(
          "Не удалось загрузить маркетплейсы. Проверь backend и авторизацию.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function handleProviderSelect(type: MarketplaceType) {
    setSelectedType(type);

    if (type === "YANDEX_MARKET") {
      setConnectionName("Мой Яндекс Маркет");
      setExternalAccountId("YANDEX-DEMO-001");
    }

    if (type === "WILDBERRIES") {
      setConnectionName("Мой Wildberries");
      setExternalAccountId("WB-DEMO-001");
    }

    if (type === "AVITO") {
      setConnectionName("Мой Avito");
      setExternalAccountId("AVITO-DEMO-001");
    }
  }

  function handleCreateConnection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (connectionName.trim().length < 2) {
      setErrorText("Название подключения должно содержать минимум 2 символа.");
      setSuccessText("");
      return;
    }

    setIsCreating(true);
    setErrorText("");
    setSuccessText("");
    setLastSyncResult(null);

    createMarketplaceConnection({
      name: connectionName.trim(),
      type: selectedType,
      externalAccountId: externalAccountId.trim() || undefined,
      apiKey: apiKey.trim() || undefined,
      syncMode: "MOCK",
    })
      .then(() => {
        setSuccessText("Маркетплейс подключён в demo-режиме.");
        loadConnections();
      })
      .catch(() => {
        setErrorText("Не удалось подключить маркетплейс.");
      })
      .finally(() => {
        setIsCreating(false);
      });
  }

  function handleSync(connectionId: string) {
    setSyncingId(connectionId);
    setErrorText("");
    setSuccessText("");
    setLastSyncResult(null);

    syncMarketplaceConnection(connectionId)
      .then((response) => {
        setLastSyncResult(response.data);
        setSuccessText("Синхронизация завершена.");
        loadConnections();
      })
      .catch(() => {
        setErrorText("Не удалось синхронизировать маркетплейс.");
      })
      .finally(() => {
        setSyncingId("");
      });
  }

  function handleDisable(connectionId: string) {
    setErrorText("");
    setSuccessText("");

    updateMarketplaceConnectionStatus(connectionId, "DISCONNECTED")
      .then(() => {
        setSuccessText("Подключение отключено.");
        loadConnections();
      })
      .catch(() => {
        setErrorText("Не удалось изменить статус подключения.");
      });
  }

  if (isLoading) {
    return <p>Загрузка маркетплейсов...</p>;
  }

  return (
    <>
      <PageSection
        title="Маркетплейсы"
        description="Подключение кабинетов маркетплейсов и mock-синхронизация данных в SellerHUB."
      >
        {errorText ? <p className="error-text">{errorText}</p> : null}
        {successText ? <p className="success-text">{successText}</p> : null}

        <div className="marketplaces-grid">
          <section className="marketplace-panel">
            <h3>Доступные подключения</h3>
            <p>
              В demo-режиме реальные API-ключи не проверяются, но архитектура
              уже готова к замене mock-коннекторов на реальные API.
            </p>

            <div className="provider-list">
              {providers.map((provider) => (
                <button
                  className={
                    selectedType === provider.type
                      ? "provider-card provider-card--active"
                      : "provider-card"
                  }
                  key={provider.type}
                  onClick={() => handleProviderSelect(provider.type)}
                  type="button"
                >
                  <strong>{provider.title}</strong>
                  <span>{provider.description}</span>
                  <small>Auth: {provider.authType}</small>
                </button>
              ))}
            </div>

            <form className="marketplace-form" onSubmit={handleCreateConnection}>
              <label>
                <span>Название подключения</span>
                <input
                  value={connectionName}
                  onChange={(event) => setConnectionName(event.target.value)}
                />
              </label>

              <label>
                <span>External account ID</span>
                <input
                  value={externalAccountId}
                  onChange={(event) => setExternalAccountId(event.target.value)}
                />
              </label>

              <label>
                <span>API key / demo key</span>
                <input
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                />
              </label>

              <button
                className="primary-button"
                disabled={isCreating}
                type="submit"
              >
                {isCreating
                  ? "Подключаю..."
                  : `Подключить ${marketplaceLabels[selectedType]}`}
              </button>
            </form>
          </section>

          <section className="marketplace-panel">
            <h3>Подключённые маркетплейсы</h3>

            <div className="connections-list">
              {connections.map((connection) => (
                <article className="connection-card" key={connection.id}>
                  <div className="connection-card__header">
                    <div>
                      <h4>{connection.name}</h4>
                      <p>
                        {marketplaceLabels[connection.type]} ·{" "}
                        {connection.syncMode}
                      </p>
                    </div>

                    <span
                      className={`connection-status connection-status--${connection.status.toLowerCase()}`}
                    >
                      {connection.status}
                    </span>
                  </div>

                  <dl>
                    <div>
                      <dt>External ID</dt>
                      <dd>{connection.externalAccountId ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>API key</dt>
                      <dd>{connection.hasApiKey ? "Добавлен" : "Нет"}</dd>
                    </div>
                    <div>
                      <dt>Последняя синхронизация</dt>
                      <dd>
                        {connection.lastSyncAt
                          ? new Date(connection.lastSyncAt).toLocaleString(
                              "ru-RU",
                            )
                          : "Ещё не запускалась"}
                      </dd>
                    </div>
                  </dl>

                  <div className="connection-actions">
                    <button
                      className="primary-button"
                      disabled={syncingId === connection.id}
                      onClick={() => handleSync(connection.id)}
                      type="button"
                    >
                      {syncingId === connection.id
                        ? "Синхронизация..."
                        : "Синхронизировать"}
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() => handleDisable(connection.id)}
                      type="button"
                    >
                      Отключить
                    </button>
                  </div>
                </article>
              ))}

              {connections.length === 0 ? (
                <div className="empty-state">
                  <strong>Маркетплейсы ещё не подключены</strong>
                  <p>Выбери площадку слева и создай demo-подключение.</p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </PageSection>

      {lastSyncResult ? (
        <PageSection
          title="Результат синхронизации"
          description="Какие данные были импортированы из mock-коннектора."
        >
          <div className="sync-result">
            <div>
              <span>Источник</span>
              <strong>{marketplaceLabels[lastSyncResult.source]}</strong>
            </div>
            <div>
              <span>Товары</span>
              <strong>{lastSyncResult.imported.products}</strong>
            </div>
            <div>
              <span>Заказы</span>
              <strong>{lastSyncResult.imported.orders}</strong>
            </div>
            <div>
              <span>Отзывы</span>
              <strong>{lastSyncResult.imported.reviews}</strong>
            </div>
            <div>
              <span>Аналитика</span>
              <strong>{lastSyncResult.imported.analyticsRecords}</strong>
            </div>
            <div>
              <span>AI-рекомендации</span>
              <strong>{lastSyncResult.imported.recommendations}</strong>
            </div>
          </div>
        </PageSection>
      ) : null}
    </>
  );
}