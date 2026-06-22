import { useState } from "react";
import { AppLayout } from "./layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import "./styles/global.css";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  return (
    <AppLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === "dashboard" ? <DashboardPage /> : null}
      {currentPage === "products" ? <ProductsPage /> : null}
      {currentPage === "reviews" ? (
        <p>Reviews Page будет добавлена следующим шагом.</p>
      ) : null}
      {currentPage === "ai" ? (
        <p>AI Assistant Page будет добавлена следующим шагом.</p>
      ) : null}
    </AppLayout>
  );
}

export default App;