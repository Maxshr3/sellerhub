import { useCallback, useEffect, useState } from "react";
import { getCurrentUser } from "./api/authApi";
import { AppLayout } from "./layout/AppLayout";
import { AIAssistantPage } from "./pages/AIAssistantPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReviewsPage } from "./pages/ReviewsPage";
import "./styles/global.css";
import type { AuthUser } from "./types/auth";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "./utils/authStorage";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(Boolean(getStoredToken()));
  const [productToOpenId, setProductToOpenId] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();

    if (token) {
      getCurrentUser()
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          clearStoredToken();
          setUser(null);
        })
        .finally(() => {
          setIsCheckingAuth(false);
        });
    }
  }, []);

  function handleAuthSuccess(nextUser: AuthUser, token: string) {
    setStoredToken(token);
    setUser(nextUser);
    setCurrentPage("dashboard");
  }

  function handleLogout() {
    clearStoredToken();
    setUser(null);
    setCurrentPage("dashboard");
    setProductToOpenId(null);
  }

  const handleOpenProduct = useCallback((productId: string) => {
  setProductToOpenId(productId);
  setCurrentPage("products");
}, []);

const handleProductModalOpened = useCallback(() => {
  setProductToOpenId(null);
}, []);

  if (isCheckingAuth) {
    return (
      <div className="app-loading">
        <strong>SellerHUB</strong>
        <p>Проверяем авторизацию...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <AppLayout
      currentPage={currentPage}
      userName={user.name}
      avatarUrl={user.avatarUrl}
      accentColor={user.accentColor}
      onPageChange={setCurrentPage}
      onLogout={handleLogout}
    >
      {currentPage === "dashboard" ? (
        <DashboardPage onOpenProduct={handleOpenProduct} />
      ) : null}

      {currentPage === "products" ? (
        <ProductsPage
          productToOpenId={productToOpenId}
          onProductModalOpened={handleProductModalOpened}
        />
      ) : null}

      {currentPage === "reviews" ? (
        <ReviewsPage onOpenProduct={handleOpenProduct} />
      ) : null}

      {currentPage === "ai" ? <AIAssistantPage /> : null}

      {currentPage === "profile" ? (
        <ProfilePage
          user={user}
          onProfileUpdate={setUser}
          onLogout={handleLogout}
        />
      ) : null}
    </AppLayout>
  );
}

export default App;