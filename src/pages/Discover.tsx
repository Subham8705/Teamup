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
        ...(doc.data() as Omit<Developer, 'id'>)
      }));
      setDevelopers(posts);

      const existingPost = posts.find(post => post.name === formData.name);
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
      skills: formData.skills.split(',').map((s) => s.trim()),
      projects: formData.projects.split(',').map((p) => p.trim()),
      github: formData.github,
      linkedin: formData.linkedin,
      portfolio: formData.portfolio,
      joinedDate: new Date().toISOString()
    };

    if (formData.id) {
      await updateDoc(doc(db, 'discoverposts', formData.id), newPost);
      setDevelopers((prev) => prev.map(dev => dev.id === formData.id ? { ...dev, ...newPost } : dev));
    } else {
      const docRef = await addDoc(collection(db, 'discoverposts'), newPost);
      setDevelopers((prev) => [...prev, { id: docRef.id, ...newPost }]);
    }

    setFormData({ id: '', name: '', role: '', location: '', skills: '', projects: '', github: '', linkedin: '', portfolio: '' });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discover Collaborators</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Let People Know About You
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="Your Role" className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="Skills (comma separated)" className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            <input type="text" name="projects" value={formData.projects} onChange={handleChange} placeholder="Projects (comma separated)" className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            <input type="url" name="github" value={formData.github} onChange={handleChange} placeholder="GitHub URL" className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn URL" className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <input type="url" name="portfolio" value={formData.portfolio} onChange={handleChange} placeholder="Portfolio URL" className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">Submit</button>
          </form>
        )}

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {developers.map((dev, index) => (
            <motion.div
              key={dev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex justify-between">
                {dev.name}
                <button onClick={() => {
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
                }}>
                  <Pencil className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                </button>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{dev.role}</p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                {dev.location}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {dev.skills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <strong>Projects:</strong>{' '}
                {dev.projects.length <= 3 ? (
                  dev.projects.join(', ')
                ) : (
                  <>
                    {dev.projects.slice(0, 2).join(', ')}{' '}
                    <button className="text-blue-600 hover:underline" onClick={() => alert(dev.projects.join(', '))}>
                      more
                    </button>
                  </>
                )}
              </div>
              <div className="flex space-x-2 text-gray-400">
                {dev.github && (
                  <a href={dev.github} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4 hover:text-gray-600 dark:hover:text-gray-300" />
                  </a>
                )}
                {dev.linkedin && (
                  <a href={dev.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4 hover:text-blue-600 dark:hover:text-blue-400" />
                  </a>
                )}
                {dev.portfolio && (
                  <a href={dev.portfolio} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 hover:text-purple-600 dark:hover:text-purple-400" />
                  </a>
                )}
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
            <p className="text-gray-600 dark:text-gray-300">Be the first to share your profile!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
