import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
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
  UserPlus
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
  userId: string; // Add userId to track who posted
}

const Discover: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [showForm, setShowForm] = useState(false);
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

  useEffect(() => {
    fetchPosts();
  }, []);

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

    try {
      // Create collaboration request
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

      toast.success(`Collaboration request sent to ${targetDev.name}!`);
    } catch (error) {
      console.error('Error sending collaboration request:', error);
      toast.error('Failed to send collaboration request');
    }
  };

  const handleAddOrEditClick = () => {
    // Check if current user already has a post
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
      // Pre-fill with user profile data if available
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
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

        <div className="grid md:grid-cols-2 gap-6">
          {developers.map((dev, index) => (
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
                      }}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Edit profile"
                    >
                      <Pencil className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400" />
                    </button>
                  )}
                  {user && user.uid !== dev.userId && (
                    <button 
                      onClick={() => handleCollaborate(dev)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md flex items-center text-sm font-medium"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Collaborate
                    </button>
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
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {dev.projects?.length > 0 ? (
                    dev.projects.length <= 3 ? (
                      dev.projects.join(', ')
                    ) : (
                      <>
                        {dev.projects.slice(0, 2).join(', ')}{' '}
                        <button 
                          className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                          onClick={() => alert(dev.projects.join(', '))}
                        >
                          +{dev.projects.length - 2} more
                        </button>
                      </>
                    )
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">No projects listed</span>
                  )}
                </div>
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

        {developers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No profiles found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Be the first to share your profile!</p>
            {user && (
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