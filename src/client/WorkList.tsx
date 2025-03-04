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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work) => (
            <div key={work.id} className="relative group cursor-pointer">
              <Link to={`/work/${work.id}`}>
                <div className="aspect-[4/3] overflow-hidden rounded-lg">
                  <img 
                    src={work.image || "/api/placeholder/600/600"} 
                    alt={work.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none rounded-b-lg" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-lg font-bold mb-2">{work.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    {work.description?.split(',').map((segment, i) => (
                      <span key={i} className="text-sm px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full">
                        {segment.trim()}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm mt-3 opacity-90">By {work.author_name}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}