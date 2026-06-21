import { useState } from "react";
import { AppLayout } from "./layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import "./styles/global.css";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  return (
    <AppLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === "dashboard" ? <DashboardPage /> : null}
      {currentPage !== "dashboard" ? (
        <p>Страница будет добавлена следующим шагом.</p>
      ) : null}
    </AppLayout>
  );
}

export default App;