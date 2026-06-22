import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { answerReview, getReviews } from "../api/reviewsApi";
import { PageSection } from "../components/PageSection";
import type { Review, ReviewStatus, ReviewsResponse } from "../types/review";
import "./ReviewsPage.css";

type ReviewStatusFilter = ReviewStatus | "";

const statusLabels: Record<ReviewStatus, string> = {
  NEW: "Новый",
  ANSWERED: "Отвечен",
  ARCHIVED: "Архив",
};

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>("");
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [submittingReviewId, setSubmittingReviewId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  function loadReviews(status?: ReviewStatus) {
    setIsLoading(true);
    setErrorText("");
    setSuccessText("");

    getReviews(status)
      .then((response: ReviewsResponse) => {
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
      .then((response: ReviewsResponse) => {
        setReviews(response.data);
      })
      .catch(() => {
        setErrorText("Не удалось загрузить отзывы. Проверь backend.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function handleStatusChange(value: ReviewStatusFilter) {
    setStatusFilter(value);
    loadReviews(value || undefined);
  }

  function handleAnswerChange(reviewId: string, value: string) {
    setAnswerDrafts((currentDrafts) => ({
      ...currentDrafts,
      [reviewId]: value,
    }));
  }

  function handleAnswerSubmit(
    event: FormEvent<HTMLFormElement>,
    reviewId: string,
  ) {
    event.preventDefault();

    const answerText = answerDrafts[reviewId]?.trim() || "";

    if (answerText.length < 2) {
      setErrorText("Ответ должен содержать минимум 2 символа.");
      setSuccessText("");
      return;
    }

    setSubmittingReviewId(reviewId);
    setErrorText("");
    setSuccessText("");

    answerReview(reviewId, answerText)
      .then(() => {
        setAnswerDrafts((currentDrafts) => ({
          ...currentDrafts,
          [reviewId]: "",
        }));
        setSuccessText("Ответ на отзыв сохранён.");
        loadReviews(statusFilter || undefined);
      })
      .catch(() => {
        setErrorText("Не удалось сохранить ответ на отзыв.");
      })
      .finally(() => {
        setSubmittingReviewId("");
      });
  }

  return (
    <PageSection
      title="Отзывы"
      description="Обработка отзывов покупателей и быстрые ответы от имени продавца."
    >
      <div className="reviews-toolbar">
        <label className="reviews-filter">
          <span>Статус</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              handleStatusChange(event.target.value as ReviewStatusFilter)
            }
          >
            <option value="">Все отзывы</option>
            <option value="NEW">Новые</option>
            <option value="ANSWERED">Отвеченные</option>
            <option value="ARCHIVED">Архив</option>
          </select>
        </label>

        <button
          className="secondary-button"
          type="button"
          onClick={() => loadReviews(statusFilter || undefined)}
        >
          Обновить
        </button>
      </div>

      {isLoading ? <p>Загрузка отзывов...</p> : null}

      {errorText ? <p className="error-text">{errorText}</p> : null}

      {successText ? <p className="success-text">{successText}</p> : null}

      {!isLoading && !errorText ? (
        <div className="reviews-list">
          {reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-card__header">
                <div>
                  <h3>{review.product.title}</h3>
                  <p>
                    SKU: {review.product.sku} · {review.product.marketplaceName}
                  </p>
                </div>

                <span
                  className={`review-status review-status--${review.status.toLowerCase()}`}
                >
                  {statusLabels[review.status]}
                </span>
              </div>

              <div className="review-card__meta">
                <span>Автор: {review.authorName}</span>
                <span>Оценка: {review.rating}/5</span>
                <span>ID: {review.id.slice(0, 8)}</span>
              </div>

              <p className="review-card__text">{review.text}</p>

              {review.answerText ? (
                <div className="review-answer">
                  <strong>Ответ продавца:</strong>
                  <p>{review.answerText}</p>
                </div>
              ) : (
                <form
                  className="review-answer-form"
                  onSubmit={(event) => handleAnswerSubmit(event, review.id)}
                >
                  <textarea
                    placeholder="Напиши ответ покупателю..."
                    value={answerDrafts[review.id] || ""}
                    onChange={(event) =>
                      handleAnswerChange(review.id, event.target.value)
                    }
                  />

                  <button
                    className="primary-button"
                    disabled={submittingReviewId === review.id}
                    type="submit"
                  >
                    {submittingReviewId === review.id
                      ? "Сохраняю..."
                      : "Ответить"}
                  </button>
                </form>
              )}
            </article>
          ))}

          {reviews.length === 0 ? (
            <div className="empty-state">
              <strong>Отзывы не найдены</strong>
              <p>Попробуй выбрать другой статус.</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </PageSection>
  );
}