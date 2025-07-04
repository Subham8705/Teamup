import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import {
  User, Mail, Calendar, Edit3, UserPlus, Heart, Code, Loader2
} from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

// Import the new components
import OverviewTab from '../components/Profile/OverviewTab';
import ProjectsTab from '../components/Profile/ProjectsTab';
import CollabTab from '../components/Profile/CollabTab';
import AboutTab from '../components/Profile/AboutTab';
import EditProfileForm from '../components/Profile/EditProfileForm';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const editFormRef = useRef<HTMLFormElement>(null);
  const uid = user?.uid;

  // Initialize or fetch user profile
  useEffect(() => {
    if (!uid) return;

    const initializeProfile = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          // Create new profile with default values
          await setDoc(docRef, {
            name: user.displayName || user.email?.split('@')[0] || 'New User',
            email: user.email,
            role: 'Developer',
            skills: '',
            about: '',
            github: '',
            linkedin: '',
            website: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            projects: []
          });
        }

        // Load profile data
        const profile = (await getDoc(docRef)).data();
        setProfileData(profile);
        reset(profile);
      } catch (err) {
        console.error("Profile error:", err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    initializeProfile();
  }, [uid, user, reset]);

  const handleSaveProfile = async (data: any) => {
    if (!uid) {
      setError('No user logged in');
      return;
    }

    try {
      setLoading(true);
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, { 
        ...data,
        updatedAt: new Date() 
      }, { merge: true });
      
      const updatedProfile = (await getDoc(docRef)).data();
      setProfileData(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error("Save error:", err);
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateProject = async (e: any) => {
    e.preventDefault();
    if (!uid) return;

    try {
      setLoading(true);
      const form = e.target;
      const newProject = {
        id: editProjectId || uuidv4(),
        title: form.title.value,
        description: form.description.value,
        github: form.github.value,
        link: form.link.value,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      const currentProjects = docSnap.data()?.projects || [];

      const updatedProjects = editProjectId
        ? currentProjects.map((proj: any) => 
            proj.id === editProjectId ? { ...proj, ...newProject } : proj
          )
        : [...currentProjects, newProject];

      await updateDoc(docRef, { 
        projects: updatedProjects,
        updatedAt: new Date() 
      });
      
      setProfileData((prev: any) => ({ ...prev, projects: updatedProjects }));
      setShowProjectForm(false);
      setEditProjectId(null);
      form.reset();
    } catch (err) {
      console.error("Project error:", err);
      setError('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!uid) return;

    try {
      setLoading(true);
      const docRef = doc(db, 'users', uid);
      const currentProjects = profileData.projects.filter((p: any) => p.id !== id);
      
      await updateDoc(docRef, { 
        projects: currentProjects,
        updatedAt: new Date() 
      });
      
      setProfileData((prev: any) => ({ ...prev, projects: currentProjects }));
    } catch (err) {
      console.error("Delete error:", err);
      setError('Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = (project: any) => {
    setEditProjectId(project.id);
    setValue('title', project.title);
    setValue('description', project.description);
    setValue('github', project.github);
    setValue('link', project.link);
    setShowProjectForm(true);
  };

  const handleEditButtonClick = () => {
    const willEdit = !isEditing;
    setIsEditing(willEdit);
    
    if (willEdit && editFormRef.current) {
      setTimeout(() => {
        editFormRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Profile Access</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  if (loading && !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-4 text-red-500">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', icon: User, label: 'Overview' },
    { id: 'projects', icon: Code, label: 'Projects' },
    { id: 'collab', icon: UserPlus, label: 'Collab' },
    { id: 'about', icon: Heart, label: 'About' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
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
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {profileData?.createdAt?.toDate 
                    ? new Date(profileData.createdAt.toDate()).toLocaleDateString() 
                    : 'Recently'}
                </div>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEditButtonClick}
              disabled={loading}
              className="mt-4 md:mt-0 bg-white text-purple-700 rounded-full px-5 py-2 flex items-center shadow-md disabled:opacity-50 transition-all duration-300"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Edit3 className="w-4 h-4 mr-2" />
              )}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex space-x-6 overflow-x-auto py-4 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={loading}
              className={`flex items-center space-x-2 pb-2 px-1 transition-all duration-200 disabled:opacity-50 ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'overview' && <OverviewTab profileData={profileData} />}
        
        {activeTab === 'projects' && (
          <ProjectsTab
            profileData={profileData}
            showProjectForm={showProjectForm}
            setShowProjectForm={setShowProjectForm}
            editProjectId={editProjectId}
            setEditProjectId={setEditProjectId}
            handleAddOrUpdateProject={handleAddOrUpdateProject}
            handleDeleteProject={handleDeleteProject}
            handleEditProject={handleEditProject}
            loading={loading}
          />
        )}
        
        {activeTab === 'collab' && (
          <CollabTab profileData={profileData} loading={loading} />
        )}
        
        {activeTab === 'about' && <AboutTab profileData={profileData} />}

        {isEditing && (
          <div ref={editFormRef}>
            <EditProfileForm
              profileData={profileData}
              onSubmit={handleSaveProfile}
              onCancel={() => setIsEditing(false)}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;