import { useEffect, useState } from 'react';
import { Work } from './types';
import { Link } from 'react-router-dom';
import { useApi } from './api';

export default function WorkList() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth } = useApi(); 

  useEffect(() => {
    fetchWithAuth('/api/works/all')
      .then(res => {
        if (!res.ok) {
          console.log('Error response:', res);
          throw new Error('Failed to fetch works');
        }
        return res.json();
      })
      .then(data => {
        setWorks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="lg:pl-[240px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="columns-2 gap-4 bg-white">
          {works.map((work) => (
            <div key={work.id} className="relative mb-4 cursor-pointer">
              <Link to={`/work/${work.id}`}>
                <img 
                  src={work.image || "/api/placeholder/600/600"} 
                  alt={work.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/100 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h2 className="text-base font-bold">{work.title}</h2>
                  <div className="flex flex-wrap gap-1">
                    {work.description?.split(',').map((segment, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-white text-black rounded-full">
                        {segment.trim()}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs mt-1">By {work.author_name}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}