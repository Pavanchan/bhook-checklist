import { Routes, Route, useLocation } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen.jsx";
import UploadMenu from "./pages/UploadMenu.jsx";
import ChecklistPage from "./pages/ChecklistPage.jsx";

const AppHeader = () => (
  <header className="header">
    <div className="brand">
      <div className="brand-logo">B</div>
      <div>
        <div className="brand-text-title">BHOOK</div>
        <div className="tagline">Chemical free food experience</div>
      </div>
    </div>
    <button
      className="btn-ghost"
      onClick={() => window.open("#", "_blank")}
      type="button"
    >
      Food Check-List Console
    </button>
  </header>
);

export default function App() {
  const location = useLocation();
  const showHeader = location.pathname !== "/"; // hide on splash

  return (
    <>
      {showHeader && <AppHeader />}

      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/upload" element={<UploadMenu />} />
        <Route path="/checklist" element={<ChecklistPage />} />
      </Routes>
    </>
  );
}
