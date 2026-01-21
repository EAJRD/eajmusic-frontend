import React, { useState, useEffect } from 'react';
import Home from './apps/marketing/Home';
import ArtistDashboard from './apps/artist/Dashboard';
import AdminDashboard from './apps/admin/AdminDashboard';

type AppDomain = 'main' | 'artist' | 'admin';

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
      case 'main':
      default:
        return <Home onNavigate={setCurrentDomain} />;
    }
  };

  return (
    <>
      {renderApp()}
      
      {/* Dev Switcher - Floating Action Button to switch "Domains" */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2 p-2 bg-black/80 backdrop-blur rounded-lg border border-white/10 shadow-2xl">
        <span className="text-xs text-gray-400 flex items-center px-2">Dev Switcher:</span>
        <button 
          onClick={() => setCurrentDomain('main')}
          className={`px-3 py-1 text-xs rounded font-medium ${currentDomain === 'main' ? 'bg-brand-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}
        >
          Main
        </button>
        <button 
          onClick={() => setCurrentDomain('artist')}
          className={`px-3 py-1 text-xs rounded font-medium ${currentDomain === 'artist' ? 'bg-brand-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}
        >
          Artist
        </button>
        <button 
          onClick={() => setCurrentDomain('admin')}
          className={`px-3 py-1 text-xs rounded font-medium ${currentDomain === 'admin' ? 'bg-brand-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}
        >
          Admin
        </button>
      </div>
    </>
  );
};

export default App;