//import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';

type User = {
  name: string;
  email: string;
  sub: string;
};

export default function AuthNavFake() {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

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

    fetchUsers();
  }, []);

  const handleFakeLogin = async (user: User) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/fake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      
      if (!response.ok) {
        throw new Error('Fake auth failed');
      }
      
      const { access_token } = await response.json();
      
      localStorage.setItem('fakeauth', access_token);

      window.location.reload();
    } catch (error) {
      console.error('Fake auth error:', error);
      setError('Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Select Demo Account</h2>
        <p className="text-gray-600 text-center mb-6">This app is in demo mode. You can switch accounts any time.</p>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="space-y-4">
          {users.map((user) => (
            <button
              key={user.sub}
              onClick={() => handleFakeLogin(user)}
              disabled={isLoading}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded border disabled:opacity-50"
            >
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 