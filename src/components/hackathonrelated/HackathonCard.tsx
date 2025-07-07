import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HackathonCardProps {
  platform: string;
  platformIcon: string;
  description: string;
  link: string;
}

const HackathonCard: React.FC<HackathonCardProps> = ({
  platform,
  platformIcon,
  description,
  link
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <img 
            src={platformIcon} 
            alt={platform}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {platform}
          </h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
          {description}
        </p>
        
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
        >
          Explore Hackathons
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default HackathonCard;