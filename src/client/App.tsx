//import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import WorkList from './WorkList';
import WorkDetail from './WorkDetail';
import WorkListUser from './WorkListUser';
import NotFound from './NotFound';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthNav from './components/AuthNav';
import Navbar from './components/Navbar';
import Claim from './Claim'
import AuthNavFake from './components/AuthNavFake';
import { useFakeAuth0 } from './hooks/useFakeAuth0';

function AppContent() {
  const { isAuthenticated } = useFakeAuth0();

  if (!isAuthenticated) {
    // Use AuthNavFake in development, real AuthNav in production
    return import.meta.env.DEV ? <AuthNavFake /> : <AuthNav />;
  }

  return (
    <>
      <Navbar />
      <div className="pb-[72px]">
      <Routes>
        <Route path="/" element={<WorkList />} />
        <Route path="/work/:id" element={<WorkDetail />} />
        <Route path="/works/mine" element={<WorkListUser />} />
        <Route path="/claim" element={<Claim />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </div>
    </>
  );
}

export default function App() {
  const { isLoading, isAuthenticated } = useFakeAuth0();
  const fakeAuth = localStorage.getItem('fakeauth');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check for either real Auth0 authentication or fake auth token
  if (!isAuthenticated && !fakeAuth) {
    return <AuthNavFake />;
  }

  return (
    // // <Auth0Provider
    // //   domain={import.meta.env.VITE_AUTH0_DOMAIN}
    // //   clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
    // //   cacheLocation="localstorage"
    // //   authorizationParams={{
    // //     redirect_uri: window.location.origin,
    // //     audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    // //   }}
    // // >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    // </Auth0Provider>
  );
}