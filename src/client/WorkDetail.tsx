import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Work } from './types';

const WorkDetail = () => {
  const { id } = useParams();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const response = await fetch(`/api/work/${id}`);
        if (!response.ok) {
          throw new Error('Work not found');
        }
        const data = await response.json();
        setWork(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load work');
      } finally {
        setLoading(false);
      }
    };

    fetchWork();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error || !work) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error || 'Work not found'}</p>
        <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to work list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link to="/" className="text-blue-500 hover:text-blue-700 mb-6 inline-block">
        ← Back to list
      </Link>
      <div className="mb-8">
        <img 
          src={work.image} 
          alt={work.title} 
          className="w-full h-auto rounded-lg shadow-lg"
        />
      </div>
      <h1 className="text-3xl font-bold mb-4">{work.title}</h1>
      <p className="text-gray-700 mb-8">{work.description}</p>
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">About the Author</h2>
        <h3 className="text-lg font-medium mb-2">{work.author_name}</h3>
        <p className="text-gray-700">{work.author_bio}</p>
      </div>
    </div>
  );
};

export default WorkDetail; 