import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { motion } from 'framer-motion';
import {
  MapPin,
  Code,
  Calendar,
  Github,
  Linkedin,
  Globe,
  Users,
  Pencil
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
}

const Discover: React.FC = () => {
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

    fetchPosts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPost = {
      name: formData.name,
      role: formData.role,
      location: formData.location,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(s => s),
      projects: formData.projects.split(',').map((p) => p.trim()).filter(p => p),
      github: formData.github,
      linkedin: formData.linkedin,
      portfolio: formData.portfolio,
      joinedDate: formData.id ? developers.find(d => d.id === formData.id)?.joinedDate || new Date().toISOString() : new Date().toISOString()
    };

    if (formData.id) {
      await updateDoc(doc(db, 'discoverposts', formData.id), newPost);
      setDevelopers(prev => prev.map(dev => dev.id === formData.id ? { ...dev, ...newPost } : dev));
    } else {
      const docRef = await addDoc(collection(db, 'discoverposts'), newPost);
      setDevelopers(prev => [...prev, { id: docRef.id, ...newPost }]);
    }

    setFormData({ id: '', name: '', role: '', location: '', skills: '', projects: '', github: '', linkedin: '', portfolio: '' });
    setShowForm(false);
  };

  const handleAddOrEditClick = () => {
    // Check if user already has a post (you might want to use auth context to get current user)
    const existingPost = developers.find(post => post.name === formData.name); // Replace with your auth logic
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
    }
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discover Collaborators</h1>
          <button
            onClick={handleAddOrEditClick}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {formData.id ? 'Edit Your Profile' : 'Let People Know About You'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" required />
            <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="Your Role" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" required />
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" required />
            <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="Skills (comma separated)" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" required />
            <input type="text" name="projects" value={formData.projects} onChange={handleChange} placeholder="Projects (comma separated)" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" required />
            <input type="url" name="github" value={formData.github} onChange={handleChange} placeholder="GitHub URL" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
            <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn URL" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
            <input type="url" name="portfolio" value={formData.portfolio} onChange={handleChange} placeholder="Portfolio URL" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
            <div className="flex space-x-3">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex-1">
                {formData.id ? 'Update Profile' : 'Create Profile'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex-1">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {developers.map((dev, index) => (
            <motion.div
              key={dev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{dev.name}</h2>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{dev.role}</p>
                </div>
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
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  aria-label="Edit profile"
                >
                  <Pencil className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400" />
                </button>
              </div>

              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">
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

              <div className="flex space-x-3 mt-4">
                {dev.github && (
                  <a 
                    href={dev.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
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
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
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
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    aria-label="Portfolio website"
                  >
                    <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300" />
                  </a>
                )}
              </div>

              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
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
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Let People Know About You
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;