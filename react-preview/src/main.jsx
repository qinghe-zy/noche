import React from "react";
import { createRoot } from "react-dom/client";
import PreviewApp from "../../example.jsx";

import "./preview.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PreviewApp />
  </React.StrictMode>,
);
