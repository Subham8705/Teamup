import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Filter, Search, Tag, Calendar, User, Users } from 'lucide-react';
import IdeaCard from '../components/Ideas/IdeaCard';
import NewIdeaModal from '../components/Ideas/NewIdeaModal';

const Ideas: React.FC = () => {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewIdeaModal, setShowNewIdeaModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState('');
  const { user } = useAuth();

  const allTags = ['AI', 'Web Development', 'Mobile App', 'Blockchain', 'IoT', 'Game Dev', 'Data Science', 'UI/UX', 'Fintech', 'EdTech'];
  const stages = ['Idea', 'In Progress', 'Completed'];

  useEffect(() => {
    fetchIdeas();
  }, []);

  useEffect(() => {
    filterIdeas();
  }, [ideas, searchTerm, selectedTags, selectedStage]);

  const fetchIdeas = async () => {
    try {
      const ideasQuery = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(ideasQuery);
      const ideasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIdeas(ideasData);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIdeas = () => {
    let filtered = ideas;

    if (searchTerm) {
      filtered = filtered.filter(idea => 
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(idea => 
        selectedTags.some(tag => idea.tags.includes(tag))
      );
    }

    if (selectedStage) {
      filtered = filtered.filter(idea => idea.stage === selectedStage);
    }

    setFilteredIdeas(filtered);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleIdeaUpdate = () => {
    fetchIdeas();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading amazing ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ideas Hub</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Discover and share innovative project ideas</p>
            </div>
            {user && (
              <button
                onClick={() => setShowNewIdeaModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Share Idea
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors duration-300">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Stage Filter */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Stages</option>
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by tags:</p>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ideas Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <IdeaCard idea={idea} onUpdate={handleIdeaUpdate} />
            </motion.div>
          ))}
        </div>

        {filteredIdeas.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No ideas found</h3>
            <p className="text-gray-600 dark:text-gray-300">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* New Idea Modal */}
      {showNewIdeaModal && (
        <NewIdeaModal
          isOpen={showNewIdeaModal}
          onClose={() => setShowNewIdeaModal(false)}
          onSuccess={() => {
            setShowNewIdeaModal(false);
            fetchIdeas();
          }}
        />
      )}
    </div>
  );
};

export default Ideas;