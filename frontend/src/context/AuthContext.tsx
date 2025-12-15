import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  userId: number | null;
  businessId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userId: number, businessId: number) => void;
  logout: () => void;
  validateSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<number | null>(null);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate session on app startup
  useEffect(() => {
    validateSession();
  }, []);

  const validateSession = async () => {
    try {
      setIsLoading(true);
      // Try to fetch business ID to check if user is authenticated
      const response = await fetch('/api/auth/businessId');
      if (response.ok) {
        const id = await response.json();
        setBusinessId(id);
      } else {
        // User is not authenticated
        setUserId(null);
        setBusinessId(null);
      }
    } catch (error) {
      console.error('Error validating session:', error);
      setUserId(null);
      setBusinessId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userId: number, businessId: number) => {
    setUserId(userId);
    setBusinessId(businessId);
  };

  const logout = () => {
    setUserId(null);
    setBusinessId(null);
  };

  const isAuthenticated = businessId !== null;

  return (
    <AuthContext.Provider
      value={{
        userId,
        businessId,
        isAuthenticated,
        isLoading,
        login,
        logout,
        validateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
