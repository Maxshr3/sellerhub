import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { getMarketplaceConnections } from "../api/marketplacesApi";
import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../api/productsApi";
import { AlertMessage } from "../components/AlertMessage";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PageSection } from "../components/PageSection";
import { ProductHealthBadge } from "../components/ProductHealthBadge";
import { StatusBadge } from "../components/StatusBadge";
import {
  buildProductIntelligence,
  simulateProductScenario,
} from "../utils/productIntelligence";
import { getUniqueMarketplaceOptions } from "../utils/marketplaceOptions";
import type { MarketplaceConnection } from "../types/marketplace";
import type {
  CreateProductRequest,
  Product,
  ProductDetail,
  ProductFilters,
  UpdateProductRequest,
} from "../types/product";
import "./ProductsPage.css";

type ProductFormMode = "create" | "edit";

type ProductsPageProps = {
  productToOpenId?: string | null;
  onProductModalOpened?: () => void;
};

const emptyForm = {
  marketplaceId: "",
  title: "",
  sku: "",
  price: "",
  stock: "0",
  rating: "",
  isActive: true,
};

export function ProductsPage({
  productToOpenId,
  onProductModalOpened,
}: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [marketplaces, setMarketplaces] = useState<MarketplaceConnection[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(
    null,
  );
  const [formMode, setFormMode] = useState<ProductFormMode>("create");
  const [editingProductId, setEditingProductId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [marketplaceId, setMarketplaceId] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");


  const [priceChangePercent, setPriceChangePercent] = useState(0);
const [stockChange, setStockChange] = useState(0);

const uniqueMarketplaces = useMemo(
  () => getUniqueMarketplaceOptions(marketplaces),
  [marketplaces],
);

const productIntelligence = useMemo(
  () => (selectedProduct ? buildProductIntelligence(selectedProduct) : null),
  [selectedProduct],
);

const productScenario = useMemo(
  () =>
    selectedProduct
      ? simulateProductScenario(selectedProduct, priceChangePercent, stockChange)
      : null,
  [selectedProduct, priceChangePercent, stockChange],
);

  function buildFilters(): ProductFilters {
    return {
      search: search.trim() || undefined,
      marketplaceId: marketplaceId || undefined,
      isActive:
        activeFilter === "active"
          ? true
          : activeFilter === "inactive"
            ? false
            : undefined,
      lowStock: lowStockOnly || undefined,
    };
  }

  function loadProducts(filters?: ProductFilters) {
    setIsLoading(true);
    setErrorText("");

    getProducts(filters)
      .then((response) => {
        setProducts(response.data);
      })
      .catch(() => {
        setErrorText("Не удалось загрузить товары. Проверь backend.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    getProducts()
      .then((response) => {
        setProducts(response.data);
      })
      .catch(() => {
        setErrorText("Не удалось загрузить товары. Проверь backend.");
      })
      .finally(() => {
        setIsLoading(false);
      });

    getMarketplaceConnections()
      .then((response) => {
        setMarketplaces(response.data);

        if (response.data.length > 0) {
          setForm((currentForm) => ({
            ...currentForm,
            marketplaceId: response.data[0].id,
          }));
        }
      })
      .catch(() => {
        setErrorText("Не удалось загрузить маркетплейсы для формы товара.");
      });
  }, []);

  function handleFiltersSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadProducts(buildFilters());
  }

  function handleResetFilters() {
    setSearch("");
    setMarketplaceId("");
    setActiveFilter("");
    setLowStockOnly(false);
    loadProducts();
  }

  function handleFormChange(name: string, value: string | boolean) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function resetForm() {
  setForm({
    ...emptyForm,
    marketplaceId: uniqueMarketplaces[0]?.id ?? "",
  });
  setFormMode("create");
  setEditingProductId("");
}

  function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.marketplaceId) {
      setErrorText("Сначала подключи маркетплейс на странице Profile → Маркетплейсы.");
      setSuccessText("");
      return;
    }

    if (form.title.trim().length < 2) {
      setErrorText("Название товара должно содержать минимум 2 символа.");
      setSuccessText("");
      return;
    }

    if (form.sku.trim().length < 2) {
      setErrorText("SKU должен содержать минимум 2 символа.");
      setSuccessText("");
      return;
    }

    if (Number(form.price) <= 0) {
      setErrorText("Цена должна быть больше 0.");
      setSuccessText("");
      return;
    }

    if (Number(form.stock) < 0) {
      setErrorText("Остаток не может быть меньше 0.");
      setSuccessText("");
      return;
    }

    setIsSaving(true);
    setErrorText("");
    setSuccessText("");

    const commonPayload = {
      title: form.title.trim(),
      sku: form.sku.trim(),
      price: form.price,
      stock: Number(form.stock),
      rating: form.rating.trim() || null,
      isActive: form.isActive,
    };

    const request =
      formMode === "create"
        ? createProduct({
            marketplaceId: form.marketplaceId,
            ...commonPayload,
          } satisfies CreateProductRequest)
        : updateProduct(editingProductId, {
            ...commonPayload,
          } satisfies UpdateProductRequest);

    request
      .then(() => {
        setSuccessText(
          formMode === "create" ? "Товар создан." : "Товар обновлён.",
        );
        resetForm();
        loadProducts(buildFilters());
      })
      .catch(() => {
        setErrorText(
          formMode === "create"
            ? "Не удалось создать товар. Проверь SKU и маркетплейс."
            : "Не удалось обновить товар.",
        );
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  function handleEdit(product: Product) {
    setFormMode("edit");
    setEditingProductId(product.id);
    setForm({
      marketplaceId: product.marketplaceId,
      title: product.title,
      sku: product.sku,
      price: product.price,
      stock: String(product.stock),
      rating: product.rating ?? "",
      isActive: product.isActive,
    });
    setSuccessText("");
    setErrorText("");
  }

  function handleOpenDetails(productId: string) {
    setErrorText("");

    getProductById(productId)
      .then((response) => {
  setSelectedProduct(response.data);
  setPriceChangePercent(0);
  setStockChange(0);
})
      .catch(() => {
        setErrorText("Не удалось загрузить карточку товара.");
      });
  }

    useEffect(() => {
  if (!productToOpenId) {
    return;
  }

  getProductById(productToOpenId)
    .then((response) => {
      setSelectedProduct(response.data);
      onProductModalOpened?.();
    })
    .catch(() => {
      setErrorText("Не удалось загрузить карточку товара.");
      onProductModalOpened?.();
    });
}, [productToOpenId, onProductModalOpened]);

  function handleQuickToggleActive(product: Product) {
    updateProduct(product.id, {
      isActive: !product.isActive,
    })
      .then(() => {
        setSuccessText(
          product.isActive ? "Товар скрыт из активных." : "Товар активирован.",
        );
        loadProducts(buildFilters());
      })
      .catch(() => {
        setErrorText("Не удалось изменить статус товара.");
      });
  }

  return (
    <>
      <PageSection
        title="Products"
        description="Управление товарами: фильтры, создание, редактирование, остатки и статус карточек."
      >
        <div className="page-message-stack">
          {errorText ? <AlertMessage type="error">{errorText}</AlertMessage> : null}
          {successText ? (
            <AlertMessage type="success">{successText}</AlertMessage>
          ) : null}
        </div>

        <div className="products-layout">
          <section className="products-panel">
            <h3>Фильтры</h3>

            <form className="products-filters" onSubmit={handleFiltersSubmit}>
              <label>
                <span>Поиск</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Название или SKU"
                />
              </label>

              <label>
                <span>Маркетплейс</span>
                <select
                  value={marketplaceId}
                  onChange={(event) => setMarketplaceId(event.target.value)}
                >
                  <option value="">Все маркетплейсы</option>
                  {uniqueMarketplaces.map((marketplace) => (
                    <option key={marketplace.id} value={marketplace.id}>
                      {marketplace.name} · {marketplace.type}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Статус</span>
                <select
                  value={activeFilter}
                  onChange={(event) => setActiveFilter(event.target.value)}
                >
                  <option value="">Все</option>
                  <option value="active">Активные</option>
                  <option value="inactive">Неактивные</option>
                </select>
              </label>

              <label className="checkbox-row">
                <input
                  checked={lowStockOnly}
                  onChange={(event) => setLowStockOnly(event.target.checked)}
                  type="checkbox"
                />
                <span>Только низкий остаток</span>
              </label>

              <div className="products-filter-actions">
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
          </section>

          <section className="products-panel">
            <h3>{formMode === "create" ? "Создать товар" : "Редактировать"}</h3>

            <form className="product-form" onSubmit={handleProductSubmit}>
              <label>
                <span>Маркетплейс</span>
                <select
                  disabled={formMode === "edit"}
                  value={form.marketplaceId}
                  onChange={(event) =>
                    handleFormChange("marketplaceId", event.target.value)
                  }
                >
                  {uniqueMarketplaces.length === 0 ? (
                    <option value="">Нет подключений</option>
                  ) : null}

                  {uniqueMarketplaces.map((marketplace) => (
                    <option key={marketplace.id} value={marketplace.id}>
                      {marketplace.name} · {marketplace.type}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Название</span>
                <input
                  value={form.title}
                  onChange={(event) =>
                    handleFormChange("title", event.target.value)
                  }
                  placeholder="Например: умная лампа Pro"
                />
              </label>

              <label>
                <span>SKU</span>
                <input
                  value={form.sku}
                  onChange={(event) => handleFormChange("sku", event.target.value)}
                  placeholder="SKU-001"
                />
              </label>

              <div className="product-form__row">
                <label>
                  <span>Цена</span>
                  <input
                    value={form.price}
                    onChange={(event) =>
                      handleFormChange("price", event.target.value)
                    }
                    placeholder="2990.00"
                  />
                </label>

                <label>
                  <span>Остаток</span>
                  <input
                    value={form.stock}
                    onChange={(event) =>
                      handleFormChange("stock", event.target.value)
                    }
                    type="number"
                  />
                </label>
              </div>

              <div className="product-form__row">
                <label>
                  <span>Рейтинг</span>
                  <input
                    value={form.rating}
                    onChange={(event) =>
                      handleFormChange("rating", event.target.value)
                    }
                    placeholder="4.7"
                  />
                </label>

                <label>
                  <span>Статус</span>
                  <select
                    value={form.isActive ? "active" : "inactive"}
                    onChange={(event) =>
                      handleFormChange(
                        "isActive",
                        event.target.value === "active",
                      )
                    }
                  >
                    <option value="active">Активен</option>
                    <option value="inactive">Неактивен</option>
                  </select>
                </label>
              </div>

              <div className="product-form__actions">
                <button
                  className="primary-button"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving
                    ? "Сохраняю..."
                    : formMode === "create"
                      ? "Создать товар"
                      : "Сохранить изменения"}
                </button>

                {formMode === "edit" ? (
                  <button
                    className="secondary-button"
                    onClick={resetForm}
                    type="button"
                  >
                    Отменить
                  </button>
                ) : null}
              </div>
            </form>
          </section>
        </div>
      </PageSection>

      <PageSection title="Список товаров">
        {isLoading ? <LoadingState title="Загрузка товаров..." rows={5} /> : null}

        {!isLoading && products.length > 0 ? (
          <div className="products-table-card">
            <table>
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Маркетплейс</th>
                  <th>Цена</th>
                  <th>Остаток</th>
                  <th>Рейтинг</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.title}</strong>
                      <br />
                      <span className="muted-text">{product.sku}</span>
                    </td>
                    <td>
                      {product.marketplaceName}
                      <br />
                      <span className="muted-text">
                        {product.marketplaceType}
                      </span>
                    </td>
                    <td>{product.price} ₽</td>
                    <td>
                      <StatusBadge tone={product.stock <= 10 ? "warning" : "success"}>
  {`${product.stock}`}
</StatusBadge>

<ProductHealthBadge product={product} compact />
                    </td>
                    <td>{product.rating ?? "—"}</td>
                    <td>
                      <StatusBadge
                        tone={product.isActive ? "success" : "neutral"}
                      >
                        {product.isActive ? "Активен" : "Неактивен"}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="product-actions">
                        <button
                          className="secondary-button"
                          onClick={() => handleOpenDetails(product.id)}
                          type="button"
                        >
                          Детали
                        </button>
                        <button
                          className="secondary-button"
                          onClick={() => handleEdit(product)}
                          type="button"
                        >
                          Изменить
                        </button>
                        <button
                          className="secondary-button"
                          onClick={() => handleQuickToggleActive(product)}
                          type="button"
                        >
                          {product.isActive ? "Скрыть" : "Активировать"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!isLoading && products.length === 0 ? (
          <EmptyState
            title="Товары не найдены"
            description="Измени фильтры, подключи маркетплейс или создай новый товар вручную."
          />
        ) : null}
      </PageSection>

      {selectedProduct ? (
        <div
          className="product-modal-backdrop"
          onClick={() => setSelectedProduct(null)}
        >
          <section
            className="product-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="product-modal__header">
              <div>
                <p>Карточка товара</p>
                <h2>{selectedProduct.title}</h2>
                <span>{selectedProduct.sku}</span>
              </div>

              <button
                className="modal-close-button"
                onClick={() => setSelectedProduct(null)}
                type="button"
              >
                ×
              </button>
            </header>

{productIntelligence && productScenario ? (
  <div className="product-intelligence">
    <section className="product-health-card">
      <div className="product-health-card__score">
        <span>Health Score</span>
        <strong>{productIntelligence.healthScore}/100</strong>
        <StatusBadge tone={productIntelligence.healthTone}>
          {productIntelligence.healthLabel}
        </StatusBadge>
      </div>

      <div className="product-health-card__content">
        <h3>{productIntelligence.mainRisk}</h3>
        <p>{productIntelligence.recommendedAction}</p>

        <div className="product-health-factors">
          {productIntelligence.factors.map((factor) => (
            <article
              className={`product-health-factor product-health-factor--${factor.type}`}
              key={factor.title}
            >
              <strong>{factor.title}</strong>
              <span>{factor.description}</span>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="product-intelligence-grid">
      <article className="product-intelligence-card">
        <span>Lost Revenue Detector</span>
        <strong>{productIntelligence.lostRevenue.total} ₽</strong>
        <p>{productIntelligence.lostRevenue.message}</p>

        <dl>
          <div>
            <dt>Риск из-за остатка</dt>
            <dd>{productIntelligence.lostRevenue.stockRisk} ₽</dd>
          </div>
          <div>
            <dt>Риск из-за конверсии</dt>
            <dd>{productIntelligence.lostRevenue.conversionRisk} ₽</dd>
          </div>
        </dl>
      </article>

      <article className="product-intelligence-card">
        <span>Stock Planner</span>
        <strong>
          {productIntelligence.stockPlanner.daysLeft === null
            ? "Недостаточно данных"
            : `${productIntelligence.stockPlanner.daysLeft} дн.`}
        </strong>
        <p>{productIntelligence.stockPlanner.message}</p>

        <dl>
          <div>
            <dt>Средние продажи в день</dt>
            <dd>{productIntelligence.stockPlanner.averageDailyOrders}</dd>
          </div>
          <div>
            <dt>Рекомендовано пополнить</dt>
            <dd>{productIntelligence.stockPlanner.recommendedRestock} шт.</dd>
          </div>
        </dl>
      </article>

      <article className="product-intelligence-card product-simulator-card">
        <span>What-if Simulator</span>
        <h3>Сценарий изменения цены и остатка</h3>

        <label>
          <span>Изменение цены: {priceChangePercent}%</span>
          <input
            min="-30"
            max="30"
            value={priceChangePercent}
            onChange={(event) =>
              setPriceChangePercent(Number(event.target.value))
            }
            type="range"
          />
        </label>

        <label>
          <span>Изменение остатка: {stockChange} шт.</span>
          <input
            min="-50"
            max="150"
            value={stockChange}
            onChange={(event) => setStockChange(Number(event.target.value))}
            type="range"
          />
        </label>

        <dl>
          <div>
            <dt>Новая цена</dt>
            <dd>{productScenario.projectedPrice} ₽</dd>
          </div>
          <div>
            <dt>Новый остаток</dt>
            <dd>{productScenario.projectedStock} шт.</dd>
          </div>
          <div>
            <dt>Прогноз конверсии</dt>
            <dd>{productScenario.projectedConversion}%</dd>
          </div>
          <div>
            <dt>Прогноз выручки</dt>
            <dd>{productScenario.projectedRevenue} ₽</dd>
          </div>
        </dl>

        <StatusBadge tone={productScenario.revenueDelta >= 0 ? "success" : "danger"}>
          {productScenario.revenueDelta >= 0
            ? `+${productScenario.revenueDelta} ₽`
            : `${productScenario.revenueDelta} ₽`}
        </StatusBadge>

        <p>{productScenario.riskLabel}</p>
        <p>{productScenario.recommendation}</p>
      </article>

      <article className="product-intelligence-card">
        <span>Product Timeline</span>
        <h3>История событий</h3>

        <div className="product-timeline">
          {productIntelligence.timeline.map((event) => (
            <div className="product-timeline-item" key={event.id}>
              <div />
              <article>
                <time>{new Date(event.date).toLocaleString("ru-RU")}</time>
                <strong>{event.title}</strong>
                <p>{event.description}</p>
              </article>
            </div>
          ))}
        </div>

        {productIntelligence.timeline.length === 0 ? (
          <p>Событий по товару пока нет.</p>
        ) : null}
      </article>
    </section>
  </div>
) : null}

            <div className="product-modal__summary">
              <article>
                <span>Маркетплейс</span>
                <strong>{selectedProduct.marketplaceName}</strong>
              </article>

              <article>
                <span>Цена</span>
                <strong>{selectedProduct.price} ₽</strong>
              </article>

              <article>
                <span>Остаток</span>
                <strong>{selectedProduct.stock}</strong>
              </article>

              <article>
                <span>Рейтинг</span>
                <strong>{selectedProduct.rating ?? "—"}</strong>
              </article>
            </div>

            <div className="product-detail-grid">
              <article className="product-detail-card">
                <h3>Последние отзывы</h3>

                {selectedProduct.reviews.map((review) => (
                  <div className="mini-list-item" key={review.id}>
                    <strong>
                      {review.authorName} · {review.rating}/5
                    </strong>
                    <p>{review.text}</p>
                  </div>
                ))}

                {selectedProduct.reviews.length === 0 ? (
                  <EmptyState
                    title="Отзывов пока нет"
                    description="Когда покупатели оставят отзывы, они появятся здесь."
                  />
                ) : null}
              </article>

              <article className="product-detail-card">
                <h3>Последняя аналитика</h3>

                {selectedProduct.analytics.map((item) => (
                  <div className="mini-list-item" key={item.id}>
                    <strong>
                      {new Date(item.date).toLocaleDateString("ru-RU")}
                    </strong>
                    <p>
                      Просмотры: {item.views}, заказы: {item.ordersCount},
                      выручка: {item.revenue} ₽
                    </p>
                  </div>
                ))}

                {selectedProduct.analytics.length === 0 ? (
                  <EmptyState
                    title="Аналитики пока нет"
                    description="После синхронизации маркетплейса здесь появятся просмотры, заказы и выручка."
                  />
                ) : null}
              </article>

              <article className="product-detail-card">
                <h3>AI-рекомендации</h3>

                {selectedProduct.recommendations.map((recommendation) => (
                  <div className="mini-list-item" key={recommendation.id}>
                    <strong>{recommendation.title}</strong>
                    <p>{recommendation.content}</p>
                  </div>
                ))}

                {selectedProduct.recommendations.length === 0 ? (
                  <EmptyState
                    title="Рекомендаций пока нет"
                    description="AI-рекомендации появятся после синхронизации и анализа товара."
                  />
                ) : null}
              </article>

              <article className="product-detail-card">
                <h3>Служебная информация</h3>

                <dl>
                  <div>
                    <dt>ID</dt>
                    <dd>{selectedProduct.id}</dd>
                  </div>
                  <div>
                    <dt>Создан</dt>
                    <dd>
                      {new Date(selectedProduct.createdAt).toLocaleString(
                        "ru-RU",
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Обновлён</dt>
                    <dd>
                      {new Date(selectedProduct.updatedAt).toLocaleString(
                        "ru-RU",
                      )}
                    </dd>
                  </div>
                </dl>
              </article>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}