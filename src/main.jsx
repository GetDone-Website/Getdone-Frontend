import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Urutan impor sama dengan urutan <link> di versi HTML (style.css digantikan globals.css hasil Tailwind).
import "./styles/globals.css"; // Tailwind (token tema + utilitas)
import "./styles/features.css";
import "./styles/transition.css";
import "./styles/spacing-fix.css";
import "./styles/react-overrides.css";
import "./styles/dark.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
