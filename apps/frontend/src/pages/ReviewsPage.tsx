import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  answerReview,
  generateReviewAnswer,
  getReviews,
  updateReviewStatus,
} from "../api/reviewsApi";
import { AlertMessage } from "../components/AlertMessage";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PageSection } from "../components/PageSection";
import { StatusBadge } from "../components/StatusBadge";
import type {
  Review,
  ReviewFilters,
  ReviewPriority,
  ReviewStatus,
} from "../types/review";
import "./ReviewsPage.css";

type ReviewsPageProps = {
  onOpenProduct: (productId: string) => void;
};

const statusLabels = {
  NEW: "Новый",
  ANSWERED: "Отвечен",
  ARCHIVED: "Архив",
};

const priorityLabels = {
  HIGH: "Высокий",
  MEDIUM: "Средний",
  LOW: "Низкий",
};

function getPriorityTone(priority: ReviewPriority) {
  if (priority === "HIGH") return "danger";
  if (priority === "MEDIUM") return "warning";
  return "neutral";
}

function getStatusTone(status: ReviewStatus) {
  if (status === "ANSWERED") return "success";
  if (status === "ARCHIVED") return "neutral";
  return "info";
}

export function ReviewsPage({ onOpenProduct }: ReviewsPageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [answerFilter, setAnswerFilter] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  const newReviewsCount = reviews.filter((review) => review.status === "NEW").length;
  const highPriorityCount = reviews.filter(
    (review) => review.priority === "HIGH",
  ).length;
  const unansweredCount = reviews.filter((review) => !review.answerText).length;
  const negativeCount = reviews.filter((review) => review.rating <= 3).length;

  function buildFilters(): ReviewFilters {
    return {
      search: search.trim() || undefined,
      status: statusFilter ? (statusFilter as ReviewStatus) : undefined,
      priority: priorityFilter
        ? (priorityFilter as ReviewPriority)
        : undefined,
      ratingMax: ratingFilter === "bad" ? 3 : undefined,
      ratingMin: ratingFilter === "good" ? 4 : undefined,
      hasAnswer:
        answerFilter === "answered"
          ? true
          : answerFilter === "unanswered"
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

  function handleFiltersSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadReviews(buildFilters());
  }

  function handleResetFilters() {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setRatingFilter("");
    setAnswerFilter("");
    loadReviews();
  }

  function handleQuickFilter(filters: ReviewFilters) {
    setSearch("");
    setStatusFilter(filters.status ?? "");
    setPriorityFilter(filters.priority ?? "");
    setRatingFilter(filters.ratingMax === 3 ? "bad" : "");
    setAnswerFilter(
      filters.hasAnswer === true
        ? "answered"
        : filters.hasAnswer === false
          ? "unanswered"
          : "",
    );

    loadReviews(filters);
  }

  function handleSelectReview(review: Review) {
    setSelectedReview(review);
    setAnswerText(review.answerText ?? "");
    setAiSuggestion("");
    setErrorText("");
    setSuccessText("");
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
        setAiSuggestion(response.data.suggestedAnswer);
        setAnswerText(response.data.suggestedAnswer);
        setSuccessText("AI подготовил вариант ответа.");
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
      return;
    }

    if (answerText.trim().length < 2) {
      setErrorText("Ответ должен содержать минимум 2 символа.");
      return;
    }

    setIsSavingAnswer(true);
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
        setIsSavingAnswer(false);
      });
  }

  function handleArchiveReview(review: Review) {
    updateReviewStatus(review.id, "ARCHIVED")
      .then((response) => {
        setSelectedReview(response.data);
        setSuccessText("Отзыв отправлен в архив.");
        loadReviews(buildFilters());
      })
      .catch(() => {
        setErrorText("Не удалось отправить отзыв в архив.");
      });
  }

  function handleRestoreReview(review: Review) {
    updateReviewStatus(review.id, "NEW")
      .then((response) => {
        setSelectedReview(response.data);
        setSuccessText("Отзыв возвращён в работу.");
        loadReviews(buildFilters());
      })
      .catch(() => {
        setErrorText("Не удалось вернуть отзыв.");
      });
  }

  return (
    <>
      <PageSection
        title="Reviews"
        description="Работа с отзывами покупателей: фильтрация, приоритеты, AI-ответы и архивирование."
      >
        <div className="page-message-stack">
          {errorText ? <AlertMessage type="error">{errorText}</AlertMessage> : null}
          {successText ? (
            <AlertMessage type="success">{successText}</AlertMessage>
          ) : null}
        </div>

        <div className="reviews-summary">
          <button
            className="reviews-summary-card"
            onClick={() => handleQuickFilter({ status: "NEW" })}
            type="button"
          >
            <span>Новые</span>
            <strong>{newReviewsCount}</strong>
          </button>

          <button
            className="reviews-summary-card"
            onClick={() => handleQuickFilter({ priority: "HIGH" })}
            type="button"
          >
            <span>Высокий приоритет</span>
            <strong>{highPriorityCount}</strong>
          </button>

          <button
            className="reviews-summary-card"
            onClick={() => handleQuickFilter({ hasAnswer: false })}
            type="button"
          >
            <span>Без ответа</span>
            <strong>{unansweredCount}</strong>
          </button>

          <button
            className="reviews-summary-card"
            onClick={() => handleQuickFilter({ ratingMax: 3 })}
            type="button"
          >
            <span>Негативные</span>
            <strong>{negativeCount}</strong>
          </button>
        </div>
      </PageSection>

      <PageSection
        title="Фильтры отзывов"
        description="Можно быстро найти негативные отзывы, новые обращения или отзывы без ответа."
      >
        <form className="reviews-filters" onSubmit={handleFiltersSubmit}>
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
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Все</option>
              <option value="NEW">Новые</option>
              <option value="ANSWERED">Отвеченные</option>
              <option value="ARCHIVED">Архив</option>
            </select>
          </label>

          <label>
            <span>Приоритет</span>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
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
              <option value="bad">1–3</option>
              <option value="good">4–5</option>
            </select>
          </label>

          <label>
            <span>Ответ</span>
            <select
              value={answerFilter}
              onChange={(event) => setAnswerFilter(event.target.value)}
            >
              <option value="">Все</option>
              <option value="answered">С ответом</option>
              <option value="unanswered">Без ответа</option>
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

      <div className="reviews-workspace">
        <PageSection title="Список отзывов">
          {isLoading ? (
            <LoadingState title="Загрузка отзывов..." rows={5} />
          ) : null}

          {!isLoading && reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review) => (
                <article
                  className={
                    selectedReview?.id === review.id
                      ? "review-card review-card--active"
                      : "review-card"
                  }
                  key={review.id}
                >
                  <button
                    className="review-card__main"
                    onClick={() => handleSelectReview(review)}
                    type="button"
                  >
                    <div className="review-card__top">
                      <div>
                        <h3>{review.product.title}</h3>
                        <span>
                          {review.product.marketplaceName} · {review.product.sku}
                        </span>
                      </div>

                      <strong>{review.rating}/5</strong>
                    </div>

                    <p>{review.text}</p>

                    <footer>
                      <span>{review.authorName}</span>
                      <span>{new Date(review.createdAt).toLocaleDateString("ru-RU")}</span>
                    </footer>
                  </button>

                  <div className="review-card__badges">
                    <StatusBadge tone={getStatusTone(review.status)}>
                      {statusLabels[review.status]}
                    </StatusBadge>

                    <StatusBadge tone={getPriorityTone(review.priority)}>
                      {priorityLabels[review.priority]}
                    </StatusBadge>

                    {!review.answerText ? (
                      <StatusBadge tone="warning">Без ответа</StatusBadge>
                    ) : (
                      <StatusBadge tone="success">Ответ есть</StatusBadge>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {!isLoading && reviews.length === 0 ? (
            <EmptyState
              title="Отзывы не найдены"
              description="Измени фильтры, синхронизируй маркетплейсы или дождись новых отзывов покупателей."
            />
          ) : null}
        </PageSection>

        <PageSection
          title="Карточка отзыва"
          description="Выбери отзыв слева, чтобы подготовить ответ или изменить статус."
        >
          {!selectedReview ? (
            <EmptyState
              title="Отзыв не выбран"
              description="Нажми на любой отзыв в списке, чтобы открыть его подробности."
            />
          ) : null}

          {selectedReview ? (
            <div className="review-detail">
              <div className="review-detail__header">
                <div>
                  <h3>{selectedReview.product.title}</h3>
                  <p>
                    {selectedReview.product.marketplaceName} ·{" "}
                    {selectedReview.product.marketplaceType} ·{" "}
                    {selectedReview.product.sku}
                  </p>
                </div>

                <div className="review-detail__rating">
                  {selectedReview.rating}/5
                </div>
              </div>

              <div className="review-detail__badges">
                <StatusBadge tone={getStatusTone(selectedReview.status)}>
                  {statusLabels[selectedReview.status]}
                </StatusBadge>

                <StatusBadge tone={getPriorityTone(selectedReview.priority)}>
                  {priorityLabels[selectedReview.priority]}
                </StatusBadge>
              </div>

              <article className="review-message">
                <span>Отзыв покупателя</span>
                <p>{selectedReview.text}</p>
                <footer>
                  {selectedReview.authorName} ·{" "}
                  {new Date(selectedReview.createdAt).toLocaleString("ru-RU")}
                </footer>
              </article>

              {selectedReview.answerText ? (
                <article className="review-message review-message--answer">
                  <span>Текущий ответ</span>
                  <p>{selectedReview.answerText}</p>
                </article>
              ) : null}

              {aiSuggestion ? (
                <article className="review-message review-message--ai">
                  <span>AI-предложение</span>
                  <p>{aiSuggestion}</p>
                </article>
              ) : null}

              <form className="review-answer-form" onSubmit={handleAnswerSubmit}>
                <label>
                  <span>Ответ продавца</span>
                  <textarea
                    value={answerText}
                    onChange={(event) => setAnswerText(event.target.value)}
                    placeholder="Напиши ответ покупателю или сгенерируй AI-вариант"
                    rows={7}
                  />
                </label>

                <div className="review-detail__actions">
                    <button
  className="secondary-button"
  onClick={() => onOpenProduct(selectedReview.product.id)}
  type="button"
>
  Открыть товар
</button>

                  <button
                    className="secondary-button"
                    disabled={isGeneratingAnswer}
                    onClick={handleGenerateAiAnswer}
                    type="button"
                  >
                    {isGeneratingAnswer ? "Генерирую..." : "AI-ответ"}
                  </button>

                  <button
                    className="primary-button"
                    disabled={isSavingAnswer}
                    type="submit"
                  >
                    {isSavingAnswer ? "Сохраняю..." : "Сохранить ответ"}
                  </button>

                  {selectedReview.status !== "ARCHIVED" ? (
                    <button
                      className="secondary-button"
                      onClick={() => handleArchiveReview(selectedReview)}
                      type="button"
                    >
                      В архив
                    </button>
                  ) : (
                    <button
                      className="secondary-button"
                      onClick={() => handleRestoreReview(selectedReview)}
                      type="button"
                    >
                      Вернуть в работу
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : null}
        </PageSection>
      </div>
    </>
  );
}