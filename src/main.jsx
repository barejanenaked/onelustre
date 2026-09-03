import React from "react";
import ReactDOM from "react-dom/client";
import { installStorageShim } from "./storageShim.js";
import App from "./App.jsx";
import "./index.css";

// Must run before App mounts, since App reads window.storage on first render.
installStorageShim();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
