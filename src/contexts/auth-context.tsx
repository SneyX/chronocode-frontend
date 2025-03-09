
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  handleGitHubCallback: (code: string, state: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  login: () => {},
  logout: () => {},
  handleGitHubCallback: async () => {},
  loading: false,
});

export const useAuth = () => useContext(AuthContext);

// GitHub OAuth config
const CLIENT_ID = 'Iv23ligkIkh0DejY8j8v';
// Using the hardcoded redirect URI that matches what's registered in GitHub
const REDIRECT_URI = 'https://preview--commit-timeline-genius-85.lovable.app/github/callback';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load auth state from localStorage on initial mount
  useEffect(() => {
    const storedToken = localStorage.getItem('github_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
      setIsAuthenticated(true);
      fetchUserInfo(storedToken).catch(() => logout());
    }
    setLoading(false);
  }, []);

  // Fetch user information when authenticated
  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching GitHub user data:', error);
      toast.error('Failed to get user information');
      logout();
      throw error;
    }
  };

  // Initiate GitHub OAuth login flow
  const login = () => {
    // Generate a random state string for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('github_oauth_state', state);
    
    // Redirect to GitHub's authorization endpoint
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=repo,user`;
    window.location.href = authUrl;
  };

  // Handle the GitHub callback with authorization code
  const handleGitHubCallback = async (code: string, state: string) => {
    const storedState = localStorage.getItem('github_oauth_state');
    
    // Verify state parameter to prevent CSRF attacks
    if (state !== storedState) {
      toast.error('Authentication failed', {
        description: 'State mismatch. Possible security issue.',
      });
      return;
    }
    
    localStorage.removeItem('github_oauth_state');
    setLoading(true);
    
    try {
      // Use the serverless OAuth proxy we can trust for token exchange
      // This avoids exposing client secrets in browser code
      const tokenResponse = await fetch('https://github-oauth-cors-proxy.lovable.tools/api/github/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          code: code,
          redirect_uri: REDIRECT_URI,
        }),
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Token exchange failed: ' + await tokenResponse.text());
      }
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        throw new Error('No access token returned');
      }
      
      // Save the token and update state
      localStorage.setItem('github_access_token', tokenData.access_token);
      setAccessToken(tokenData.access_token);
      setIsAuthenticated(true);
      
      // Fetch user info with the new token
      await fetchUserInfo(tokenData.access_token);
      
      toast.success('Authentication successful!');
    } catch (error) {
      console.error('GitHub authentication error:', error);
      toast.error('Authentication failed', {
        description: 'Could not complete GitHub login.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Logout user and clear tokens
  const logout = () => {
    localStorage.removeItem('github_access_token');
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        accessToken,
        login,
        logout,
        handleGitHubCallback,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
