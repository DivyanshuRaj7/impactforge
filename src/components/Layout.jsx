import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* TopAppBar (Desktop/Tablet) */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex justify-between items-center w-full px-6 md:px-12 py-4 max-w-[1600px] mx-auto">
          <Link to="/" className="text-2xl font-serif italic font-medium tracking-tighter text-on-surface">IMPACTFORGE</Link>
          
          <nav className="hidden md:flex gap-10 items-center">
            <Link className="text-on-surface/60 font-medium hover:text-secondary transition-colors duration-300" to="/">Exhibits</Link>
            <Link className="text-on-surface/60 font-medium hover:text-secondary transition-colors duration-300" to="/add">Contribute</Link>
            {user && (
              <Link className="text-on-surface/60 font-medium hover:text-secondary transition-colors duration-300" to="/profile">Dashboard</Link>
            )}
          </nav>
          
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => navigate('/add')} className="hidden md:block bg-primary text-on-primary px-8 py-2.5 rounded-sm title-sm font-bold scale-95 active:scale-90 transition-transform duration-200">
              Contribute
            </button>
            <span onClick={() => navigate(user ? '/profile' : '/auth')} className="material-symbols-outlined text-2xl text-on-surface cursor-pointer" data-icon="account_circle">
              account_circle
            </span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto pt-24 pb-24 md:pb-12">
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
      
      <Navigation />
    </div>
  );
}

