import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import './index.css';
import './i18n';

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <App />
    </Suspense>
  </BrowserRouter>
);