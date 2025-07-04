import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import {
  User, Mail, Calendar, Edit3, Github, Linkedin, Globe, Code, 
  UserPlus, Heart, Trash2, Pencil, ChevronRight } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm();
  const [profileData, setProfileData] = useState<any>(null);
  const uid = user?.uid;

  useEffect(() => {
    if (uid) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
          reset(docSnap.data());
        }
      };
      fetchProfile();
    }
  }, [uid]);

  const handleSaveProfile = async (data: any) => {
    if (!uid) return;
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, data, { merge: true });
    setProfileData(data);
    setIsEditing(false);
  };

  const handleAddOrUpdateProject = async (e: any) => {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value;
    const description = form.description.value;
    const github = form.github.value;
    const link = form.link.value;

    const newProject = {
      id: editProjectId || uuidv4(),
      title,
      description,
      github,
      link
    };

    const updatedProjects = editProjectId
      ? profileData.projects.map((proj: any) => (proj.id === editProjectId ? newProject : proj))
      : [...(profileData.projects || []), newProject];

    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { projects: updatedProjects });
    setProfileData((prev: any) => ({ ...prev, projects: updatedProjects }));
    setShowProjectForm(false);
    setEditProjectId(null);
    form.reset();
  };

  const handleDeleteProject = async (id: string) => {
    const updated = profileData.projects.filter((p: any) => p.id !== id);
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { projects: updated });
    setProfileData((prev: any) => ({ ...prev, projects: updated }));
  };

  const handleEditProject = (project: any) => {
    setEditProjectId(project.id);
    setValue('title', project.title);
    setValue('description', project.description);
    setValue('github', project.github);
    setValue('link', project.link);
    setShowProjectForm(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Profile Access</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 shadow-lg"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{profileData?.name || user.email}</h1>
              <p className="text-purple-100 mt-1">{profileData?.role || 'Developer'}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mt-3">
                <div className="flex items-center bg-purple-500/20 px-3 py-1 rounded-full">
                  <Mail className="w-4 h-4 mr-1" />{user.email}
                </div>
                <div className="flex items-center bg-purple-500/20 px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4 mr-1" />Joined {new Date(user.metadata.creationTime || '').toLocaleDateString()}
                </div>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(!isEditing)} 
              className="mt-4 md:mt-0 bg-white text-purple-700 rounded-full px-5 py-2 flex items-center shadow-md"
            >
              <Edit3 className="w-4 h-4 mr-2" /> {isEditing ? 'Cancel' : 'Edit Profile'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex space-x-6 overflow-x-auto py-4 hide-scrollbar">
          {[{ id: 'overview', icon: User, label: 'Overview' }, { id: 'projects', icon: Code, label: 'Projects' }, { id: 'collab', icon: UserPlus, label: 'Collab' }, { id: 'about', icon: Heart, label: 'About' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 pb-2 px-1 transition-all duration-200 ${activeTab === tab.id ? 'text-purple-600 border-b-2 border-purple-600 font-medium' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Profile Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{profileData?.projects?.length || 0}</div>
                  <div className="text-gray-500 dark:text-gray-400 mt-1">Projects</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{(profileData?.skills?.split(',') || []).length}</div>
                  <div className="text-gray-500 dark:text-gray-400 mt-1">Skills</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">0</div>
                  <div className="text-gray-500 dark:text-gray-400 mt-1">Collaborations</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(profileData?.skills?.split(',') || []).map((s: string) => (
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    key={s} 
                    className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
                  >
                    {s.trim()}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Social Links</h3>
              <ul className="space-y-3">
                {profileData?.github && (
                  <motion.li whileHover={{ x: 5 }}>
                    <a href={profileData.github} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 hover:text-blue-600">
                      <Github className="w-5 h-5 mr-3" />
                      <span>GitHub Profile</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </a>
                  </motion.li>
                )}
                {profileData?.linkedin && (
                  <motion.li whileHover={{ x: 5 }}>
                    <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 hover:text-blue-600">
                      <Linkedin className="w-5 h-5 mr-3" />
                      <span>LinkedIn Profile</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </a>
                  </motion.li>
                )}
                {profileData?.website && (
                  <motion.li whileHover={{ x: 5 }}>
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 hover:text-blue-600">
                      <Globe className="w-5 h-5 mr-3" />
                      <span>Personal Website</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </a>
                  </motion.li>
                )}
              </ul>
            </div>
          </motion.div>
        )}

        {activeTab === 'projects' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">My Projects</h3>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setShowProjectForm(!showProjectForm); setEditProjectId(null); }} 
                className="bg-purple-600 text-white px-4 py-2 rounded-full flex items-center shadow-md"
              >
                {showProjectForm ? 'Close' : 'Add Project +'}
              </motion.button>
            </div>
            
            {showProjectForm && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddOrUpdateProject} 
                className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8"
              >
                <h4 className="font-medium text-lg">{editProjectId ? 'Edit Project' : 'Add New Project'}</h4>
                <input 
                  {...register('title')} 
                  placeholder="Project Title" 
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  required 
                />
                <textarea 
                  {...register('description')} 
                  placeholder="Project Description" 
                  rows={4}
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  required 
                />
                <input 
                  {...register('github')} 
                  placeholder="GitHub Link (https://...)" 
                  type="url"
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                />
                <input 
                  {...register('link')} 
                  placeholder="Live Demo Link (https://...)" 
                  type="url"
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                />
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setShowProjectForm(false)}
                    className="px-4 py-2 rounded-lg border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-md"
                  >
                    {editProjectId ? 'Update Project' : 'Add Project'}
                  </button>
                </div>
              </motion.form>
            )}

            <div className="space-y-4">
              {profileData?.projects?.length ? (
                profileData.projects.map((project: any) => (
                  <motion.div 
                    key={project.id}
                    whileHover={{ y: -2 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold mb-2">{project.title}</h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                        <div className="flex flex-wrap gap-3">
                          {project.github && (
                            <a 
                              href={project.github} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
                            >
                              <Github className="w-4 h-4 mr-1" /> GitHub
                            </a>
                          )}
                          {project.link && (
                            <a 
                              href={project.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
                            >
                              <Globe className="w-4 h-4 mr-1" /> Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4 md:mt-0">
                        <button 
                          onClick={() => handleEditProject(project)}
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          aria-label="Edit project"
                        >
                          <Pencil className="w-4 h-4 text-yellow-500" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          aria-label="Delete project"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center">
                  <Code className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Projects Yet</h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Add your first project to showcase your work
                  </p>
                  <button 
                    onClick={() => setShowProjectForm(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-md"
                  >
                    Add Project
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'about' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <h3 className="text-xl font-semibold mb-4">About Me</h3>
            {profileData?.about ? (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {profileData.about}
              </p>
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No description added yet. Edit your profile to add an about section.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {isEditing && (
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit(handleSaveProfile)} 
            className="mt-6 space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  {...register('name')} 
                  placeholder="Your name" 
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input 
                  {...register('role')} 
                  placeholder="Your role" 
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
              <input 
                {...register('skills')} 
                placeholder="JavaScript, React, Node.js" 
                className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">GitHub URL</label>
                <input 
                  {...register('github')} 
                  placeholder="https://github.com/username" 
                  type="url"
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                <input 
                  {...register('linkedin')} 
                  placeholder="https://linkedin.com/in/username" 
                  type="url"
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input 
                  {...register('website')} 
                  placeholder="https://yourwebsite.com" 
                  type="url"
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">About Me</label>
              <textarea 
                {...register('about')} 
                placeholder="Tell us about yourself..." 
                rows={5}
                className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-md"
              >
                Save Changes
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default Profile;