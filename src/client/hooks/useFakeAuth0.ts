import { useState, useEffect } from 'react';

interface UseFakeAuth0Return {
  isAuthenticated: boolean;
  isLoading: boolean;
  getAccessTokenSilently: () => Promise<string>;
  loginWithRedirect: () => void;
  logout: (options?: { logoutParams?: { returnTo?: string } }) => void;
}

export function useFakeAuth0(): UseFakeAuth0Return {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('fakeauth');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const getAccessTokenSilently = async (): Promise<string> => {
    const token = localStorage.getItem('fakeauth');
    if (!token) {
      throw new Error('Not authenticated');
    }
    return token;
  };

  const loginWithRedirect = () => {
    // Redirect to the fake auth page
    window.location.href = '/';
  };

  const logout = (options?: { logoutParams?: { returnTo?: string } }) => {
    localStorage.removeItem('fakeauth');
    const returnTo = options?.logoutParams?.returnTo || window.location.origin;
    window.location.href = returnTo;
  };

  return {
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    loginWithRedirect,
    logout,
  };
} 