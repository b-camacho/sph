import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Page not found</p>
      <Link 
        to="/" 
        className="text-blue-500 hover:text-blue-700 underline"
      >
        Return to home
      </Link>
    </div>
  );
};

export default NotFound; 