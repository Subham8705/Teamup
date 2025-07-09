import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  MapPin,
  Code,
  Calendar,
  Github,
  Linkedin,
  Globe,
  Users,
  Pencil,
  UserPlus,
  UserCheck,
  Loader2,
  Search,
  Filter,
  MessageCircle,
  X,
  Lock
} from 'lucide-react';

interface Developer {
  id: string;
  name: string;
  role: string;
  location: string;
  skills: string[];
  projects: string[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  joinedDate: string;
  userId: string;
  profileVisibility?: string;
}

interface CollaborationStatus {
  [key: string]: 'none' | 'pending' | 'accepted' | 'sent';
}

interface SearchFilters {
  username: string;
  location: string;
  skills: string;
  role: string;
}

const Discover: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [collaborationStatus, setCollaborationStatus] = useState<CollaborationStatus>({});
  const [loadingCollabs, setLoadingCollabs] = useState<{ [key: string]: boolean }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [collaborators, setCollaborators] = useState<Set<string>>(new Set());
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    username: '',
    location: '',
    skills: '',
    role: ''
  });
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    role: '',
    location: '',
    skills: '',
    projects: '',
    github: '',
    linkedin: '',
    portfolio: ''
  });

  const commonRoles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'Data Scientist', 'DevOps Engineer', 'Mobile Developer', 'Product Manager'];
  const commonSkills = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'UI/UX', 'Machine Learning', 'AWS', 'Docker', 'MongoDB'];

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCollaborationStatuses();
      loadCollaborators();
    }
  }, [user, developers]);

  useEffect(() => {
    filterDevelopers();
  }, [developers, searchFilters]);

  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(db, 'discoverposts'));
    const posts: Developer[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Developer, 'id'>),
      skills: doc.data().skills || [],
      projects: doc.data().projects || []
    }));
    setDevelopers(posts);
  };

  const loadCollaborators = async () => {
    if (!user) return;

    try {
      const sentQuery = query(
        collection(db, 'collaborationRequests'),
        where('fromUserId', '==', user.uid),
        where('status', '==', 'accepted')
      );
      
      const receivedQuery = query(
        collection(db, 'collaborationRequests'),
        where('toUserId', '==', user.uid),
        where('status', '==', 'accepted')
      );

      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery)
      ]);

      const collabIds = new Set<string>();
      
      sentSnapshot.docs.forEach(doc => {
        collabIds.add(doc.data().toUserId);
      });
      
      receivedSnapshot.docs.forEach(doc => {
        collabIds.add(doc.data().fromUserId);
      });

      setCollaborators(collabIds);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    }
  };

  const fetchCollaborationStatuses = async () => {
    if (!user) return;

    const statuses: CollaborationStatus = {};

    const sentQuery = query(
      collection(db, 'collaborationRequests'),
      where('fromUserId', '==', user.uid)
    );
    
    const receivedQuery = query(
      collection(db, 'collaborationRequests'),
      where('toUserId', '==', user.uid)
    );

    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery)
    ]);

    sentSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const targetUserId = data.toUserId;
      if (data.status === 'pending') {
        statuses[targetUserId] = 'sent';
      } else if (data.status === 'accepted') {
        statuses[targetUserId] = 'accepted';
      }
    });

    receivedSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const fromUserId = data.fromUserId;
      if (data.status === 'pending') {
        statuses[fromUserId] = 'pending';
      } else if (data.status === 'accepted') {
        statuses[fromUserId] = 'accepted';
      }
    });

    setCollaborationStatus(statuses);
  };

  const filterDevelopers = () => {
    let filtered = developers;

    // Filter by username
    if (searchFilters.username.trim()) {
      filtered = filtered.filter(dev => 
        dev.name.toLowerCase().includes(searchFilters.username.toLowerCase())
      );
    }

    // Filter by location
    if (searchFilters.location.trim()) {
      filtered = filtered.filter(dev => 
        dev.location.toLowerCase().includes(searchFilters.location.toLowerCase())
      );
    }

    // Filter by skills
    if (searchFilters.skills.trim()) {
      const searchSkills = searchFilters.skills.toLowerCase().split(',').map(s => s.trim());
      filtered = filtered.filter(dev => 
        searchSkills.some(searchSkill => 
          dev.skills.some(devSkill => 
            devSkill.toLowerCase().includes(searchSkill)
          )
        )
      );
    }

    // Filter by role
    if (searchFilters.role.trim()) {
      filtered = filtered.filter(dev => 
        dev.role.toLowerCase().includes(searchFilters.role.toLowerCase())
      );
    }

    setFilteredDevelopers(filtered);
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      username: '',
      location: '',
      skills: '',
      role: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to post your profile');
      return;
    }

    const newPost = {
      name: formData.name,
      role: formData.role,
      location: formData.location,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(s => s),
      projects: formData.projects.split(',').map((p) => p.trim()).filter(p => p),
      github: formData.github,
      linkedin: formData.linkedin,
      portfolio: formData.portfolio,
      userId: user.uid,
      joinedDate: formData.id ? developers.find(d => d.id === formData.id)?.joinedDate || new Date().toISOString() : new Date().toISOString()
    };

    try {
      if (formData.id) {
        await updateDoc(doc(db, 'discoverposts', formData.id), newPost);
        setDevelopers(prev => prev.map(dev => dev.id === formData.id ? { ...dev, ...newPost } : dev));
        toast.success('Profile updated successfully!');
      } else {
        const docRef = await addDoc(collection(db, 'discoverposts'), newPost);
        setDevelopers(prev => [...prev, { id: docRef.id, ...newPost }]);
        toast.success('Profile posted successfully!');
      }

      setFormData({ id: '', name: '', role: '', location: '', skills: '', projects: '', github: '', linkedin: '', portfolio: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  const handleCollaborate = async (targetDev: Developer) => {
    if (!user || !userProfile) {
      toast.error('Please login to send collaboration requests');
      return;
    }

    if (targetDev.userId === user.uid) {
      toast.error('You cannot collaborate with yourself');
      return;
    }

    const currentStatus = collaborationStatus[targetDev.userId];
    
    if (currentStatus === 'sent') {
      toast.error('Collaboration request already sent');
      return;
    }

    if (currentStatus === 'pending') {
      toast.error('You have a pending request from this user. Check your profile.');
      return;
    }

    if (currentStatus === 'accepted') {
      toast.error('You are already collaborating with this user');
      return;
    }

    setLoadingCollabs(prev => ({ ...prev, [targetDev.userId]: true }));

    try {
      await addDoc(collection(db, 'collaborationRequests'), {
        fromUserId: user.uid,
        fromUserName: userProfile.name || user.email,
        fromUserEmail: user.email,
        toUserId: targetDev.userId,
        toUserName: targetDev.name,
        status: 'pending',
        message: `Hi ${targetDev.name}, I'd like to collaborate with you on a project!`,
        createdAt: new Date().toISOString()
      });

      setCollaborationStatus(prev => ({
        ...prev,
        [targetDev.userId]: 'sent'
      }));

      toast.success(`Collaboration request sent to ${targetDev.name}!`);
    } catch (error) {
      console.error('Error sending collaboration request:', error);
      toast.error('Failed to send collaboration request');
    } finally {
      setLoadingCollabs(prev => ({ ...prev, [targetDev.userId]: false }));
    }
  };

  const handleUncollaborate = async (targetDev: Developer) => {
    if (!user) return;

    setLoadingCollabs(prev => ({ ...prev, [targetDev.userId]: true }));

    try {
      const queries = [
        query(
          collection(db, 'collaborationRequests'),
          where('fromUserId', '==', user.uid),
          where('toUserId', '==', targetDev.userId)
        ),
        query(
          collection(db, 'collaborationRequests'),
          where('fromUserId', '==', targetDev.userId),
          where('toUserId', '==', user.uid)
        )
      ];

      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(queries[0]),
        getDocs(queries[1])
      ]);

      const deletePromises = [];
      
      sentSnapshot.docs.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      receivedSnapshot.docs.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref));
      });

      await Promise.all(deletePromises);

      setCollaborationStatus(prev => ({
        ...prev,
        [targetDev.userId]: 'none'
      }));

      // Update collaborators set
      setCollaborators(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetDev.userId);
        return newSet;
      });

      toast.success(`Collaboration with ${targetDev.name} ended`);
    } catch (error) {
      console.error('Error ending collaboration:', error);
      toast.error('Failed to end collaboration');
    } finally {
      setLoadingCollabs(prev => ({ ...prev, [targetDev.userId]: false }));
    }
  };

  const canMessageUser = async (targetDev: Developer) => {
    try {
      // Get the user's profile to check visibility settings
      const userDoc = await getDoc(doc(db, 'users', targetDev.userId));
      const userData = userDoc.data();
      
      // If user has public profile or no visibility setting (default to public), anyone can message
      if (!userData?.profileVisibility || userData.profileVisibility === 'public') {
        return true;
      }
      
      // If user has private profile, only collaborators can message
      if (userData?.profileVisibility === 'private') {
        return collaborators.has(targetDev.userId);
      }
      
      return false;
    } catch (error) {
      console.error('Error checking user profile visibility:', error);
      return false;
    }
  };

  const handleMessageCollaborator = async (targetDev: Developer) => {
    if (!user) {
      toast.error('Please login to send messages');
      return;
    }

    const canMessage = await canMessageUser(targetDev);
    
    if (!canMessage) {
      const isTeamMember = teamMembers.has(targetDev.userId);
      if (isTeamMember) {
        toast.error(`${targetDev.name} has a private profile. You can message them through your team chat instead.`);
      } else {
        toast.error(`${targetDev.name} has a private profile. Send them a collaboration request first to be able to message them.`);
      }
      return;
    }

    try {
      // Create or get existing chat
      const chatId = [user.uid, targetDev.userId].sort().join('_');
      
      // Navigate to chat with the specific user
      window.location.href = `/chat?user=${targetDev.userId}&name=${encodeURIComponent(targetDev.name)}`;
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const handleAddOrEditClick = () => {
    const existingPost = developers.find(post => post.userId === user?.uid);
    if (existingPost) {
      setFormData({
        id: existingPost.id,
        name: existingPost.name,
        role: existingPost.role,
        location: existingPost.location,
        skills: existingPost.skills.join(', '),
        projects: existingPost.projects.join(', '),
        github: existingPost.github || '',
        linkedin: existingPost.linkedin || '',
        portfolio: existingPost.portfolio || ''
      });
    } else {
      setFormData({
        id: '',
        name: userProfile?.name || user?.email?.split('@')[0] || '',
        role: userProfile?.role || '',
        location: '',
        skills: userProfile?.skills || '',
        projects: '',
        github: userProfile?.github || '',
        linkedin: userProfile?.linkedin || '',
        portfolio: userProfile?.website || ''
      });
    }
    setShowForm(true);
  };

  const getCollaborationButton = (targetDev: Developer) => {
    const status = collaborationStatus[targetDev.userId] || 'none';
    const isLoading = loadingCollabs[targetDev.userId];

    if (isLoading) {
      return (
        <button 
          disabled
          className="bg-gray-400 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center text-sm font-medium cursor-not-allowed"
        >
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          Loading...
        </button>
      );
    }

    switch (status) {
      case 'sent':
        return (
          <button 
            onClick={() => handleUncollaborate(targetDev)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md flex items-center text-sm font-medium"
          >
            <UserCheck className="w-4 h-4 mr-1" />
            Request Sent
          </button>
        );
      case 'pending':
        return (
          <button 
            disabled
            className="bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center text-sm font-medium cursor-not-allowed"
          >
            <UserCheck className="w-4 h-4 mr-1" />
            Pending Response
          </button>
        );
      case 'accepted':
        return (
          <button 
            onClick={() => handleUncollaborate(targetDev)}
            className="bg-green-600 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md flex items-center text-sm font-medium"
          >
            <UserCheck className="w-4 h-4 mr-1" />
            Collaborating
          </button>
        );
      default:
        return (
          <button 
            onClick={() => handleCollaborate(targetDev)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md flex items-center text-sm font-medium"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Collaborate
          </button>
        );
    }
  };

  const getMessageButton = (targetDev: Developer) => {
    const isCollaborator = collaborators.has(targetDev.userId);
    const isTeamMember = teamMembers.has(targetDev.userId);
    const canDirectMessage = !targetDev.profileVisibility || 
                            targetDev.profileVisibility === 'public' || 
                            isCollaborator;
    
    return (
      <button 
        onClick={() => handleMessageCollaborator(targetDev)}
        className={`px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md flex items-center text-sm font-medium ${
          canDirectMessage
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
        }`}
        disabled={targetDev.profileVisibility === 'private' && !isCollaborator}
        title={
          !canDirectMessage 
            ? isTeamMember 
              ? 'Private profile - use team chat instead'
              : 'Private profile - send collaboration request first'
            : 'Send direct message'
        }
      >
        {targetDev.profileVisibility === 'private' && !isCollaborator ? (
          <Lock className="w-4 h-4 mr-1" />
        ) : (
          <MessageCircle className="w-4 h-4 mr-1" />
        )}
        Message
      </button>
    );
  };

  const displayedDevelopers = filteredDevelopers.length > 0 ? filteredDevelopers : developers;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discover Collaborators</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Find amazing people to work with on your next project</p>
          </div>
          {user && (
            <button
              onClick={handleAddOrEditClick}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
            >
              {developers.find(d => d.userId === user.uid) ? 'Edit Your Profile' : 'Post Your Profile'}
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors duration-300">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchFilters.username}
                  onChange={(e) => handleFilterChange('username', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </button>

            {(searchFilters.username || searchFilters.location || searchFilters.skills || searchFilters.role) && (
              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            )}
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="e.g., New York, Remote"
                  value={searchFilters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</label>
                <input
                  type="text"
                  placeholder="e.g., React, Python, UI/UX"
                  value={searchFilters.skills}
                  onChange={(e) => handleFilterChange('skills', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {commonSkills.slice(0, 6).map(skill => (
                    <button
                      key={skill}
                      onClick={() => handleFilterChange('skills', skill)}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <select
                  value={searchFilters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  {commonRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {displayedDevelopers.length} developer{displayedDevelopers.length !== 1 ? 's' : ''}
            {filteredDevelopers.length !== developers.length && ` (filtered from ${developers.length})`}
          </div>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-8 transition-colors duration-300"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {formData.id ? 'Edit Your Profile' : 'Post Your Profile'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Your Name" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
                  required 
                />
                <input 
                  type="text" 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange} 
                  placeholder="Your Role (e.g., Frontend Developer)" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
                  required 
                />
              </div>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder="Location (e.g., New York, Remote)" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
                required 
              />
              <input 
                type="text" 
                name="skills" 
                value={formData.skills} 
                onChange={handleChange} 
                placeholder="Skills (comma separated, e.g., React, Node.js, Python)" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
                required 
              />
              <input 
                type="text" 
                name="projects" 
                value={formData.projects} 
                onChange={handleChange} 
                placeholder="Notable Projects (comma separated)" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
                required 
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  type="url" 
                  name="github" 
                  value={formData.github} 
                  onChange={handleChange} 
                  placeholder="GitHub URL (optional)" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
                />
                <input 
                  type="url" 
                  name="linkedin" 
                  value={formData.linkedin} 
                  onChange={handleChange} 
                  placeholder="LinkedIn URL (optional)" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
                />
                <input 
                  type="url" 
                  name="portfolio" 
                  value={formData.portfolio} 
                  onChange={handleChange} 
                  placeholder="Portfolio URL (optional)" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
                />
              </div>
              <div className="flex space-x-3">
                <button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex-1 font-medium"
                >
                  {formData.id ? 'Update Profile' : 'Post Profile'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex-1 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedDevelopers.map((dev, index) => (
            <motion.div
              key={dev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{dev.name}</h2>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{dev.role}</p>
                  {dev.profileVisibility === 'private' && (
                    <div className="flex items-center mt-1">
                      <Lock className="w-3 h-3 mr-1 text-orange-600" />
                      <span className="text-xs text-orange-600 dark:text-orange-400">Private Profile</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  {user?.uid === dev.userId && (
                    <button 
                      onClick={() => {
                        setFormData({
                          id: dev.id,
                          name: dev.name,
                          role: dev.role,
                          location: dev.location,
                          skills: dev.skills.join(', '),
                          projects: dev.projects.join(', '),
                          github: dev.github || '',
                          linkedin: dev.linkedin || '',
                          portfolio: dev.portfolio || ''
                        });
                        setShowForm(true);
                        window.scrollTo({
                          top: 0,
                          behavior: 'smooth' // Optional: adds smooth scrolling animation
                        });
                      }}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Edit profile"
                    >
                      <Pencil className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400" />
                    </button>
                  )}
                  {user && user.uid !== dev.userId && (
                    <div className="flex space-x-2">
                      {getMessageButton(dev)}
                      {getCollaborationButton(dev)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <MapPin className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                {dev.location}
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Code className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dev.skills?.length > 0 ? (
                    dev.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium shadow-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">No skills listed</span>
                  )}
                </div>
              </div>

            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Projects
                </h3>

                {dev.projects?.length > 0 ? (
                  <div className="flex flex-wrap gap-2 text-xs text-gray-700 dark:text-gray-300">
                    {dev.projects.slice(0, 3).map((project, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium shadow-sm"
                      >
                        {project}
                      </span>
                    ))}
                    {dev.projects.length > 3 && (
                      <button 
                        className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                        onClick={() => alert(dev.projects.join(', '))}
                      >
                        +{dev.projects.length - 3} more
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">No projects listed</span>
                )}
              </div>

              <div className="flex space-x-3 mb-4">
                {dev.github && (
                  <a 
                    href={dev.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label="GitHub profile"
                  >
                    <Github className="w-4 h-4 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" />
                  </a>
                )}
                {dev.linkedin && (
                  <a 
                    href={dev.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label="LinkedIn profile"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" />
                  </a>
                )}
                {dev.portfolio && (
                  <a 
                    href={dev.portfolio} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Portfolio website"
                  >
                    <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300" />
                  </a>
                )}
              </div>

              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Joined {new Date(dev.joinedDate).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {displayedDevelopers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {developers.length === 0 ? 'No profiles found' : 'No results match your search'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {developers.length === 0 
                ? 'Be the first to share your profile!' 
                : 'Try adjusting your search filters or clearing them to see more results.'
              }
            </p>
            {user && developers.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
              >
                Post Your Profile
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;