import { FaHome, FaBook, FaCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { logout } = useAuth0();
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-50 h-[72px]">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <Link to="/works/mine" className="flex flex-col items-center text-gray-600 hover:text-blue-500">
          <FaHome size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link to="/" className="flex flex-col items-center text-gray-600 hover:text-blue-500">
          <FaBook size={24} />
          <span className="text-xs mt-1">Collections</span>
        </Link>
        
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="flex flex-col items-center text-gray-600 hover:text-blue-500"
          >
            <FaCog size={24} />
            <span className="text-xs mt-1">Menu</span>
          </button>
          {isMenuOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
              }}
            >
              <div 
                className="fixed bottom-20 right-4 w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout({ logoutParams: { returnTo: window.location.origin } });
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 