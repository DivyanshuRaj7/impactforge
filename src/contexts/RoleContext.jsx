import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export function RoleProvider({ children }) {
  const { profile } = useAuth();
  const [role, setRole] = useState('seeker'); // default role

  useEffect(() => {
    if (profile?.role) {
      setRole(profile.role);
    }
  }, [profile]);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
