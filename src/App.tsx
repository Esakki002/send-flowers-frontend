import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Home from './pages/Home';
import Receiver from './pages/Receiver';

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
    <I18nextProvider i18n={i18n}>
      <Router>
        <LanguageSync>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:lang" element={<Home />} />
            <Route path="/c/:id" element={<Receiver />} />
            {/* Fallback to redirect unknown language prefixes to / */}
            <Route path="/:lang/*" element={<Navigate to='/' replace />} />
          </Routes>
        </LanguageSync>
      </Router>
    </I18nextProvider>
  );
};

export default App;

