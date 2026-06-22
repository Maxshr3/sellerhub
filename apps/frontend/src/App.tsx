import { useState } from "react";
import { AppLayout } from "./layout/AppLayout";
import { AIAssistantPage } from "./pages/AIAssistantPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import "./styles/global.css";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  return (
    <AppLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === "dashboard" ? <DashboardPage /> : null}
      {currentPage === "products" ? <ProductsPage /> : null}
      {currentPage === "reviews" ? <ReviewsPage /> : null}
      {currentPage === "ai" ? <AIAssistantPage /> : null}
    </AppLayout>
  );
}

export default App;