import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the User type for better type safety
interface User {
  displayName?: string; 
  email?: string;
}

// The Auth Context type definition
interface AuthContextType {
  currentUser: User | null; // Fixed the syntax error here
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
      // This is where you would normally call your authentication service
      // For example: const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Simulate successful login for now
      setCurrentUser({ email, displayName: email.split('@')[0] });
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw to let the component handle the error
    }
  };

  // Logout function implementation
  const logout = async () => {
    try {
      // This is where you would normally call your authentication service
      // For example: await signOut(auth);
      
      // Clear the user state
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error; // Re-throw to let the component handle the error
    }
  };

  // The value that will be available through the context
  const value = {
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