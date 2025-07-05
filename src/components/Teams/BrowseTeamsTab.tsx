import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Users, Clock, Tag } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  maxMembers: number;
  currentMembers: number;
  members: string[];
  ownerId: string;
  ownerName: string;
  requiredSkills: string[];
  status: string;
  createdAt: string;
}

interface BrowseTeamsTabProps {
  teams: Team[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  onApplyToTeam: (team: Team) => void;
  currentUserId: string | undefined;
}

const BrowseTeamsTab: React.FC<BrowseTeamsTabProps> = ({
  teams,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  onApplyToTeam,
  currentUserId
}) => {
  const categories = ['All', 'Startup', 'Hackathon', 'Open Source', 'Research', 'Learning', 'Competition', 'Side Project'];
  const locations = ['All', 'Remote', 'New York', 'San Francisco', 'Los Angeles', 'London', 'Berlin', 'Global'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Closed': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'Full': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Startup': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'Hackathon': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'Open Source': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Research': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Learning': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'Competition': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'Side Project': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const filteredTeams = teams.filter(team => {
    // Don't show teams where user is already a member or owner
    if (team.ownerId === currentUserId || team.members.includes(currentUserId || '')) {
      return false;
    }

    // Don't show full teams
    if (team.status === 'Full' || team.currentMembers >= team.maxMembers) {
      return false;
    }

    const matchesSearch = searchTerm === '' || 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || team.category === selectedCategory;
    const matchesLocation = selectedLocation === 'All' || team.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredTeams.length} available team{filteredTeams.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(team.status)}`}>
                    {team.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(team.category)}`}>
                    {team.category}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {team.name}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {team.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{team.currentMembers}/{team.maxMembers} members</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{team.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {team.requiredSkills && team.requiredSkills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    Required Skills:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {team.requiredSkills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {team.requiredSkills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                        +{team.requiredSkills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>Owner: {team.ownerName}</span>
              </div>

              <button
                onClick={() => onApplyToTeam(team)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Apply to Join
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No teams found</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {teams.length === 0 
              ? 'No teams available yet. Be the first to create one!' 
              : 'Try adjusting your search filters or create a new team.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default BrowseTeamsTab;