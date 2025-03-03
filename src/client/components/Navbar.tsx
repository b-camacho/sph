import { FaHome, FaBook, FaCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';
//import { useAuth0 } from '@auth0/auth0-react';
import { useFakeAuth0 } from '../hooks/useFakeAuth0';
import { useState, useEffect } from 'react';

type User = {
  name: string;
  email: string;
  sub: string;
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const { logout } = useFakeAuth0();

  useEffect(() => {
    // Get current user email from JWT token
    const token = localStorage.getItem('fakeauth');
    if (token) {
      try {
        const payload = JSON.parse(atob(token));
        setCurrentUserEmail(payload.email);
      } catch (err) {
        console.error('Error parsing JWT token:', err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/auth/fake');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      }
    };

    if (isMenuOpen) {
      fetchUsers();
    }
  }, [isMenuOpen]);

  const handleUserSwitch = async (user: User) => {
    try {
      const response = await fetch('/api/auth/fake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      
      if (!response.ok) {
        throw new Error('Failed to switch user');
      }
      
      const { access_token } = await response.json();
      localStorage.setItem('fakeauth', access_token);
      window.location.reload();
    } catch (error) {
      console.error('Error switching user:', error);
      setError('Failed to switch user');
    }
  };

  return (
    <nav className="fixed lg:left-0 lg:top-0 lg:h-full lg:w-[240px] lg:border-r bottom-0 left-0 w-full bg-white border-t lg:border-t-0 border-gray-200 p-4 z-50 h-[72px] lg:h-screen">
      <div className="flex lg:flex-col justify-around items-center lg:items-stretch lg:h-full lg:justify-start lg:gap-8 lg:pt-8 max-w-md lg:max-w-none mx-auto">
        <Link to="/works/mine" className="flex flex-col lg:flex-row items-center lg:gap-3 text-gray-600 hover:text-blue-500">
          <FaHome size={24} />
          <span className="text-xs lg:text-sm mt-1 lg:mt-0">Home</span>
        </Link>
        
        <Link to="/" className="flex flex-col lg:flex-row items-center lg:gap-3 text-gray-600 hover:text-blue-500">
          <FaBook size={24} />
          <span className="text-xs lg:text-sm mt-1 lg:mt-0">Collections</span>
        </Link>
        
        <div className="relative lg:mt-auto lg:mb-8">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="flex flex-col lg:flex-row items-center lg:gap-3 text-gray-600 hover:text-blue-500"
          >
            <FaCog size={24} />
            <span className="text-xs lg:text-sm mt-1 lg:mt-0">Menu</span>
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
                className="fixed lg:fixed lg:left-[260px] lg:bottom-8 bottom-20 right-4 lg:right-auto w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {error && (
                  <div className="px-4 py-2 bg-red-100 text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div className="max-h-80 overflow-y-auto">
                  {users.map((user) => (
                    <button
                      key={user.sub}
                      onClick={() => handleUserSwitch(user)}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 relative"
                    >
                      <div className="font-medium flex items-center justify-between">
                        {user.name}
                        {currentUserEmail === user.email && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout({ logoutParams: { returnTo: window.location.origin } });
                  }}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-gray-100 border-t border-gray-200 font-medium"
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