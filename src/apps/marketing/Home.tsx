import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 text-slate-900 dark:text-white transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 text-primary">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-xl font-black tracking-tighter">EAJMUSIC</h2>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Support</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">About</a>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard'}
                className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-bold hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20"
                >
                  Get Started
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 text-slate-900 dark:text-white transition-colors bg-slate-50 dark:bg-black overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(37, 37, 244, 0.15) 0%, rgba(10, 10, 10, 1) 70%)' }}></div>
        <div className="absolute inset-0 pointer-events-none opacity-100 dark:opacity-0 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(37,37,244,0.05)_0%,rgba(255,255,255,1)_60%)]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider w-fit">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Now distributing to 150+ stores
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-tight tracking-tight">
              Distribute Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Music Globally</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
              Keep 100% of your earnings and reach millions of listeners across Spotify, Apple Music, TikTok, and more. The ultimate platform for independent artists.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-base font-bold transition-all shadow-xl shadow-primary/30"
              >
                Get Started Now
              </Link>
              <a href="#pricing" className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-8 py-4 rounded-xl text-base font-bold transition-all text-slate-900 dark:text-white">
                View Pricing
              </a>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">JD</div>
                <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-primary flex items-center justify-center text-[10px] font-bold text-white">AS</div>
                <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">MK</div>
              </div>
              <span>Join 50,000+ artists worldwide</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 aspect-square md:aspect-video lg:aspect-square">
              <div
                className="w-full h-full bg-center bg-cover"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80")' }}
              ></div>
              <div className="absolute bottom-6 left-6 right-6 p-4 glass-nav rounded-xl flex items-center gap-4 border border-white/10" style={{ background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(12px)' }}>
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">play_arrow</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">New Release: Midnight Echo</p>
                  <p className="text-xs text-slate-400">Trending on Spotify Global</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 border-y border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 mb-10 transition-colors">Trusted by Major Platforms</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60">
            <span className="text-2xl font-black text-slate-400">Spotify</span>
            <span className="text-2xl font-black text-slate-400">Apple Music</span>
            <span className="text-2xl font-black text-slate-400">YouTube</span>
            <span className="text-2xl font-black text-slate-400">TikTok</span>
            <span className="text-2xl font-black text-slate-400">Amazon</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 text-slate-900 dark:text-white bg-white dark:bg-transparent transition-colors" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Empowering Your Music Career</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">Everything you need to manage your releases, analyze your audience, and grow your presence globally.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group p-8 rounded-2xl bg-slate-50 dark:bg-card-dark border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h3 className="text-xl font-bold mb-3">100% Royalties</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Keep every penny you earn from your music. We never take a cut of your revenue.</p>
            </div>
            <div className="group p-8 rounded-2xl bg-slate-50 dark:bg-card-dark border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">public</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Global Distribution</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Instantly publish your tracks to over 150 digital stores and streaming platforms worldwide.</p>
            </div>
            <div className="group p-8 rounded-2xl bg-slate-50 dark:bg-card-dark border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Detailed insights into your listeners' demographics, locations, and playback behavior.</p>
            </div>
            <div className="group p-8 rounded-2xl bg-slate-50 dark:bg-card-dark border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">link</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Link Tools</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Automatic pre-save pages and landing links to share your music across social media.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/30 text-slate-900 dark:text-white transition-colors" id="pricing">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">No hidden fees. No surprises. Just one plan to rule them all, or start for free.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="flex flex-col p-8 rounded-2xl bg-white dark:bg-background-dark border border-slate-200 dark:border-white/5">
              <h3 className="text-lg font-bold mb-2">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">$0</span>
                <span className="text-slate-500">/year</span>
              </div>
              <p className="text-slate-400 text-sm mb-8">Perfect for hobbyists starting their journey.</p>
              <ul className="flex flex-col gap-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> 1 Artist Profile</li>
                <li className="flex items-center gap-3 text-sm"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Basic Distribution</li>
                <li className="flex items-center gap-3 text-sm text-slate-600"><span className="material-symbols-outlined text-lg">cancel</span> Advanced Analytics</li>
                <li className="flex items-center gap-3 text-sm text-slate-600"><span className="material-symbols-outlined text-lg">cancel</span> Smart Links</li>
              </ul>
              <Link
                to="/register"
                className="w-full py-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold transition-all text-slate-900 dark:text-white text-center"
              >
                Get Started
              </Link>
            </div>
            {/* Pro Artist */}
            <div className="relative flex flex-col p-8 rounded-2xl bg-white dark:bg-card-dark border-2 border-primary shadow-2xl shadow-primary/20 scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Most Popular</div>
              <h3 className="text-lg font-bold mb-2">Pro Artist</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">$19.99</span>
                <span className="text-slate-500">/year</span>
              </div>
              <p className="text-slate-400 text-sm mb-8">Everything an independent professional needs.</p>
              <ul className="flex flex-col gap-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Unlimited Uploads</li>
                <li className="flex items-center gap-3 text-sm"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Keep 100% Royalties</li>
                <li className="flex items-center gap-3 text-sm"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Advanced Analytics</li>
                <li className="flex items-center gap-3 text-sm"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Custom Release Dates</li>
              </ul>
              <Link
                to="/register"
                className="w-full py-4 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold transition-all text-center"
              >
                Select Plan
              </Link>
            </div>
            {/* Label Plus */}
            <div className="flex flex-col p-8 rounded-2xl bg-white dark:bg-background-dark border border-slate-200 dark:border-white/5">
              <h3 className="text-lg font-bold mb-2">Label Plus</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">$49.99</span>
                <span className="text-slate-500">/year</span>
              </div>
              <p className="text-slate-400 text-sm mb-8">For labels managing multiple artists.</p>
              <ul className="flex flex-col gap-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Up to 10 Artist Profiles</li>
                <li className="flex items-center gap-3 text-sm"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Team Management</li>
                <li className="flex items-center gap-3 text-sm"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Priority Support</li>
                <li className="flex items-center gap-3 text-sm"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Royalty Splitting</li>
              </ul>
              <Link
                to="/register"
                className="w-full py-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold transition-all text-slate-900 dark:text-white text-center"
              >
                Select Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Ready to Take Your Music Career to the Next Level?</h2>
          <p className="text-xl opacity-90 mb-10">Join thousands of artists who trust EAJMUSIC with their global distribution.</p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary px-10 py-5 rounded-xl text-lg font-bold hover:bg-slate-100 transition-all shadow-2xl"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-background-dark py-16 border-t border-slate-200 dark:border-white/5 text-slate-600 dark:text-white transition-colors">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="size-6 text-primary">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor"></path>
                </svg>
              </div>
              <h2 className="text-xl font-black tracking-tighter">EAJMUSIC</h2>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              The premium music distribution platform for the modern independent artist. Distributed globally. Managed locally.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-primary transition-colors">Distribution</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Royalties</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Promotional Tools</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Newsletter</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Get the latest music industry news and tips.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email address" className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm px-3 py-2 focus:ring-primary focus:border-primary" />
              <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-400 text-xs transition-colors">
          © 2024 EAJMUSIC Distribution. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
