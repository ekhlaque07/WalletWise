
import { useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  List,
  WalletCards,
  Target,
  BarChart3,
  LogOut,
  Bot,
  Calculator,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const links = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/transactions", "Transactions", List],
  ["/budgets", "Budgets", WalletCards],
  ["/goals", "Goals", Target],
  ["/analytics", "Analytics", BarChart3],
  ["/ai-advisor", "AI Advisor", Bot],
  ["/simulator", "What-If Simulator", Calculator],
  ["/agent", "AI Agent", Bot],
  ["/approvals", "AI Approvals", Bot],
];

function Navbar() {
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const displayName =
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "User";

  const initial = displayName.charAt(0).toUpperCase();

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="navbar">
        <div className="navbar-left">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>

          <span className="navbar-title">
            Personal Finance
          </span>
        </div>

        <div className="navbar-right">
          {/* Notification */}
          <div className="notification-button">
            <NotificationBell />
          </div>

          {/* Profile */}
          <div className="profile">

            {/* ONLY THIS AVATAR IS CLICKABLE */}
            <button
              type="button"
              className="profile-avatar profile-avatar-button"
              onClick={() => navigate("/profile")}
              title="Profile & Settings"
              aria-label="Open Profile & Settings"
            >
              {initial}
            </button>

            {/* Username remains normal text */}
            <div className="profile-info">
              <span className="profile-name">
                {displayName}
              </span>

              <span className="profile-role">
                Personal Account
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION */}
      {menuOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={closeMenu}
        >
          <aside
            className="mobile-nav"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-nav-header">
              <div className="mobile-nav-logo">
                <div className="logo-circle">W</div>
                <span>WalletWise</span>
              </div>

              <button
                className="mobile-close-button"
                onClick={closeMenu}
                aria-label="Close navigation"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="mobile-nav-links">
              {links.map(([to, label, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `mobile-nav-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <button
              className="mobile-logout"
              onClick={() => {
                logout();
                closeMenu();
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </aside>
        </div>
      )}
    </>
  );
}

export default Navbar;
