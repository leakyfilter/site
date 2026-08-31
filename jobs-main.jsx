import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import JobBoard from "./components/JobBoard.jsx";

function JobBoardApp() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || "light");
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { window.localStorage.setItem("jobs-theme", next); } catch {}
  }
  return <JobBoard theme={theme} onToggleTheme={toggleTheme} />;
}

createRoot(document.getElementById("root")).render(<JobBoardApp />);
