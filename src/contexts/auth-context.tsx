
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  login: string;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  exchangeCodeForToken: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GITHUB_CLIENT_ID = "YOUR_GITHUB_CLIENT_ID"; // Replace with your GitHub OAuth app client ID
const REDIRECT_URI = window.location.origin;
const BACKEND_URL = "http://127.0.0.1:8000";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem('github_token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      fetchUserData(storedToken);
    } else {
      setIsLoading(false);
    }

    // Check URL for code parameter (after GitHub redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      exchangeCodeForToken(code)
        .then(() => {
          // Clean up URL
          const cleanUrl = window.location.href.split('?')[0];
          window.history.replaceState({}, document.title, cleanUrl);
        })
        .catch(error => {
          console.error("Error during code exchange:", error);
          setIsLoading(false);
        });
    }
  }, []);

  const fetchUserData = async (accessToken: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/github/user`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token might be invalid
        logout();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user,repo`;
    window.location.href = githubAuthUrl;
  };

  const exchangeCodeForToken = async (code: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/auth/exchange_code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      const { access_token } = data;
      
      // Save token to localStorage
      localStorage.setItem('github_token', access_token);
      
      // Update state
      setToken(access_token);
      setIsAuthenticated(true);
      
      // Fetch user data
      await fetchUserData(access_token);
    } catch (error) {
      console.error("Error exchanging code for token:", error);
      logout();
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('github_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        token,
        login,
        logout,
        exchangeCodeForToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
