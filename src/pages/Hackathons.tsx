import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, MapPin, DollarSign, Users, ExternalLink, Filter } from 'lucide-react';

const Hackathons: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');

  const categories = ['All', 'AI/ML', 'Blockchain', 'Web Development', 'Mobile', 'IoT', 'Fintech'];
  const platforms = ['All', 'Devfolio', 'Unstop', 'MLH', 'HackerEarth'];

  const hackathons = [
    {
      id: 1,
      title: 'AI Innovation Challenge 2024',
      organizer: 'TechCorp',
      logo: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=100',
      description: 'Build innovative AI solutions for real-world problems',
      prize: '$50,000',
      startDate: '2024-02-15',
      endDate: '2024-02-17',
      location: 'San Francisco, CA',
      category: 'AI/ML',
      platform: 'Devfolio',
      participants: 1500,
      maxParticipants: 2000,
      difficulty: 'Advanced',
      status: 'Open'
    },
    {
      id: 2,
      title: 'Web3 Builders Hackathon',
      organizer: 'BlockchainHub',
      logo: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=100',
      description: 'Create decentralized applications for the future',
      prize: '$30,000',
      startDate: '2024-03-01',
      endDate: '2024-03-03',
      location: 'Virtual',
      category: 'Blockchain',
      platform: 'Unstop',
      participants: 800,
      maxParticipants: 1000,
      difficulty: 'Intermediate',
      status: 'Open'
    },
    {
      id: 3,
      title: 'Mobile App Development Sprint',
      organizer: 'MobileDev Inc',
      logo: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=100',
      description: 'Build the next generation of mobile applications',
      prize: '$20,000',
      startDate: '2024-03-15',
      endDate: '2024-03-17',
      location: 'New York, NY',
      category: 'Mobile',
      platform: 'MLH',
      participants: 600,
      maxParticipants: 800,
      difficulty: 'Beginner',
      status: 'Open'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Closed': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'Upcoming': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const filteredHackathons = hackathons.filter(hackathon => {
    const categoryMatch = selectedCategory === '' || selectedCategory === 'All' || hackathon.category === selectedCategory;
    const platformMatch = selectedPlatform === '' || selectedPlatform === 'All' || hackathon.platform === selectedPlatform;
    return categoryMatch && platformMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Hackathon Hub</h1>
            <p className="text-xl text-purple-100">
              Discover amazing hackathons and compete with the best developers worldwide
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors duration-300">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category === 'All' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {platforms.map(platform => (
                <option key={platform} value={platform === 'All' ? '' : platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hackathons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon, index) => (
            <motion.div
              key={hackathon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={hackathon.logo}
                      alt={hackathon.organizer}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{hackathon.organizer}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{hackathon.platform}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hackathon.status)}`}>
                      {hackathon.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(hackathon.difficulty)}`}>
                      {hackathon.difficulty}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  {hackathon.title}
                </h2>

                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {hackathon.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                    <span className="font-medium">Prize: {hackathon.prize}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2 text-red-500" />
                    <span>{hackathon.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-2 text-purple-500" />
                    <span>{hackathon.participants}/{hackathon.maxParticipants} participants</span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                    {hackathon.category}
                  </span>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                    Register Team
                  </button>
                  <button className="flex-1 border border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 py-2 rounded-lg font-semibold hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white transition-all duration-300">
                    Find Team
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredHackathons.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No hackathons found</h3>
            <p className="text-gray-600 dark:text-gray-300">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hackathons;