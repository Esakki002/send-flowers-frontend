import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Home from './pages/Home';
import { ThemeProvider } from './context/ThemeContext';

const Receiver = lazy(() => import('./pages/Receiver'));

// Helper component to sync URL language prefix with i18n
const LanguageSync: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Expected URL: /en/... or /ta/...
  const match = location.pathname.match(/^\/(en|ta)(\/|$)/);
  const lang = match ? match[1] : 'en';
  React.useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <Router>
          <LanguageSync>
            <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center" />}>
              <Routes>
                {/* Home Landing Pages */}
                <Route path="/" element={<Home />} />
                <Route path="/en" element={<Home />} />
                <Route path="/ta" element={<Home />} />

                {/* Receiver Pages (both legacy /c/:id and simple /:id, e.g. /sandal) */}
                <Route path="/c/:id" element={<Receiver />} />
                <Route path="/:lang/c/:id" element={<Receiver />} />
                <Route path="/:id" element={<Receiver />} />

                {/* Fallback to redirect unknown routes to / */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </LanguageSync>
        </Router>
      </I18nextProvider>
    </ThemeProvider>
  );
};

export default App;
