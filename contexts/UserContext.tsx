// contexts/UserContext.tsx
"use client"
import React, { createContext, useContext } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

const UserContext = createContext<User | null>(null);

export function UserProvider({ 
  children, 
  user 
}: { 
  children: React.ReactNode; 
  user: User;
}) {
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error('useUser must be used within UserProvider');
  }
  return user;
}