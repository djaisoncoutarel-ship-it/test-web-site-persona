import React from "react";
import ReactDOM from "react-dom/client";
/* Polices embarquées en local (Fontsource, subset latin) — aucun appel réseau */
import "@fontsource/anton/latin-400.css";
import "@fontsource/special-elite/latin-400.css";
import "@fontsource/barlow/latin-400.css";
import "@fontsource/barlow/latin-500.css";
import "@fontsource/barlow/latin-600.css";
import "@fontsource/barlow/latin-700.css";
import "@fontsource/barlow/latin-800.css";
import "@fontsource/barlow/latin-400-italic.css";
import "@fontsource/barlow/latin-600-italic.css";
import "./index.css";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
