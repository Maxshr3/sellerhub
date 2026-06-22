import { useEffect, useState } from "react";
import { getProducts } from "../api/productsApi";
import { PageSection } from "../components/PageSection";
import type { Product } from "../types/product";
import "./ProductsPage.css";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  function loadProducts(searchValue?: string) {
    setIsLoading(true);
    setErrorText("");

    getProducts(searchValue)
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
  }, []);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadProducts(search.trim());
  }

  function handleResetSearch() {
    setSearch("");
    loadProducts();
  }

  return (
    <PageSection
      title="Товары"
      description="Список товаров селлера с ценой, остатками, рейтингом и статусом."
    >
      <form className="products-toolbar" onSubmit={handleSearchSubmit}>
        <input
          className="products-search"
          placeholder="Поиск по названию товара..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button className="primary-button" type="submit">
          Найти
        </button>

        <button
          className="secondary-button"
          type="button"
          onClick={handleResetSearch}
        >
          Сбросить
        </button>
      </form>

      {isLoading ? <p>Загрузка товаров...</p> : null}

      {errorText ? <p className="error-text">{errorText}</p> : null}

      {!isLoading && !errorText ? (
        <div className="products-card">
          <div className="products-card__header">
            <strong>Всего товаров: {products.length}</strong>
          </div>

          <table>
            <thead>
              <tr>
                <th>Товар</th>
                <th>SKU</th>
                <th>Цена</th>
                <th>Остаток</th>
                <th>Рейтинг</th>
                <th>Маркетплейс</th>
                <th>Статус</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-title-cell">
                      <strong>{product.title}</strong>
                      <span>ID: {product.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td>{product.sku}</td>
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
                  <td>{product.marketplaceName}</td>
                  <td>
                    <span
                      className={
                        product.isActive
                          ? "status-badge status-badge--active"
                          : "status-badge status-badge--inactive"
                      }
                    >
                      {product.isActive ? "Активен" : "Неактивен"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 ? (
            <div className="empty-state">
              <strong>Товары не найдены</strong>
              <p>Попробуй изменить поисковый запрос.</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </PageSection>
  );
}