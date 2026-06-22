import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  applyAIRecommendation,
  getAIRecommendations,
  sendAIChatMessage,
} from "../api/aiApi";
import { PageSection } from "../components/PageSection";
import type {
  AIRecommendation,
  AIRecommendationsResponse,
  AIRecommendationType,
  ChatResponse,
} from "../types/ai";
import "./AIAssistantPage.css";

type AITypeFilter = AIRecommendationType | "";

const recommendationTypeLabels: Record<AIRecommendationType, string> = {
  PRICE: "Цена",
  STOCK: "Остатки",
  SEO: "SEO",
  REVIEW_REPLY: "Отзывы",
  GENERAL: "Общее",
};

export function AIAssistantPage() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    [],
  );
  const [typeFilter, setTypeFilter] = useState<AITypeFilter>("");
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [applyingId, setApplyingId] = useState("");
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  function loadRecommendations(type?: AIRecommendationType) {
    setIsLoadingRecommendations(true);
    setErrorText("");
    setSuccessText("");

    getAIRecommendations(type)
      .then((response: AIRecommendationsResponse) => {
        setRecommendations(response.data);
      })
      .catch(() => {
        setErrorText("Не удалось загрузить AI-рекомендации. Проверь backend.");
      })
      .finally(() => {
        setIsLoadingRecommendations(false);
      });
  }

  useEffect(() => {
    getAIRecommendations()
      .then((response: AIRecommendationsResponse) => {
        setRecommendations(response.data);
      })
      .catch(() => {
        setErrorText("Не удалось загрузить AI-рекомендации. Проверь backend.");
      })
      .finally(() => {
        setIsLoadingRecommendations(false);
      });
  }, []);

  function handleTypeChange(value: AITypeFilter) {
    setTypeFilter(value);
    loadRecommendations(value || undefined);
  }

  function handleApplyRecommendation(id: string) {
    setApplyingId(id);
    setErrorText("");
    setSuccessText("");

    applyAIRecommendation(id)
      .then(() => {
        setSuccessText("AI-рекомендация отмечена как применённая.");
        loadRecommendations(typeFilter || undefined);
      })
      .catch(() => {
        setErrorText("Не удалось применить AI-рекомендацию.");
      })
      .finally(() => {
        setApplyingId("");
      });
  }

  function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = chatPrompt.trim();

    if (prompt.length < 2) {
      setErrorText("Сообщение должно содержать минимум 2 символа.");
      setSuccessText("");
      return;
    }

    setIsChatLoading(true);
    setErrorText("");
    setSuccessText("");
    setChatAnswer("");

    sendAIChatMessage(prompt)
      .then((response: ChatResponse) => {
        setChatAnswer(response.data.response);
      })
      .catch(() => {
        setErrorText("Не удалось получить ответ AI Assistant.");
      })
      .finally(() => {
        setIsChatLoading(false);
      });
  }

  return (
    <>
      <PageSection
        title="AI Assistant"
        description="Mock-AI помощник для рекомендаций по товарам, остаткам, отзывам и карточкам."
      >
        <div className="ai-grid">
          <div className="ai-panel">
            <div className="ai-panel__header">
              <div>
                <h3>AI-рекомендации</h3>
                <p>Список рекомендаций, сохранённых в backend.</p>
              </div>

              <label className="ai-filter">
                <span>Тип</span>
                <select
                  value={typeFilter}
                  onChange={(event) =>
                    handleTypeChange(event.target.value as AITypeFilter)
                  }
                >
                  <option value="">Все типы</option>
                  <option value="PRICE">Цена</option>
                  <option value="STOCK">Остатки</option>
                  <option value="SEO">SEO</option>
                  <option value="REVIEW_REPLY">Отзывы</option>
                  <option value="GENERAL">Общее</option>
                </select>
              </label>
            </div>

            {isLoadingRecommendations ? (
              <p>Загрузка AI-рекомендаций...</p>
            ) : null}

            {errorText ? <p className="error-text">{errorText}</p> : null}

            {successText ? <p className="success-text">{successText}</p> : null}

            {!isLoadingRecommendations ? (
              <div className="recommendations-list">
                {recommendations.map((recommendation) => (
                  <article
                    className="recommendation-card"
                    key={recommendation.id}
                  >
                    <div className="recommendation-card__header">
                      <span className="recommendation-type">
                        {recommendationTypeLabels[recommendation.type]}
                      </span>

                      <span
                        className={
                          recommendation.isApplied
                            ? "apply-status apply-status--done"
                            : "apply-status"
                        }
                      >
                        {recommendation.isApplied
                          ? "Применена"
                          : "Не применена"}
                      </span>
                    </div>

                    <h4>{recommendation.title}</h4>
                    <p>{recommendation.content}</p>

                    <div className="recommendation-product">
                      <strong>{recommendation.product.title}</strong>
                      <span>
                        SKU: {recommendation.product.sku} · Остаток:{" "}
                        {recommendation.product.stock}
                      </span>
                    </div>

                    <button
                      className="primary-button"
                      disabled={
                        recommendation.isApplied ||
                        applyingId === recommendation.id
                      }
                      onClick={() =>
                        handleApplyRecommendation(recommendation.id)
                      }
                      type="button"
                    >
                      {applyingId === recommendation.id
                        ? "Применяю..."
                        : recommendation.isApplied
                          ? "Уже применена"
                          : "Применить"}
                    </button>
                  </article>
                ))}

                {recommendations.length === 0 ? (
                  <div className="empty-state">
                    <strong>Рекомендации не найдены</strong>
                    <p>Попробуй выбрать другой тип.</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="ai-panel">
            <div className="ai-panel__header">
              <div>
                <h3>AI Chat</h3>
                <p>Задай вопрос mock-AI помощнику.</p>
              </div>
            </div>

            <form className="ai-chat-form" onSubmit={handleChatSubmit}>
              <textarea
                placeholder="Например: Что делать с остатками на складе?"
                value={chatPrompt}
                onChange={(event) => setChatPrompt(event.target.value)}
              />

              <button
                className="primary-button"
                disabled={isChatLoading}
                type="submit"
              >
                {isChatLoading ? "Думаю..." : "Спросить AI"}
              </button>
            </form>

            {chatAnswer ? (
              <div className="ai-chat-answer">
                <strong>Ответ AI Assistant:</strong>
                <p>{chatAnswer}</p>
              </div>
            ) : (
              <div className="ai-chat-hints">
                <strong>Примеры вопросов:</strong>
                <ul>
                  <li>Что делать с остатками на складе?</li>
                  <li>Как улучшить карточку товара?</li>
                  <li>Как отвечать на отзывы?</li>
                  <li>Когда стоит делать скидку?</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </PageSection>
    </>
  );
}