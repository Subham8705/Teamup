import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';
import {
  User, Mail, Calendar, Edit3, Github, Linkedin, Globe, Code, 
  UserPlus, Heart, Trash2, Pencil, ChevronRight, Loader2, Check, X, Eye
} from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

interface CollaborationRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toUserId: string;
  toUserName: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string;
  createdAt: string;
}

interface CollaborationMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role?: string;
  skills?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  collaborationType: 'sent' | 'received'; // Whether this user sent or received the collaboration
  startedAt: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [collaborationMembers, setCollaborationMembers] = useState<CollaborationMember[]>([]);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<any>(null);
  const [showMemberProfile, setShowMemberProfile] = useState(false);
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
  }, [uid]);

  // Fetch collaboration requests
  useEffect(() => {
    if (!uid) return;

    const fetchCollaborationRequests = async () => {
      try {
        const q = query(
          collection(db, 'collaborationRequests'),
          where('toUserId', '==', uid)
        );
        const querySnapshot = await getDocs(q);
        const requests: CollaborationRequest[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CollaborationRequest));
        setCollaborationRequests(requests);
      } catch (error) {
        console.error('Error fetching collaboration requests:', error);
      }
    };

    fetchCollaborationRequests();
  }, [uid]);

  // Fetch collaboration members (accepted collaborations)
  useEffect(() => {
    if (!uid) return;

    const fetchCollaborationMembers = async () => {
      try {
        // Get accepted collaborations where current user is either sender or receiver
        const sentQuery = query(
          collection(db, 'collaborationRequests'),
          where('fromUserId', '==', uid),
          where('status', '==', 'accepted')
        );
        
        const receivedQuery = query(
          collection(db, 'collaborationRequests'),
          where('toUserId', '==', uid),
          where('status', '==', 'accepted')
        );

        const [sentSnapshot, receivedSnapshot] = await Promise.all([
          getDocs(sentQuery),
          getDocs(receivedQuery)
        ]);

        const members: CollaborationMember[] = [];

        // Process sent collaborations (people who accepted our requests)
        for (const doc of sentSnapshot.docs) {
          const data = doc.data();
          try {
            const memberProfile = await getDoc(doc(db, 'users', data.toUserId));
            const memberData = memberProfile.data();
            members.push({
              id: doc.id,
              userId: data.toUserId,
              name: data.toUserName,
              email: memberData?.email || '',
              role: memberData?.role || '',
              skills: memberData?.skills || '',
              github: memberData?.github || '',
              linkedin: memberData?.linkedin || '',
              website: memberData?.website || '',
              collaborationType: 'sent',
              startedAt: data.createdAt
            });
          } catch (error) {
            console.error('Error fetching member profile:', error);
          }
        }

        // Process received collaborations (people whose requests we accepted)
        for (const doc of receivedSnapshot.docs) {
          const data = doc.data();
          try {
            const memberProfile = await getDoc(doc(db, 'users', data.fromUserId));
            const memberData = memberProfile.data();
            members.push({
              id: doc.id,
              userId: data.fromUserId,
              name: data.fromUserName,
              email: data.fromUserEmail,
              role: memberData?.role || '',
              skills: memberData?.skills || '',
              github: memberData?.github || '',
              linkedin: memberData?.linkedin || '',
              website: memberData?.website || '',
              collaborationType: 'received',
              startedAt: data.createdAt
            });
          } catch (error) {
            console.error('Error fetching member profile:', error);
          }
        }

        setCollaborationMembers(members);
      } catch (error) {
        console.error('Error fetching collaboration members:', error);
      }
    };

    fetchCollaborationMembers();
  }, [uid, collaborationRequests]); // Re-fetch when requests change

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
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error("Save error:", err);
      setError('Failed to save profile');
      toast.error('Failed to save profile');
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
      toast.success(editProjectId ? 'Project updated!' : 'Project added!');
    } catch (err) {
      console.error("Project error:", err);
      setError('Failed to save project');
      toast.error('Failed to save project');
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
      toast.success('Project deleted!');
    } catch (err) {
      console.error("Delete error:", err);
      setError('Failed to delete project');
      toast.error('Failed to delete project');
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

  const handleCollaborationResponse = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      const requestRef = doc(db, 'collaborationRequests', requestId);
      await updateDoc(requestRef, { status });
      
      setCollaborationRequests(prev => 
        prev.map(req => req.id === requestId ? { ...req, status } : req)
      );
      
      toast.success(`Collaboration request ${status}!`);
    } catch (error) {
      console.error('Error updating collaboration request:', error);
      toast.error('Failed to update request');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'collaborationRequests', requestId));
      setCollaborationRequests(prev => prev.filter(req => req.id !== requestId));
      toast.success('Request deleted!');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  const handleViewMemberProfile = async (member: CollaborationMember) => {
    try {
      const memberDoc = await getDoc(doc(db, 'users', member.userId));
      if (memberDoc.exists()) {
        setSelectedMemberProfile({
          ...memberDoc.data(),
          id: member.userId
        });
        setShowMemberProfile(true);
      }
    } catch (error) {
      console.error('Error fetching member profile:', error);
      toast.error('Failed to load member profile');
    }
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

  if (loading && !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
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
              className="mt-4 md:mt-0 bg-white text-purple-700 rounded-full px-5 py-2 flex items-center shadow-md disabled:opacity-50"
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
          {[
            { id: 'overview', icon: User, label: 'Overview' }, 
            { id: 'projects', icon: Code, label: 'Projects' }, 
            { id: 'collab', icon: UserPlus, label: `Collab ${collaborationRequests.filter(r => r.status === 'pending').length > 0 ? `(${collaborationRequests.filter(r => r.status === 'pending').length})` : ''}` }, 
            { id: 'about', icon: Heart, label: 'About' }
          ].map(tab => (
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
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
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
                  <div className="text-3xl font-bold text-purple-600">{collaborationMembers.length}</div>
                  <div className="text-gray-500 dark:text-gray-400 mt-1">Collaborations</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
              <h3 className="text-xl font-semibold mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(profileData?.skills?.split(',') || []).map((s: string) => (
                  s.trim() && (
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      key={s} 
                      className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
                    >
                      {s.trim()}
                    </motion.span>
                  )
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
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
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded-full flex items-center shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  showProjectForm ? 'Close' : 'Add Project +'
                )}
              </motion.button>
            </div>
            
            {showProjectForm && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddOrUpdateProject} 
                className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8 transition-colors duration-300"
              >
                <h4 className="font-medium text-lg">{editProjectId ? 'Edit Project' : 'Add New Project'}</h4>
                <input 
                  {...register('title')} 
                  placeholder="Project Title" 
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  required 
                  disabled={loading}
                />
                <textarea 
                  {...register('description')} 
                  placeholder="Project Description" 
                  rows={4}
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  required 
                  disabled={loading}
                />
                <input 
                  {...register('github')} 
                  placeholder="GitHub Link (https://...)" 
                  type="url"
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  disabled={loading}
                />
                <input 
                  {...register('link')} 
                  placeholder="Live Demo Link (https://...)" 
                  type="url"
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  disabled={loading}
                />
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setShowProjectForm(false)}
                    className="px-4 py-2 rounded-lg border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-md disabled:opacity-50 flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      editProjectId ? 'Update Project' : 'Add Project'
                    )}
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
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300"
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
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                          aria-label="Edit project"
                          disabled={loading}
                        >
                          <Pencil className="w-4 h-4 text-yellow-500" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                          aria-label="Delete project"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center transition-colors duration-300">
                  <Code className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Projects Yet</h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Add your first project to showcase your work
                  </p>
                  <button 
                    onClick={() => setShowProjectForm(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-md disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mx-auto animate-spin" />
                    ) : (
                      'Add Project'
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'collab' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Collaboration Requests */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
              <h3 className="text-xl font-semibold mb-4">Collaboration Requests</h3>
              
              {collaborationRequests.length > 0 ? (
                <div className="space-y-4">
                  {collaborationRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors duration-300"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{request.fromUserName}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                              request.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                              'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-2">{request.message}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            From: {request.fromUserEmail} • {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleCollaborationResponse(request.id, 'accepted')}
                                className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                aria-label="Accept request"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCollaborationResponse(request.id, 'declined')}
                                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                aria-label="Decline request"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Delete request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Collaboration Requests</h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    When people want to collaborate with you, their requests will appear here.
                  </p>
                </div>
              )}
            </div>

            {/* Collaboration Members */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
              <h3 className="text-xl font-semibold mb-4">My Collaborators ({collaborationMembers.length})</h3>
              
              {collaborationMembers.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {collaborationMembers.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                          <p className="text-sm text-purple-600 dark:text-purple-400">{member.role}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.collaborationType === 'sent' 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        }`}>
                          {member.collaborationType === 'sent' ? 'You invited' : 'Invited you'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{member.email}</p>
                      
                      {member.skills && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {member.skills.split(',').slice(0, 3).map((skill, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs"
                              >
                                {skill.trim()}
                              </span>
                            ))}
                            {member.skills.split(',').length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                                +{member.skills.split(',').length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          {member.github && (
                            <a 
                              href={member.github} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Github className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                            </a>
                          )}
                          {member.linkedin && (
                            <a 
                              href={member.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Linkedin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            </a>
                          )}
                          {member.website && (
                            <a 
                              href={member.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Globe className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            </a>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleViewMemberProfile(member)}
                          className="flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Profile
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Collaborating since {new Date(member.startedAt).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Collaborators Yet</h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    When you accept collaboration requests or others accept yours, they'll appear here.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'about' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300"
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
            ref={editFormRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit(handleSaveProfile)} 
            className="mt-6 space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-colors duration-300"
          >
            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  {...register('name')} 
                  placeholder="Your name" 
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input 
                  {...register('role')} 
                  placeholder="Your role" 
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
              <input 
                {...register('skills')} 
                placeholder="JavaScript, React, Node.js" 
                className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                <input 
                  {...register('linkedin')} 
                  placeholder="https://linkedin.com/in/username" 
                  type="url"
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input 
                  {...register('website')} 
                  placeholder="https://yourwebsite.com" 
                  type="url"
                  className="w-full p-3 rounded-lg border dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  disabled={loading}
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
                disabled={loading}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-md disabled:opacity-50 flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </motion.form>
        )}
      </div>

      {/* Member Profile Modal */}
      {showMemberProfile && selectedMemberProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedMemberProfile.name}'s Profile
                </h2>
                <button
                  onClick={() => setShowMemberProfile(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Basic Info</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p><strong>Role:</strong> {selectedMemberProfile.role || 'Not specified'}</p>
                    <p><strong>Email:</strong> {selectedMemberProfile.email}</p>
                    <p><strong>Joined:</strong> {selectedMemberProfile.createdAt?.toDate ? new Date(selectedMemberProfile.createdAt.toDate()).toLocaleDateString() : 'Recently'}</p>
                  </div>
                </div>

                {selectedMemberProfile.skills && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMemberProfile.skills.split(',').map((skill: string, idx: number) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMemberProfile.about && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {selectedMemberProfile.about}
                      </p>
                    </div>
                  </div>
                )}

                {selectedMemberProfile.projects && selectedMemberProfile.projects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Projects</h3>
                    <div className="space-y-3">
                      {selectedMemberProfile.projects.map((project: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{project.title}</h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{project.description}</p>
                          <div className="flex space-x-2 mt-2">
                            {project.github && (
                              <a 
                                href={project.github} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                GitHub
                              </a>
                            )}
                            {project.link && (
                              <a 
                                href={project.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Live Demo
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Social Links</h3>
                  <div className="flex space-x-4">
                    {selectedMemberProfile.github && (
                      <a 
                        href={selectedMemberProfile.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Github className="w-4 h-4 mr-1" />
                        GitHub
                      </a>
                    )}
                    {selectedMemberProfile.linkedin && (
                      <a 
                        href={selectedMemberProfile.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Linkedin className="w-4 h-4 mr-1" />
                        LinkedIn
                      </a>
                    )}
                    {selectedMemberProfile.website && (
                      <a 
                        href={selectedMemberProfile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;