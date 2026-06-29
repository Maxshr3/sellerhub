import { useEffect, useState } from "react";
import { getCurrentUser } from "./api/authApi";
import { NotificationsPage } from "./pages/NotificationsPage";
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
  }

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
      {currentPage === "dashboard" ? <DashboardPage /> : null}
      {currentPage === "products" ? <ProductsPage /> : null}
      {currentPage === "reviews" ? <ReviewsPage /> : null}
      {currentPage === "ai" ? <AIAssistantPage /> : null}
      {currentPage === "notifications" ? <NotificationsPage /> : null}
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