import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import WorkList from './WorkList';
import WorkDetail from './WorkDetail';
import NotFound from './NotFound';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthNav from './components/AuthNav';
import AuthCallback from './components/AuthCallback';

function AppContent() {
  const { isAuthenticated, logout } = useAuth0();

  if (!isAuthenticated) {
    return <AuthNav />;
  }

  return (
    <>
      <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
        Log Out
      </button>
      <Routes>
        <Route path="/" element={<WorkList />} />
        <Route path="/auth" element={<AuthCallback />} />
        <Route path="/work/:id" element={<WorkDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  const uri = `${import.meta.env.VITE_APP_DOMAIN.replace(/\/$/, '')}/auth`;
  console.log("redirect uri", uri);
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: uri,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE
      }}
    >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Auth0Provider>
  );
}

export default App;