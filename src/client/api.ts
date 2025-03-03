//import { useAuth0 } from '@auth0/auth0-react';
import { useFakeAuth0 } from './hooks/useFakeAuth0';

export const useApi = () => {
  const { getAccessTokenSilently } = useFakeAuth0();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  return { fetchWithAuth };
}; 