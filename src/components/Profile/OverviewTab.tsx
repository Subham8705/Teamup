import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Globe, ChevronRight, Lock, Eye } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface OverviewTabProps {
  profileData: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ profileData }) => {
  const { user } = useAuth();
  const [collaborationsCount, setCollaborationsCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCollaborationsCount();
    }
  }, [user]);

  const fetchCollaborationsCount = async () => {
    if (!user) return;

    try {
      // Count accepted collaborations where user is either sender or receiver
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

      const totalCollaborations = sentSnapshot.size + receivedSnapshot.size;
      setCollaborationsCount(totalCollaborations);
    } catch (error) {
      console.error('Error fetching collaborations count:', error);
    }
  };

  const formatJoinDate = (createdAt: any) => {
    if (!createdAt) return 'Recently';
    
    let date;
    if (createdAt.toDate) {
      // Firestore Timestamp
      date = createdAt.toDate();
    } else if (createdAt instanceof Date) {
      // JavaScript Date
      date = createdAt;
    } else if (typeof createdAt === 'string') {
      // ISO string
      date = new Date(createdAt);
    } else {
      return 'Recently';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Profile Visibility Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Profile Settings</h3>
        <div className={`flex items-center p-4 rounded-lg border-l-4 ${
          profileData?.profileVisibility === 'private'
            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400'
            : 'bg-green-50 dark:bg-green-900/20 border-green-400'
        }`}>
          <div className="flex items-center">
            {profileData?.profileVisibility === 'private' ? (
              <Lock className="w-5 h-5 mr-3 text-orange-600" />
            ) : (
              <Globe className="w-5 h-5 mr-3 text-green-600" />
            )}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {profileData?.profileVisibility === 'private' ? 'Private Profile' : 'Public Profile'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {profileData?.profileVisibility === 'private' 
                  ? 'Only collaborators can message you directly'
                  : 'Anyone can find and message you'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Join Date */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Member Since</h3>
        <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-4">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {formatJoinDate(profileData?.createdAt)}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome to the TeamUp community!
            </p>
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Profile Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{profileData?.projects?.length || 0}</div>
            <div className="text-gray-500 dark:text-gray-400 mt-1">Projects</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {(profileData?.skills?.split(',') || []).filter((s: string) => s.trim()).length}
            </div>
            <div className="text-gray-500 dark:text-gray-400 mt-1">Skills</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {collaborationsCount}
            </div>
            <div className="text-gray-500 dark:text-gray-400 mt-1">Collaborations</div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {(profileData?.skills?.split(',') || []).map((skill: string) => (
            skill.trim() && (
              <motion.span 
                whileHover={{ scale: 1.05 }}
                key={skill} 
                className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
              >
                {skill.trim()}
              </motion.span>
            )
          ))}
          {(!profileData?.skills || profileData.skills.trim() === '') && (
            <span className="text-gray-500 dark:text-gray-400 text-sm">No skills added yet</span>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Social Links</h3>
        <ul className="space-y-3">
          {profileData?.github && (
            <motion.li whileHover={{ x: 5 }}>
              <a 
                href={profileData.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-blue-500 hover:text-blue-600 transition-colors"
              >
                <Github className="w-5 h-5 mr-3" />
                <span>GitHub Profile</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </a>
            </motion.li>
          )}
          {profileData?.linkedin && (
            <motion.li whileHover={{ x: 5 }}>
              <a 
                href={profileData.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-blue-500 hover:text-blue-600 transition-colors"
              >
                <Linkedin className="w-5 h-5 mr-3" />
                <span>LinkedIn Profile</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </a>
            </motion.li>
          )}
          {profileData?.website && (
            <motion.li whileHover={{ x: 5 }}>
              <a 
                href={profileData.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-blue-500 hover:text-blue-600 transition-colors"
              >
                <Globe className="w-5 h-5 mr-3" />
                <span>Personal Website</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </a>
            </motion.li>
          )}
          {!profileData?.github && !profileData?.linkedin && !profileData?.website && (
            <span className="text-gray-500 dark:text-gray-400 text-sm">No social links added yet</span>
          )}
        </ul>
      </div>
    </motion.div>
  );
};

export default OverviewTab;