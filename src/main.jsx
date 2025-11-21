import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { MenuProvider } from "./context/MenuContext.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MenuProvider>
        <div className="app-root">
          <div className="main-shell">
            <App />
          </div>
        </div>
      </MenuProvider>
    </BrowserRouter>
  </React.StrictMode>
);
