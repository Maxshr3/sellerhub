import type { ReactNode } from "react";
import "./AppLayout.css";

type AppLayoutProps = {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
};

const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "products", label: "Products" },
  { id: "reviews", label: "Reviews" },
  { id: "ai", label: "AI Assistant" },
];

export function AppLayout({
  children,
  currentPage,
  onPageChange,
}: AppLayoutProps) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__logo">
          <span className="sidebar__logo-mark">S</span>
          <div>
            <strong>SellerHUB</strong>
            <small>Marketplace OS</small>
          </div>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <button
              className={
                currentPage === item.id
                  ? "sidebar__nav-item sidebar__nav-item--active"
                  : "sidebar__nav-item"
              }
              key={item.id}
              onClick={() => onPageChange(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="topbar__eyebrow">Seller analytics platform</p>
            <h1>SellerHUB Dashboard</h1>
          </div>
          <div className="topbar__user">Demo Seller</div>
        </header>

        <section className="content">{children}</section>
      </main>
    </div>
  );
}