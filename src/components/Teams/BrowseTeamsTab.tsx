import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Users, Clock, Tag, Eye, X } from 'lucide-react';

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
  onViewTeam: (team: Team) => void;
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
  onViewTeam,
  currentUserId
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showModal, setShowModal] = useState(false);

  const categories = ['All', 'Startup', 'Hackathon', 'Open Source', 'Research', 'Learning', 'Competition', 'Side Project'];
  const locations = ['All', 'Remote', 'New York', 'San Francisco', 'Los Angeles', 'London', 'Berlin', 'Global'];

  const handleViewTeam = (team: Team) => {
    setSelectedTeam(team);
    setShowModal(true);
    onViewTeam(team);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTeam(null);
  };

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
    if (team.ownerId === currentUserId || team.members.includes(currentUserId || '')) return false;
    if (team.status === 'Full' || team.currentMembers >= team.maxMembers) return false;

    const matchesSearch = searchTerm === '' ||
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || team.category === selectedCategory;
    const matchesLocation = selectedLocation === 'All' || team.location === selectedLocation;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  const userOwnedTeams = teams.filter(team => team.ownerId === currentUserId);

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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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

      {/* Your Teams */}
      {currentUserId && userOwnedTeams.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Teams</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userOwnedTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(team.status)}`}>{team.status}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(team.category)}`}>{team.category}</span>
                    </div>
                    <button
                      onClick={() => handleViewTeam(team)}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      title="View Team Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{team.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{team.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400"><Users className="w-4 h-4 mr-2" /><span>{team.currentMembers}/{team.maxMembers} members</span></div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400"><MapPin className="w-4 h-4 mr-2" /><span>{team.location}</span></div>
                  </div>
                  {/* <button
                    onClick={() => handleViewTeam(team)}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    <Eye className="w-4 h-4 mr-2 inline" />
                    View Details
                  </button> */}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Available Teams */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Teams</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(team.status)}`}>{team.status}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(team.category)}`}>{team.category}</span>
                  </div>
                  <button
                    onClick={() => handleViewTeam(team)}
                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="View Team Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{team.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{team.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400"><Users className="w-4 h-4 mr-2" /><span>{team.currentMembers}/{team.maxMembers} members</span></div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400"><MapPin className="w-4 h-4 mr-2" /><span>{team.location}</span></div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400"><Clock className="w-4 h-4 mr-2" /><span>Created {new Date(team.createdAt).toLocaleDateString()}</span></div>
                </div>
                {team.requiredSkills && team.requiredSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"><Tag className="w-4 h-4 mr-1" />Required Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {team.requiredSkills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">{skill}</span>
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
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                >
                  Apply to Join
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* No Teams Found */}
      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No teams found</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {teams.length === 0 
              ? 'No teams available yet. Be the first to create one!' 
              : 'Try adjusting your search filters or create a new team.'}
          </p>
        </div>
      )}

      {/* Team Details Modal */}
      <AnimatePresence>
        {showModal && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedTeam.name}</h2>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTeam.status)}`}>{selectedTeam.status}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedTeam.category)}`}>{selectedTeam.category}</span>
                    </div>
                  </div>
                  <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300">{selectedTeam.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600 dark:text-gray-300"><Users className="w-5 h-5 mr-2" /><span>{selectedTeam.currentMembers}/{selectedTeam.maxMembers} members</span></div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300"><MapPin className="w-5 h-5 mr-2" /><span>{selectedTeam.location}</span></div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300"><Clock className="w-5 h-5 mr-2" /><span>Created {new Date(selectedTeam.createdAt).toLocaleDateString()}</span></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Team Owner</p>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedTeam.ownerName}</p>
                    </div>
                  </div>

                  {selectedTeam.requiredSkills && selectedTeam.requiredSkills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTeam.requiredSkills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={() => {
                        onApplyToTeam(selectedTeam);
                        handleCloseModal();
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700"
                    >
                      Apply to Join
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrowseTeamsTab;
