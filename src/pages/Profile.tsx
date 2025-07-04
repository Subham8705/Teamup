import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import {
  User, Mail, Calendar, Edit3, Clock, DollarSign, Star,
  Github, Linkedin, Globe, Code, UserPlus, Heart
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { register, handleSubmit, reset } = useForm();
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

  const handleSave = async (data: any) => {
    if (!uid) return;
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, data, { merge: true });
    setProfileData(data);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-800 dark:text-gray-100">Please log in to view your profile.</p>
      </div>
    );
  }

  const renderField = (label: string, key: string, placeholder: string) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        {...register(key)}
        placeholder={placeholder}
        className="w-full p-2 rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{profileData?.name || user.email}</h1>
              <p className="text-purple-100">{profileData?.role || 'Developer'}</p>
              <div className="flex space-x-4 mt-2 text-sm">
                <div className="flex items-center"><Mail className="w-4 h-4 mr-1" />{user.email}</div>
                <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" />Joined {new Date(user.metadata.creationTime || '').toLocaleDateString()}</div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 flex space-x-6 py-3">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'projects', label: 'Projects', icon: Code },
            { id: 'collaboration', label: 'Collab', icon: UserPlus },
            { id: 'about', label: 'About Me', icon: Heart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 text-sm font-medium px-2 py-1 ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-500'
                  : 'text-gray-500 dark:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isEditing ? (
          <form onSubmit={handleSubmit(handleSave)} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            {renderField('Name', 'name', 'John Doe')}
            {renderField('Role', 'role', 'Frontend Developer')}
            {renderField('Skills (comma separated)', 'skills', 'React, Node.js')}
            {renderField('GitHub URL', 'github', 'https://github.com/yourname')}
            {renderField('LinkedIn URL', 'linkedin', 'https://linkedin.com/in/yourname')}
            {renderField('Website', 'website', 'https://yourportfolio.com')}
            {renderField('About Me', 'about', 'A brief about you')}

            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-gray-800 dark:text-gray-200">
            <div>
              <h3 className="text-xl font-semibold">About Me</h3>
              <p>{profileData?.about || 'No description added.'}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Skills</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {(profileData?.skills?.split(',') || []).map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Links</h3>
              <ul className="space-y-2 mt-2">
                {profileData?.github && (
                  <li className="flex items-center"><Github className="w-4 h-4 mr-2" /><a href={profileData.github} target="_blank" className="text-blue-500">{profileData.github}</a></li>
                )}
                {profileData?.linkedin && (
                  <li className="flex items-center"><Linkedin className="w-4 h-4 mr-2" /><a href={profileData.linkedin} target="_blank" className="text-blue-500">{profileData.linkedin}</a></li>
                )}
                {profileData?.website && (
                  <li className="flex items-center"><Globe className="w-4 h-4 mr-2" /><a href={profileData.website} target="_blank" className="text-blue-500">{profileData.website}</a></li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
