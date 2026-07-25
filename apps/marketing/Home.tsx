import React, { useState } from 'react';
import { api } from '../../src/services/api';

interface HomeProps {
  onNavigate: (domain: 'main' | 'artist' | 'admin' | 'login' | 'register' | 'about' | 'support' | 'terms' | 'privacy' | 'careers') => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/public/newsletter', { email });
      setToast('Successfully joined the newsletter!');
      setEmail('');
    } catch (err) {
      setToast('Failed to join newsletter.');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <p className="font-bold">{toast}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 text-slate-900 dark:text-white transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 text-primary">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-xl font-black tracking-tighter">EAJMUSIC</h2>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
            <button onClick={() => onNavigate('support')} className="text-sm font-medium hover:text-primary transition-colors">Support</button>
            <button onClick={() => onNavigate('about')} className="text-sm font-medium hover:text-primary transition-colors">About</button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('login')}
              className="text-sm font-bold hover:text-primary transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20"
            >
              Get Started
            </button>
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
              <button
                onClick={() => onNavigate('register')}
                className="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-base font-bold transition-all shadow-xl shadow-primary/30"
              >
                Get Started Now
              </button>
              <button className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-8 py-4 rounded-xl text-base font-bold transition-all text-slate-900 dark:text-white">
                View Pricing
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-slate-800 flex items-center justify-center text-[10px] font-bold">JD</div>
                <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-primary flex items-center justify-center text-[10px] font-bold">AS</div>
                <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-purple-600 flex items-center justify-center text-[10px] font-bold">MK</div>
              </div>
              <span>Join 50,000+ artists worldwide</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 aspect-square md:aspect-video lg:aspect-square">
              <div
                className="w-full h-full bg-center bg-cover"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCShTVprRQ_EvO2Jf6v0TYHuTxuS4lX7oFtrvVLXubzBMRjdCfRa4JAfMdqrvTZrsdcw2fX53GeaNZYU948NFxo8u5Lza-W6oiqEJ8gmqsqRloPVjDILhPdnozAeymNGNhVbEfWp-bcP8DmdmNXlJSFw9LaK1JQif1g-MaKXrK62j2CBPl4mwDw50N-ZNpgXUPqYNl4ZyWRmNCA64jWeSjqT1I8UtPLdpf4HAO8BbqBxmvZ6yXe421qfHIbJapii8IH68N4Xk4BD6E")' }}
              ></div>
              <div className="absolute bottom-6 left-6 right-6 p-4 glass-nav rounded-xl flex items-center gap-4 border border-white/10" style={{ background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(12px)' }}>
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">play_arrow</span>
                </div>
                <div>
                  <p className="text-sm font-bold">New Release: Midnight Echo</p>
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
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="h-8 w-24 bg-center bg-no-repeat bg-contain" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDuTH_rYYjRPqZtoXyrwT9C9GH9v4JgtkXg6XqN4MP1bRiTHiPNc42kswf4izmA-vzoqabgFRbAMxKMYomqNtL3CJefiUUXuERnYIw3o1rML92CkL5Q_tTSZvAag74vs8YKXjY5gXxqYnwUnad4oceYbLqYRUY7f4FD5RuqJAM8JwNk4QhiguQyMT9ZeP3o3hWLu0RoWJ8b44famTed1F9g7fShrgiVJT9Py3x1G-x4Iz4zsah2WfPPylCRSnede_IndK2qOfoAFNQ')" }}></div>
            <div className="h-8 w-24 bg-center bg-no-repeat bg-contain" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCk0GsAvat3V97t7sYrTzEm3pwVSqX4Xoo_2-zLOQH8aK5pfqIfloQwaoMknQv7pEMD7gXFm53mCkIqnJBM8ixSmSvFYaJ_5U3pA8fjbbskndefZSGSmsMFeyoFPIWUX0eF4DdbqDpzsxgoze_JP0N4d-InwqlS-TMk4hxRRUWHLHwtpD3KI8n-5EvklQ3lWtzH1dpQAlyFxvXDtzdiuQh-nyRBj8pS0X2m1twjVUgA3GD8eAi7G363m8TSXlpkRt_CAwxFBLju5RE')" }}></div>
            <div className="h-8 w-24 bg-center bg-no-repeat bg-contain" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDLeKuH_4ZiRoPYFeekQIV4k8eoXCk3a9UeOpWnmGOZTVWWHM_AnH0QtqAB0WD_D2Cmccp7XmhnA_bazatcbQkSflMc3Y65ZLkKxPzAM16GFMwEUtuFAanFKTHkv7WPHIXYW2p39bzRxsE-4NEQMIrAhUrJYpY8JZqJ--WSHShHzycfFT-2zKYvNVQ2BQKKbeHcvRYg1d5noEKzgkT5L5TiZcwSrQx4Q3MqxL8MjsES7uHcQGf-I10rDkFj9ArU9nfQydx1K078nMM')" }}></div>
            <div className="h-8 w-24 bg-center bg-no-repeat bg-contain" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCE50eccdqObYiJEGkRSZyvesEaAUOZNB4SDBBQ_dhaFClSri4ojaxohII3_5LE-nAyils6EHtzIb0lp-u0l8-F7MmJplDM6pihjSBOQd1qWrAF9AB5-dYemIf7c5g8VQuRtVkc2T9OMdvBbfOQgIyFoDaYqjQs0Dm9h3y6XjYNDFCqngaZNFdjPHTCC7C9f1LxZXGASTmSQbmmTkQNwVDOXtOTjEZgFO6hCpn59WoI6WuSsxfOWONuafaR5Sl7nRW7y-eQz7hDSC4')" }}></div>
            <div className="h-8 w-24 bg-center bg-no-repeat bg-contain" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB_YiO5mdUfOiKUYT4FFg7i7Y78mCveDHYaaMcr05BVU3oHKGrKMuQIGPkAC5EDVb384wsuUWz8Vk-kNke9J_Z64dFSVOApfvhTxqIAqKDiXpWU7f4BaHO6JsC4J8PSNgFamKJVQJ0iAb9dqJHgmImxJYELYaQw_UtJcV8hIYP1Mu1BvISLTC3Xd_qL7xOu9lfQPs3WMfEOdwCdEz1DoytzbBe9LYX57eMRkBWSVpYoerT4b_EC_0EkYB2vkwAs7eMEo1L1vu4-4YY')" }}></div>
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
            <div className="group p-8 rounded-2xl bg-card-dark border border-white/5 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Detailed insights into your listeners' demographics, locations, and playback behavior.</p>
            </div>
            <div className="group p-8 rounded-2xl bg-card-dark border border-white/5 hover:border-primary/50 transition-all">
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
              <button
                onClick={() => onNavigate('register')}
                className="w-full py-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold transition-all text-slate-900 dark:text-white"
              >
                Get Started
              </button>
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
              <button
                onClick={() => onNavigate('register')}
                className="w-full py-4 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold transition-all"
              >
                Select Plan
              </button>
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
              <button
                onClick={() => onNavigate('register')}
                className="w-full py-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold transition-all text-slate-900 dark:text-white"
              >
                Select Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white dark:bg-background-dark text-slate-900 dark:text-white transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-16">What Artists Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col gap-6">
              <div className="flex text-yellow-500">
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
              </div>
              <p className="text-lg italic leading-relaxed">"EAJMUSIC changed everything for me. I finally keep all my earnings and the analytics are incredibly helpful for planning my tours."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-700 bg-center bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAyMgo_veMHaev5kDpK8tFObJHMf0C5A-rOFQ0w1Cd7etz6oxRCZ1VIio2tyb7_bh7MnUkhxA8k7sa7z3PBs9WPQpaO0a1SSSq-ge1V8a1pe6Oplfa5ZEJ9VgQUVFXRqifbJagjlVEGqWBP1UNWH6vjGlhtLNOEZtmgQwxSVI2gXEYIx9Nu2_0URPTtNWJbQyQehHq8A0xZFTxsCFhIRozY9yVqhqjfS7VqGrLHw5oCM8U9EYWuAdwOYFvna0ZiSBcgG9NUtgNbpq8')" }}></div>
                <div>
                  <p className="font-bold">Marcus Chen</p>
                  <p className="text-xs text-slate-500">Electronic Artist</p>
                </div>
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col gap-6">
              <div className="flex text-yellow-500">
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
              </div>
              <p className="text-lg italic leading-relaxed">"The distribution speed is insane. My tracks are on Spotify in less than 48 hours usually. Best service in the game right now."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-700 bg-center bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCfzYr1Bk73xJTjizn9bHCVrMzLPUYD2DwPAZ37k127oklvyLQ5ovSRqZmSsg8sw77ONNAfGzbekMrntvnxnvsCpys_LReiqmBxFZT_cGIb4jo42HuuBslNu52Q7EQL9IMvuryTJwGgF4RsJmP_c4clK2ycRJiDQR8kEm9yg-wTfFXTLB1c1Yk9dTbNZMC3ihOErA1MtnPVQZbs54BItiEW8t8q0C8EAZvztPLTfufH-xe0mIMV-FRIN9AAGjakacJX1QV9xD-U6k0')" }}></div>
                <div>
                  <p className="font-bold">Sarah Jenkins</p>
                  <p className="text-xs text-slate-500">Singer-Songwriter</p>
                </div>
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-6">
              <div className="flex text-yellow-500">
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
              </div>
              <p className="text-lg italic leading-relaxed">"Managing 5 different artists was a nightmare before EAJMUSIC. The Label Plus plan has saved me hours of manual work every week."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-700 bg-center bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAD-xsuWHiggpCHCh4rrj3Gsq8RkWqduCg98WvadipAIFuhmbOCClC9oMPfnMDPqojhkvWwxSx6n6yQDXgcmJn-v2djTyy_EX4jyv3PPiGI9BKEVj2RXcVGJ_P14de6gtWTuljXsvJiwUCNOyTymtBssrzU6wQY69512eZh4OaM29OLKR1OtJ43jivEmlmMvsCRx6gcgvVmka4eG_RzkWqNYtCHEvX82PfvbWW5hVP09vzlD5qQ3ANH2CSJrDH9yf9GGLHCao4v520')" }}></div>
                <div>
                  <p className="font-bold">David Rossi</p>
                  <p className="text-xs text-slate-500">Founder, Red Cloud Records</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Ready to Take Your Music Career to the Next Level?</h2>
          <p className="text-xl opacity-90 mb-10">Join thousands of artists who trust EAJMUSIC with their global distribution.</p>
          <button
            onClick={() => onNavigate('register')}
            className="bg-white text-primary px-10 py-5 rounded-xl text-lg font-bold hover:bg-slate-100 transition-all shadow-2xl"
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-background-dark py-16 border-t border-slate-200 dark:border-white/5 text-slate-600 dark:text-white transition-colors">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="size-6 text-primary">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor"></path>
                </svg>
              </div>
              <h2 className="text-xl font-black tracking-tighter">EAJMUSIC</h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              The premium music distribution platform for the modern independent artist. Distributed globally. Managed locally.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-sm">public</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-sm">video_library</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-sm">share</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-primary transition-colors">Distribution</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Royalties</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Promotional Tools</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-500 dark:text-slate-400">
              <li><button onClick={() => onNavigate('about')} className="hover:text-primary transition-colors">About Us</button></li>
              <li><button onClick={() => onNavigate('careers')} className="hover:text-primary transition-colors">Careers</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-primary transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-primary transition-colors">Terms of Service</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Newsletter</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Get the latest music industry news and tips.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address" 
                className="flex-1 bg-white/5 border-white/10 rounded-lg text-sm focus:ring-primary focus:border-primary px-3 py-2" 
                required 
              />
              <button disabled={loading} type="submit" className="bg-primary px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
                {loading ? '...' : 'Join'}
              </button>
            </form>
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