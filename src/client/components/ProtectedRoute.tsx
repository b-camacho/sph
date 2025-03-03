//import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { useFakeAuth0 } from '../hooks/useFakeAuth0';
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useFakeAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 