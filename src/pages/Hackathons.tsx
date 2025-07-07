import React, { useState } from 'react';
import { ChevronLeft, Trophy, Search, Filter } from 'lucide-react';
import HackathonCard from '../components/hackathonrelated/HackathonCard';
import KnowAboutDrawer from '../components/hackathonrelated/KnowAboutDrawer';

const Hackathons: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'AI/ML', 'Blockchain', 'Web Development', 'Mobile', 'IoT', 'Fintech'];

  const hackathons = [
    {
      platform: 'Devfolio',
      platformIcon: 'https://res.cloudinary.com/dfc8a9imb/image/upload/v1751890685/devfolio_kevjmm.jpg',
      description: 'Premier platform for tech hackathons worldwide with 1000+ events annually',
      link: 'https://devfolio.co/hackathons'
    },
    {
      platform: 'Unstop',
      platformIcon: 'https://res.cloudinary.com/dfc8a9imb/image/upload/v1751890725/unstop_rqcikq.png',
      description: 'Student-focused hackathons with prizes, internships, and job opportunities',
      link: 'https://unstop.com/hackathons'
    },
    {
      platform: 'MLH',
      platformIcon: 'https://res.cloudinary.com/dfc8a9imb/image/upload/v1751890762/mlh_kmggyx.png',
      description: 'Major League Hacking - Official student hackathon league',
      link: 'https://mlh.io/events'
    },
    {
      platform: 'HackerEarth',
      platformIcon: 'https://res.cloudinary.com/dfc8a9imb/image/upload/v1751890828/hackearth_onhqkf.png',
      description: 'Corporate and developer-focused hackathons with large prize pools',
      link: 'https://hackerearth.com/hackathons'
    },
    {
      platform: 'Devpost',
      platformIcon: 'https://res.cloudinary.com/dfc8a9imb/image/upload/v1751890922/devpost_crxxbz.png',
      description: 'Diverse hackathons from tech companies and communities',
      link: 'https://devpost.com/hackathons'
    },
    {
      platform: 'AngelHack',
      platformIcon: 'https://res.cloudinary.com/dfc8a9imb/image/upload/v1751890881/anglehack_nhysqr.png',
      description: 'Global hackathon series with focus on startup creation',
      link: 'https://angelhack.com/events'
    }
  ];

  const filteredHackathons = hackathons.filter(hackathon => {
    const searchMatch = hackathon.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       hackathon.description.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Hackathon Platforms</h1>
                  <p className="text-xl text-purple-100">
                    Discover platforms hosting amazing hackathons worldwide
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="group bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-3 border border-white/30"
              >
                <span>Know about Hackathon</span>
                <ChevronLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-12 transition-colors duration-300">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search platforms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300"
            />
          </div>
        </div>

        {/* Hackathons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHackathons.map((hackathon, index) => (
            <HackathonCard
              key={index}
              platform={hackathon.platform}
              platformIcon={hackathon.platformIcon}
              description={hackathon.description}
              link={hackathon.link}
            />
          ))}
        </div>

        {filteredHackathons.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No platforms found</h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {searchTerm ? `No results for "${searchTerm}"` : 'Try a different search'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      <KnowAboutDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
};

export default Hackathons;