import React from "react";
import { createRoot } from "react-dom/client";
import Site from "./site.jsx";
import "./site.css";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Site />);
