import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import "./Sidebar.css";
import "./Navbar.css";
import "./Layout.css";

function Layout() {
  return (
    <div className="app-layout">

      <Sidebar />

      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>

    </div>
  );
}

export default Layout;