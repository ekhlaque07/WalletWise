import {
  BarChart3,
  LayoutDashboard,
  List,
  LogOut,
  Target,
  WalletCards,
  Bot,
  Calculator,
  ShieldCheck,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/transactions",
    label: "Transactions",
    icon: List,
  },
  {
    to: "/budgets",
    label: "Budgets",
    icon: WalletCards,
  },
  {
    to: "/goals",
    label: "Goals",
    icon: Target,
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    to: "/ai-advisor",
    label: "AI Advisor",
    icon: Bot,
  },
  {
    to: "/simulator",
    label: "What-If Simulator",
    icon: Calculator,
  },
  {
    to: "/agent",
    label: "AI Agent",
    icon: Bot,
  },
  {
    to: "/approvals",
    label: "AI Approvals",
    icon: ShieldCheck,
  },
];

function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-circle">W</div>
        <span>WalletWise</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">MAIN MENU</div>

        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Icon className="sidebar-icon" size={18} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button type="button" className="logout-button" onClick={logout}>
        <LogOut size={17} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;
