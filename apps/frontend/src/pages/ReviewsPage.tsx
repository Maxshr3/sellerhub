import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  answerReview,
  generateReviewAnswer,
  getReviews,
  updateReviewStatus,
} from "../api/reviewsApi";
import { PageSection } from "../components/PageSection";
import type {
  Review,
  ReviewFilters,
  ReviewPriority,
  ReviewStatus,
} from "../types/review";
import "./ReviewsPage.css";

const answerTemplates = [
  "Спасибо за отзыв! Мы рады, что товар вам понравился.",
  "Спасибо за обратную связь. Мы учтём ваше замечание и постараемся улучшить качество сервиса.",
  "Здравствуйте! Нам жаль, что покупка не полностью оправдала ожидания. Мы передадим информацию команде и проверим карточку товара.",
];

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [answerFilter, setAnswerFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  function buildFilters(): ReviewFilters {
    return {
      search: search.trim() || undefined,
      status: status ? (status as ReviewStatus) : undefined,
      priority: priority ? (priority as ReviewPriority) : undefined,
      ratingMax: ratingFilter === "negative" ? 3 : undefined,
      ratingMin: ratingFilter === "positive" ? 4 : undefined,
      hasAnswer:
        answerFilter === "answered"
          ? true
          : answerFilter === "without-answer"
            ? false
            : undefined,
    };
  }

  function loadReviews(filters?: ReviewFilters) {
    setIsLoading(true);
    setErrorText("");

    getReviews(filters)
      .then((response) => {
        setReviews(response.data);
      })
      .catch(() => {
        setErrorText("Не удалось загрузить отзывы. Проверь backend.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    getReviews()
      .then((response) => {
        setReviews(response.data);
      })
      .catch(() => {
        setErrorText("Не удалось загрузить отзывы. Проверь backend.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadReviews(buildFilters());
  }

  function handleResetFilters() {
    setSearch("");
    setStatus("");
    setPriority("");
    setRatingFilter("");
    setAnswerFilter("");
    loadReviews();
  }

  function handleQuickFilter(type: "negative" | "priority" | "new") {
    if (type === "negative") {
      setRatingFilter("negative");
      setPriority("");
      setStatus("");
      setAnswerFilter("");
      loadReviews({
        ratingMax: 3,
      });
    }

    if (type === "priority") {
      setPriority("HIGH");
      setRatingFilter("");
      setStatus("");
      setAnswerFilter("");
      loadReviews({
        priority: "HIGH",
      });
    }

    if (type === "new") {
      setStatus("NEW");
      setPriority("");
      setRatingFilter("");
      setAnswerFilter("");
      loadReviews({
        status: "NEW",
      });
    }
  }

  function handleSelectReview(review: Review) {
    setSelectedReview(review);
    setAnswerText(review.answerText ?? "");
    setSuccessText("");
    setErrorText("");
  }

  function handleTemplateClick(template: string) {
    setAnswerText(template);
  }

  function handleGenerateAiAnswer() {
    if (!selectedReview) {
      return;
    }

    setIsGeneratingAnswer(true);
    setErrorText("");
    setSuccessText("");

    generateReviewAnswer(selectedReview.id)
      .then((response) => {
        setAnswerText(response.data.suggestedAnswer);
        setSuccessText("AI подготовил черновик ответа.");
      })
      .catch(() => {
        setErrorText("Не удалось сгенерировать AI-ответ.");
      })
      .finally(() => {
        setIsGeneratingAnswer(false);
      });
  }

  function handleAnswerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedReview) {
      setErrorText("Сначала выбери отзыв.");
      return;
    }

    if (answerText.trim().length < 2) {
      setErrorText("Ответ должен содержать минимум 2 символа.");
      return;
    }

    setIsAnswering(true);
    setErrorText("");
    setSuccessText("");

    answerReview(selectedReview.id, answerText.trim())
      .then((response) => {
        setSelectedReview(response.data);
        setSuccessText("Ответ сохранён.");
        loadReviews(buildFilters());
      })
      .catch(() => {
        setErrorText("Не удалось сохранить ответ.");
      })
      .finally(() => {
        setIsAnswering(false);
      });
  }

  function handleArchiveReview(review: Review) {
    updateReviewStatus(review.id, "ARCHIVED")
      .then(() => {
        setSuccessText("Отзыв отправлен в архив.");
        if (selectedReview?.id === review.id) {
          setSelectedReview(null);
          setAnswerText("");
        }
        loadReviews(buildFilters());
      })
      .catch(() => {
        setErrorText("Не удалось архивировать отзыв.");
      });
  }

  function handleRestoreReview(review: Review) {
    updateReviewStatus(review.id, "NEW")
      .then((response) => {
        setSuccessText("Отзыв возвращён в новые.");
        setSelectedReview(response.data);
        loadReviews(buildFilters());
      })
      .catch(() => {
        setErrorText("Не удалось вернуть отзыв.");
      });
  }

  const highPriorityCount = reviews.filter(
    (review) => review.priority === "HIGH",
  ).length;
  const negativeCount = reviews.filter((review) => review.rating <= 3).length;
  const newCount = reviews.filter((review) => review.status === "NEW").length;

  return (
    <>
      <PageSection
        title="Reviews Management"
        description="Работа с отзывами: приоритеты, негатив, AI-ответы, шаблоны и статусы."
      >
        {errorText ? <p className="error-text">{errorText}</p> : null}
        {successText ? <p className="success-text">{successText}</p> : null}

        <div className="review-summary-grid">
          <button onClick={() => handleQuickFilter("priority")} type="button">
            <span>Высокий приоритет</span>
            <strong>{highPriorityCount}</strong>
          </button>
          <button onClick={() => handleQuickFilter("negative")} type="button">
            <span>Негативные</span>
            <strong>{negativeCount}</strong>
          </button>
          <button onClick={() => handleQuickFilter("new")} type="button">
            <span>Новые</span>
            <strong>{newCount}</strong>
          </button>
        </div>

        <form className="reviews-filters" onSubmit={handleFilterSubmit}>
          <label>
            <span>Поиск</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Текст, автор, товар или SKU"
            />
          </label>

          <label>
            <span>Статус</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Все</option>
              <option value="NEW">Новые</option>
              <option value="ANSWERED">С ответом</option>
              <option value="ARCHIVED">Архив</option>
            </select>
          </label>

          <label>
            <span>Приоритет</span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="">Все</option>
              <option value="HIGH">Высокий</option>
              <option value="MEDIUM">Средний</option>
              <option value="LOW">Низкий</option>
            </select>
          </label>

          <label>
            <span>Оценка</span>
            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
            >
              <option value="">Все</option>
              <option value="negative">Негативные 1–3</option>
              <option value="positive">Позитивные 4–5</option>
            </select>
          </label>

          <label>
            <span>Ответ</span>
            <select
              value={answerFilter}
              onChange={(event) => setAnswerFilter(event.target.value)}
            >
              <option value="">Все</option>
              <option value="without-answer">Без ответа</option>
              <option value="answered">С ответом</option>
            </select>
          </label>

          <div className="reviews-filter-actions">
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

      <div className="reviews-layout">
        <PageSection title="Список отзывов">
          {isLoading ? <p>Загрузка отзывов...</p> : null}

          <div className="reviews-list">
            {reviews.map((review) => (
              <article
                className={
                  selectedReview?.id === review.id
                    ? "review-card review-card--selected"
                    : "review-card"
                }
                key={review.id}
              >
                <div className="review-card__top">
                  <div>
                    <strong>{review.authorName}</strong>
                    <p>
                      {review.product.title} · {review.product.marketplaceName}
                    </p>
                  </div>

                  <div className="review-badges">
                    <span
                      className={`priority-badge priority-badge--${review.priority.toLowerCase()}`}
                    >
                      {review.priority}
                    </span>
                    <span className="rating-badge">{review.rating}/5</span>
                  </div>
                </div>

                <p className="review-text">{review.text}</p>

                {review.answerText ? (
                  <div className="review-answer-preview">
                    <strong>Ответ:</strong>
                    <p>{review.answerText}</p>
                  </div>
                ) : null}

                <div className="review-card__footer">
                  <span>{review.status}</span>

                  <div>
                    <button
                      className="secondary-button"
                      onClick={() => handleSelectReview(review)}
                      type="button"
                    >
                      Ответить
                    </button>

                    {review.status === "ARCHIVED" ? (
                      <button
                        className="secondary-button"
                        onClick={() => handleRestoreReview(review)}
                        type="button"
                      >
                        Вернуть
                      </button>
                    ) : (
                      <button
                        className="secondary-button"
                        onClick={() => handleArchiveReview(review)}
                        type="button"
                      >
                        Архив
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}

            {!isLoading && reviews.length === 0 ? (
              <div className="empty-state">
                <strong>Отзывы не найдены</strong>
                <p>Измени фильтры или синхронизируй маркетплейс.</p>
              </div>
            ) : null}
          </div>
        </PageSection>

        <PageSection
          title="Ответ на отзыв"
          description="Выбери отзыв слева, сгенерируй AI-черновик или используй шаблон."
        >
          {selectedReview ? (
            <div className="answer-panel">
              <div className="selected-review">
                <div className="review-card__top">
                  <div>
                    <strong>{selectedReview.authorName}</strong>
                    <p>{selectedReview.product.title}</p>
                  </div>
                  <span className="rating-badge">
                    {selectedReview.rating}/5
                  </span>
                </div>

                <p>{selectedReview.text}</p>
              </div>

              <div className="answer-templates">
                <h4>Быстрые шаблоны</h4>

                {answerTemplates.map((template) => (
                  <button
                    key={template}
                    onClick={() => handleTemplateClick(template)}
                    type="button"
                  >
                    {template}
                  </button>
                ))}
              </div>

              <form className="answer-form" onSubmit={handleAnswerSubmit}>
                <label>
                  <span>Текст ответа</span>
                  <textarea
                    value={answerText}
                    onChange={(event) => setAnswerText(event.target.value)}
                    rows={8}
                  />
                </label>

                <div className="answer-actions">
                  <button
                    className="secondary-button"
                    disabled={isGeneratingAnswer}
                    onClick={handleGenerateAiAnswer}
                    type="button"
                  >
                    {isGeneratingAnswer
                      ? "Генерирую..."
                      : "Сгенерировать AI-ответ"}
                  </button>

                  <button
                    className="primary-button"
                    disabled={isAnswering}
                    type="submit"
                  >
                    {isAnswering ? "Сохраняю..." : "Сохранить ответ"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="empty-state">
              <strong>Отзыв не выбран</strong>
              <p>Нажми “Ответить” у нужного отзыва.</p>
            </div>
          )}
        </PageSection>
      </div>
    </>
  );
}