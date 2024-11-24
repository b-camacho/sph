import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthCallback() {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const setupAuth = async () => {
      try {
        const token = await getAccessTokenSilently();
        // Send token to your backend
        await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        navigate('/');
      } catch (error) {
        console.error('Auth setup failed:', error);
        navigate('/');
      }
    };

    setupAuth();
  }, [getAccessTokenSilently, navigate]);

  return <div>Setting up authentication...</div>;
}

export default AuthCallback; 