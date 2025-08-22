import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the User type for better type safety
interface User {
  displayName?: string; 
  email?: string;
}

// The Auth Context type definition
interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The Auth Provider component that will wrap your application
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State to track the current user
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Login function implementation
  const login = async (email: string, password: string) => {
    try {
      // Replace with real auth later
      setCurrentUser({ email, displayName: email.split('@')[0] });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Logout function implementation
  const logout = async () => {
    try {
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


