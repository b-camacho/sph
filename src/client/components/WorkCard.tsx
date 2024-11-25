import { Link } from 'react-router-dom';
import { Work } from '../types';

interface WorkCardProps {
  work: Work;
}

export function WorkCard({ work }: WorkCardProps) {
  return (
    <div className="flex-none w-full snap-center">
      <Link to={`/work/${work.id}`}>
        <div className="relative aspect-[4/5]">
          <img
            src={work.image || "/api/placeholder/1920/2400"}
            alt={work.title}
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/100 to-transparent rounded-b-lg" />
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <h2 className="text-xl font-bold">{work.title}</h2>
            <p>by {work.author_name}</p>
          </div>
          <div className="absolute bottom-0 left-0 p-4 text-white" style={{ transform: 'translateY(-100%)' }}>
            <p className="text-sm opacity-75"></p>
          </div>
        </div>
      </Link>
    </div>
  );
} 