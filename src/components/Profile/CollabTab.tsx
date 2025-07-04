import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Check, 
  X, 
  Eye, 
  Calendar, 
  Mail, 
  MapPin, 
  Code,
  Github,
  Linkedin,
  Globe,
  Heart,
  Loader2
} from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface CollabTabProps {
  profileData: any;
  loading: boolean;
}

const CollabTab: React.FC<CollabTabProps> = ({ profileData, loading }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCollaborationRequests();
      fetchCollaborators();
    }
  }, [user]);

  const fetchCollaborationRequests = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'collaborationRequests'),
        where('toUserId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchCollaborators = async () => {
    if (!user) return;

    try {
      // Fetch accepted collaborations where user is either sender or receiver
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

      const allCollabs = [
        ...sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'sent' })),
        ...receivedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'received' }))
      ];

      // Fetch full profiles for each collaborator
      const collaboratorsWithProfiles = await Promise.all(
        allCollabs.map(async (collab) => {
          const partnerId = collab.type === 'sent' ? collab.toUserId : collab.fromUserId;
          const partnerDoc = await getDoc(doc(db, 'users', partnerId));
          const partnerProfile = partnerDoc.data();
          
          return {
            ...collab,
            partnerProfile,
            partnerId,
            partnerName: collab.type === 'sent' ? collab.toUserName : collab.fromUserName
          };
        })
      );

      setCollaborators(collaboratorsWithProfiles);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const handleRequestResponse = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      await updateDoc(doc(db, 'collaborationRequests', requestId), {
        status,
        respondedAt: new Date().toISOString()
      });

      if (status === 'accepted') {
        toast.success('Collaboration request accepted!');
        fetchCollaborators(); // Refresh collaborators list
      } else {
        toast.success('Collaboration request declined');
      }
      
      fetchCollaborationRequests(); // Refresh requests
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('Failed to respond to request');
    }
  };

  const viewProfile = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setSelectedProfile({ id: userId, ...userDoc.data() });
        setShowProfileModal(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Pending Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Collaboration Requests
          </h3>
          {requests.length > 0 && (
            <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full text-sm font-medium">
              {requests.length} pending
            </span>
          )}
        </div>

        {loadingRequests ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserPlus className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {request.fromUserName}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        wants to collaborate
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                      {request.message}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => viewProfile(request.fromUserId)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRequestResponse(request.id, 'accepted')}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      title="Accept"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRequestResponse(request.id, 'declined')}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Decline"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <UserPlus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No pending collaboration requests</p>
          </div>
        )}
      </div>

      {/* My Collaborators */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          My Collaborators ({collaborators.length})
        </h3>

        {collaborators.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {collaborators.map((collab) => (
              <motion.div
                key={collab.id}
                whileHover={{ y: -2 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {collab.partnerName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {collab.partnerProfile?.role || 'Developer'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    collab.type === 'sent' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  }`}>
                    {collab.type === 'sent' ? 'You invited' : 'Invited you'}
                  </span>
                </div>

                {collab.partnerProfile?.skills && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {collab.partnerProfile.skills.split(',').slice(0, 3).map((skill: string, idx: number) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                      {collab.partnerProfile.skills.split(',').length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                          +{collab.partnerProfile.skills.split(',').length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    Since {new Date(collab.respondedAt || collab.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => viewProfile(collab.partnerId)}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Profile
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No collaborators yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Accept collaboration requests to see them here
            </p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedProfile.name}'s Profile
                </h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <UserPlus className="w-4 h-4 mr-2" />
                      {selectedProfile.role || 'Developer'}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Mail className="w-4 h-4 mr-2" />
                      {selectedProfile.email}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined {selectedProfile.createdAt?.toDate ? 
                        new Date(selectedProfile.createdAt.toDate()).toLocaleDateString() : 
                        'Recently'}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedProfile.skills && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.skills.split(',').map((skill: string, idx: number) => (
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

                {/* About */}
                {selectedProfile.about && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">About</h3>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {selectedProfile.about}
                    </p>
                  </div>
                )}

                {/* Projects */}
                {selectedProfile.projects && selectedProfile.projects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Projects</h3>
                    <div className="space-y-3">
                      {selectedProfile.projects.map((project: any, idx: number) => (
                        <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">{project.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{project.description}</p>
                          <div className="flex space-x-3 mt-2">
                            {project.github && (
                              <a 
                                href={project.github} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                              >
                                <Github className="w-3 h-3 mr-1" />
                                GitHub
                              </a>
                            )}
                            {project.link && (
                              <a 
                                href={project.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                              >
                                <Globe className="w-3 h-3 mr-1" />
                                Live Demo
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Connect</h3>
                  <div className="flex space-x-4">
                    {selectedProfile.github && (
                      <a 
                        href={selectedProfile.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <Github className="w-5 h-5 mr-2" />
                        GitHub
                      </a>
                    )}
                    {selectedProfile.linkedin && (
                      <a 
                        href={selectedProfile.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <Linkedin className="w-5 h-5 mr-2" />
                        LinkedIn
                      </a>
                    )}
                    {selectedProfile.website && (
                      <a 
                        href={selectedProfile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <Globe className="w-5 h-5 mr-2" />
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
    </motion.div>
  );
};

export default CollabTab;