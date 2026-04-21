import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const { user } = useAuth();
  
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 md:hidden bg-white/95 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.05)] rounded-t-xl z-50 pb-safe">
      <NavLink 
        to="/" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center p-3 transition-all rounded-xl ${isActive ? 'text-secondary bg-secondary/5' : 'text-on-surface/40 hover:bg-surface-container-low'}`
        }
      >
        <span className="material-symbols-outlined" data-icon="category" style={{ fontVariationSettings: "'FILL' 1" }}>category</span>
        <span className="font-sans text-[10px] uppercase tracking-widest font-bold mt-1">Exhibits</span>
      </NavLink>
      
      <NavLink 
        to="/add" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center p-3 transition-all rounded-xl ${isActive ? 'text-secondary bg-secondary/5' : 'text-on-surface/40 hover:bg-surface-container-low'}`
        }
      >
        <span className="material-symbols-outlined" data-icon="add_circle">add_circle</span>
        <span className="font-sans text-[10px] uppercase tracking-widest font-bold mt-1">Contribute</span>
      </NavLink>
      
      <NavLink 
        to={user ? "/profile" : "/auth"}
        className={({ isActive }) => 
          `flex flex-col items-center justify-center p-3 transition-all rounded-xl ${isActive ? 'text-secondary bg-secondary/5' : 'text-on-surface/40 hover:bg-surface-container-low'}`
        }
      >
        <span className="material-symbols-outlined" data-icon="person">person</span>
        <span className="font-sans text-[10px] uppercase tracking-widest font-bold mt-1">Profile</span>
      </NavLink>
    </nav>
  );
}
