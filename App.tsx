import React, { useState, useEffect } from 'react';
import Home from './apps/marketing/Home';
import AboutUs from './apps/marketing/AboutUs';
import Support from './apps/marketing/Support';
import TermsOfService from './apps/marketing/TermsOfService';
import PrivacyPolicy from './apps/marketing/PrivacyPolicy';
import Careers from './apps/marketing/Careers';
import ArtistDashboard from './apps/artist/Dashboard';
import AdminDashboard from './apps/admin/AdminDashboard';

import Login from './apps/auth/Login';
import Register from './apps/auth/Register';

type AppDomain = 'main' | 'artist' | 'admin' | 'login' | 'register' | 'about' | 'support' | 'terms' | 'privacy' | 'careers';

const App: React.FC = () => {
  // Simulating routing based on domain
  // In production, this would be determined by window.location.hostname
  const [currentDomain, setCurrentDomain] = useState<AppDomain>('main');

  // Simple visual switcher for demo purposes since we can't use real subdomains in this preview
  const renderApp = () => {
    switch (currentDomain) {
      case 'artist':
        return <ArtistDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'login':
        return <Login onNavigate={setCurrentDomain} />;
      case 'register':
        return <Register onNavigate={setCurrentDomain} />;
      case 'about':
        return <AboutUs onNavigate={setCurrentDomain} />;
      case 'support':
        return <Support onNavigate={setCurrentDomain} />;
      case 'terms':
        return <TermsOfService onNavigate={setCurrentDomain} />;
      case 'privacy':
        return <PrivacyPolicy onNavigate={setCurrentDomain} />;
      case 'careers':
        return <Careers onNavigate={setCurrentDomain} />;
      case 'main':
      default:
        return <Home onNavigate={setCurrentDomain} />;
    }
  };

  return (
    <>
      {renderApp()}

      {/* Dev Switcher - Floating Action Button to switch "Domains" */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {/* Main Navigation */}
        <div className="flex items-center gap-2 p-2 bg-black/90 backdrop-blur rounded-lg border border-white/10 shadow-2xl">
          <span className="text-xs text-slate-400 px-2">Apps:</span>
          <button
            onClick={() => setCurrentDomain('main')}
            className={`px-3 py-1 text-xs rounded font-medium ${currentDomain === 'main' ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentDomain('artist')}
            className={`px-3 py-1 text-xs rounded font-medium ${currentDomain === 'artist' ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
          >
            Artist
          </button>
          <button
            onClick={() => setCurrentDomain('admin')}
            className={`px-3 py-1 text-xs rounded font-medium ${currentDomain === 'admin' ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
          >
            Admin
          </button>
        </div>

        {/* Marketing Pages */}
        <div className="flex items-center gap-2 p-2 bg-black/90 backdrop-blur rounded-lg border border-white/10 shadow-2xl">
          <span className="text-xs text-slate-400 px-2">Pages:</span>
          <button
            onClick={() => setCurrentDomain('about')}
            className={`px-2 py-1 text-xs rounded font-medium ${currentDomain === 'about' ? 'bg-primary text-white' : 'text-slate-300 hover:bg-white/10'}`}
          >
            About
          </button>
          <button
            onClick={() => setCurrentDomain('support')}
            className={`px-2 py-1 text-xs rounded font-medium ${currentDomain === 'support' ? 'bg-primary text-white' : 'text-slate-300 hover:bg-white/10'}`}
          >
            Support
          </button>
          <button
            onClick={() => setCurrentDomain('terms')}
            className={`px-2 py-1 text-xs rounded font-medium ${currentDomain === 'terms' ? 'bg-primary text-white' : 'text-slate-300 hover:bg-white/10'}`}
          >
            Terms
          </button>
          <button
            onClick={() => setCurrentDomain('privacy')}
            className={`px-2 py-1 text-xs rounded font-medium ${currentDomain === 'privacy' ? 'bg-primary text-white' : 'text-slate-300 hover:bg-white/10'}`}
          >
            Privacy
          </button>
          <button
            onClick={() => setCurrentDomain('careers')}
            className={`px-2 py-1 text-xs rounded font-medium ${currentDomain === 'careers' ? 'bg-primary text-white' : 'text-slate-300 hover:bg-white/10'}`}
          >
            Careers
          </button>
        </div>
      </div>
    </>
  );
};

export default App;