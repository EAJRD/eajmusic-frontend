import React from 'react';
import { Logo } from '../../components/Icons';

interface HomeProps {
  onNavigate: (domain: 'main' | 'artist' | 'admin') => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="border-b border-dark-800 bg-dark-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Logo className="text-brand-500 w-8 h-8" />
              <span className="text-2xl font-bold tracking-tighter text-white">EAJMUSIC</span>
            </div>
            <div className="hidden md:flex gap-8 text-gray-300 text-sm font-medium">
              <a href="#" className="hover:text-brand-400 transition-colors">Distribution</a>
              <a href="#" className="hover:text-brand-400 transition-colors">Pricing</a>
              <a href="#" className="hover:text-brand-400 transition-colors">Blog</a>
              <a href="#" className="hover:text-brand-400 transition-colors">Support</a>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => onNavigate('artist')}
                className="text-gray-300 hover:text-white text-sm font-medium px-4 py-2"
              >
                Log In
              </button>
              <button 
                onClick={() => onNavigate('artist')}
                className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold px-6 py-2 rounded-full transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="relative isolate overflow-hidden pt-14">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.brand.900),theme(colors.dark.950))] opacity-40"></div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6">
              Sell your music to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-500">
                Spotify, Apple Music, and more.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-400 max-w-2xl mx-auto">
              Keep 100% of your earnings. Unlimited uploads. Get discovered by millions of fans worldwide with the industry's fastest distribution service.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button 
                onClick={() => onNavigate('artist')}
                className="rounded-full bg-brand-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all transform hover:scale-105"
              >
                Get Started Free
              </button>
              <a href="#" className="text-sm font-semibold leading-6 text-white hover:text-brand-300">
                View Pricing <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Stats / Social Proof */}
          <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
            <div className="grid grid-cols-1 gap-y-16 gap-x-8 lg:grid-cols-3 text-center border-t border-dark-800 pt-16">
              <div className="flex flex-col gap-y-4">
                <dt className="text-base leading-7 text-gray-400">Artists Trusted</dt>
                <dd className="text-5xl font-bold tracking-tight text-white">100k+</dd>
              </div>
              <div className="flex flex-col gap-y-4">
                <dt className="text-base leading-7 text-gray-400">Royalties Paid</dt>
                <dd className="text-5xl font-bold tracking-tight text-white">$50M+</dd>
              </div>
              <div className="flex flex-col gap-y-4">
                <dt className="text-base leading-7 text-gray-400">Stores</dt>
                <dd className="text-5xl font-bold tracking-tight text-white">150+</dd>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-dark-800 py-12 bg-dark-900">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          &copy; 2023 EAJMUSIC. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;