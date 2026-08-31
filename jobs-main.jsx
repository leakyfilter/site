import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import JobBoard from "./components/JobBoard.jsx";
import "./site.css";

function JobBoardApp() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || "dark");
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { window.localStorage.setItem("leaky-theme", next); } catch {}
  }
  return <div className="app-shell"><header className="site-header"><div className="page-shell header-inner"><a className="brand" href="../">leaky.dev</a><button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>{theme === "dark" ? "Light" : "Dark"}</button></div></header><JobBoard /></div>;
}

createRoot(document.getElementById("root")).render(<JobBoardApp />);
