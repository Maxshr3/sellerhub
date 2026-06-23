import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getMarketplaceConnections } from "../api/marketplacesApi";
import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../api/productsApi";
import { PageSection } from "../components/PageSection";
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

const emptyForm = {
  marketplaceId: "",
  title: "",
  sku: "",
  price: "",
  stock: "0",
  rating: "",
  isActive: true,
};

export function ProductsPage() {
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
      marketplaceId: marketplaces[0]?.id ?? "",
    });
    setFormMode("create");
    setEditingProductId("");
  }

  function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.marketplaceId) {
      setErrorText("Сначала подключи маркетплейс на странице Marketplaces.");
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
      })
      .catch(() => {
        setErrorText("Не удалось загрузить карточку товара.");
      });
  }

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
        title="Products Management"
        description="Управление товарами: фильтры, создание, редактирование, остатки и статус карточек."
      >
        {errorText ? <p className="error-text">{errorText}</p> : null}
        {successText ? <p className="success-text">{successText}</p> : null}

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
                  {marketplaces.map((marketplace) => (
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
                  {marketplaces.length === 0 ? (
                    <option value="">Нет подключений</option>
                  ) : null}

                  {marketplaces.map((marketplace) => (
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
        {isLoading ? <p>Загрузка товаров...</p> : null}

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
                    <span className="muted-text">{product.marketplaceType}</span>
                  </td>
                  <td>{product.price} ₽</td>
                  <td>
                    <span
                      className={
                        product.stock <= 10
                          ? "stock-badge stock-badge--low"
                          : "stock-badge"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td>{product.rating ?? "—"}</td>
                  <td>
                    <span
                      className={
                        product.isActive
                          ? "product-status product-status--active"
                          : "product-status"
                      }
                    >
                      {product.isActive ? "Активен" : "Неактивен"}
                    </span>
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

          {!isLoading && products.length === 0 ? (
            <div className="empty-state">
              <strong>Товары не найдены</strong>
              <p>Измени фильтры или создай новый товар.</p>
            </div>
          ) : null}
        </div>
      </PageSection>

      {selectedProduct ? (
        <PageSection
          title="Карточка товара"
          description="Подробная информация по выбранному товару."
        >
          <div className="product-detail-grid">
            <article className="product-detail-card">
              <h3>{selectedProduct.title}</h3>
              <p>{selectedProduct.sku}</p>

              <dl>
                <div>
                  <dt>Маркетплейс</dt>
                  <dd>{selectedProduct.marketplaceName}</dd>
                </div>
                <div>
                  <dt>Цена</dt>
                  <dd>{selectedProduct.price} ₽</dd>
                </div>
                <div>
                  <dt>Остаток</dt>
                  <dd>{selectedProduct.stock}</dd>
                </div>
                <div>
                  <dt>Рейтинг</dt>
                  <dd>{selectedProduct.rating ?? "—"}</dd>
                </div>
              </dl>
            </article>

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
                <p className="muted-text">Отзывов пока нет.</p>
              ) : null}
            </article>

            <article className="product-detail-card">
              <h3>Последняя аналитика</h3>

              {selectedProduct.analytics.map((item) => (
                <div className="mini-list-item" key={item.id}>
                  <strong>{new Date(item.date).toLocaleDateString("ru-RU")}</strong>
                  <p>
                    Просмотры: {item.views}, заказы: {item.ordersCount},
                    выручка: {item.revenue} ₽
                  </p>
                </div>
              ))}

              {selectedProduct.analytics.length === 0 ? (
                <p className="muted-text">Аналитики пока нет.</p>
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
                <p className="muted-text">Рекомендаций пока нет.</p>
              ) : null}
            </article>
          </div>
        </PageSection>
      ) : null}
    </>
  );
}