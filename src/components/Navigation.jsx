import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../contexts/RoleContext';

export default function Navigation() {
  const { user } = useAuth();
  const { role, setRole } = useRole();
  
  if (!user) return null;

  return (
    <>
      {/* Mobile Role Switcher */}
      <div className="fixed bottom-20 left-4 right-4 md:hidden z-40 bg-surface-container-low border border-outline-variant/20 rounded-full shadow-lg flex justify-between px-2 py-1 overflow-hidden">
        {['donor', 'seeker', 'mediator'].map(r => (
          <button 
            key={r}
            onClick={() => setRole(r)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${role === r ? 'bg-secondary text-white' : 'text-on-surface-variant/70 hover:bg-surface-container-highest'}`}
          >
            {r}
          </button>
        ))}
      </div>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 md:hidden bg-white/95 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.05)] rounded-t-xl z-50 pb-safe">
        
        {role === 'donor' && (
          <>
            <NavLink to="/" className={({ isActive }) => `flex flex-col items-center justify-center p-3 transition-all rounded-xl ${isActive ? 'text-secondary bg-secondary/5' : 'text-on-surface/40 hover:bg-surface-container-low'}`}>
              <span className="material-symbols-outlined" data-icon="inventory_2">inventory_2</span>
              <span className="font-sans text-[10px] uppercase tracking-widest font-bold mt-1">Items</span>
            </NavLink>
            <NavLink to="/add" className={({ isActive }) => `flex flex-col items-center justify-center p-3 transition-all rounded-xl ${isActive ? 'text-secondary bg-secondary/5' : 'text-on-surface/40 hover:bg-surface-container-low'}`}>
              <span className="material-symbols-outlined" data-icon="add_circle">add_circle</span>
              <span className="font-sans text-[10px] uppercase tracking-widest font-bold mt-1">Add</span>
            </NavLink>
          </>
        )}

        {role === 'seeker' && (
          <>
            <NavLink to="/" className={({ isActive }) => `flex flex-col items-center justify-center p-3 transition-all rounded-xl ${isActive ? 'text-secondary bg-secondary/5' : 'text-on-surface/40 hover:bg-surface-container-low'}`}>
              <span className="material-symbols-outlined" data-icon="category">category</span>
              <span className="font-sans text-[10px] uppercase tracking-widest font-bold mt-1">Exhibits</span>
            </NavLink>
            <NavLink to="/post-need" className={({ isActive }) => `flex flex-col items-center justify-center p-3 transition-all rounded-xl ${isActive ? 'text-secondary bg-secondary/5' : 'text-on-surface/40 hover:bg-surface-container-low'}`}>
              <span className="material-symbols-outlined" data-icon="campaign">campaign</span>
              <span className="font-sans text-[10px] uppercase tracking-widest font-bold mt-1">Post Need</span>
            </NavLink>
          </>
        )}

        {role === 'mediator' && (
          <NavLink to="/mediator" className={({ isActive }) => `flex flex-col items-center justify-center p-3 transition-all rounded-xl ${isActive ? 'text-secondary bg-secondary/5' : 'text-on-surface/40 hover:bg-surface-container-low'}`}>
            <span className="material-symbols-outlined" data-icon="map">map</span>
            <span className="font-sans text-[10px] uppercase tracking-widest font-bold mt-1">Bridges</span>
          </NavLink>
        )}

        <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center justify-center p-3 transition-all rounded-xl ${isActive ? 'text-secondary bg-secondary/5' : 'text-on-surface/40 hover:bg-surface-container-low'}`}>
          <span className="material-symbols-outlined" data-icon="person">person</span>
          <span className="font-sans text-[10px] uppercase tracking-widest font-bold mt-1">Profile</span>
        </NavLink>
      </nav>
    </>
  );
}
