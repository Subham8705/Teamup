import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, UserMinus, Crown, Search, Loader2, MessageCircle, Users } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Team {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  maxMembers: number;
  currentMembers: number;
  members: string[];
  ownerId: string;
  ownerName: string;
  requiredSkills: string[];
  status: string;
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  profileVisibility?: string;
}

interface UserSuggestion {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onInviteUser: (username: string, message: string) => void;
  onRemoveMember: (memberId: string) => void;
  loading: boolean;
}

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  isOpen,
  onClose,
  team,
  onInviteUser,
  onRemoveMember,
  loading
}) => {
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (team && isOpen) {
      fetchTeamMembers();
    }
  }, [team, isOpen]);

  useEffect(() => {
    if (inviteUsername.trim().length > 0) {
      searchUsers(inviteUsername.trim());
    } else {
      setUserSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inviteUsername]);

  const fetchTeamMembers = async () => {
    if (!team) return;

    setLoadingMembers(true);
    try {
      const memberPromises = team.members.map(async (memberId) => {
        const userDoc = await getDoc(doc(db, 'users', memberId));
        if (userDoc.exists()) {
          return {
            id: memberId,
            ...userDoc.data()
          } as TeamMember;
        }
        return null;
      });

      const members = (await Promise.all(memberPromises)).filter(Boolean) as TeamMember[];
      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const searchUsers = async (searchTerm: string) => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff')
      );
      
      const snapshot = await getDocs(usersQuery);
      const users = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as UserSuggestion))
        .filter(user => 
          !team?.members.includes(user.id) && // Not already in team
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5); // Limit to 5 suggestions

      setUserSuggestions(users);
      setShowSuggestions(users.length > 0);
    } catch (error) {
      console.error('Error searching users:', error);
      setUserSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInvite = () => {
    if (inviteUsername.trim() && inviteMessage.trim()) {
      onInviteUser(inviteUsername.trim(), inviteMessage.trim());
      setInviteUsername('');
      setInviteMessage('');
      setShowSuggestions(false);
    }
  };

  const selectUser = (user: UserSuggestion) => {
    setInviteUsername(user.name);
    setShowSuggestions(false);
  };

  const handleChatWithMember = (memberId: string, memberName: string) => {
    // Navigate to direct chat with team member
    window.location.href = `/chat?user=${memberId}&name=${encodeURIComponent(memberName)}`;
  };

  const handleViewAllMembers = () => {
    // You can implement a detailed members view here
    console.log('View all members:', teamMembers);
  };

  if (!isOpen || !team) return null;

  const owner = teamMembers.find(member => member.id === team.ownerId);
  const otherMembers = teamMembers.filter(member => member.id !== team.ownerId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Crown className="w-6 h-6 text-yellow-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manage {team.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Team Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Team Information</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{team.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{team.currentMembers}/{team.maxMembers} members</span>
              <span>{team.category}</span>
              <span>{team.location}</span>
            </div>
          </div>

          {/* Invite New Member */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Invite New Member
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    placeholder="Start typing username..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                
                {/* User Suggestions */}
                {showSuggestions && userSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {userSuggestions.map(user => (
                      <button
                        key={user.id}
                        onClick={() => selectUser(user)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        {user.role && (
                          <div className="text-xs text-purple-600 dark:text-purple-400">{user.role}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invitation Message
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Write a personal invitation message..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleInvite}
                disabled={loading || !inviteUsername.trim() || !inviteMessage.trim()}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Current Members */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Team Members ({team.currentMembers})
              </h3>
              <button
                onClick={handleViewAllMembers}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center"
              >
                <Users className="w-4 h-4 mr-1" />
                View All
              </button>
            </div>

            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            ) : (
              <div className="space-y-2">
                {/* Owner */}
                {owner && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center flex-1">
                      <Crown className="w-4 h-4 text-yellow-500 mr-2" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{owner.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{owner.email}</div>
                        {owner.role && (
                          <div className="text-xs text-purple-600 dark:text-purple-400">{owner.role}</div>
                        )}
                      </div>
                      <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium">
                        Owner
                      </span>
                    </div>
                  </div>
                )}

                {/* Other Members */}
                {otherMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center flex-1">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                        {member.role && (
                          <div className="text-xs text-purple-600 dark:text-purple-400">{member.role}</div>
                        )}
                      </div>
                      <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                        Member
                      </span>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleChatWithMember(member.id, member.name)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Message Member"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveMember(member.id)}
                        disabled={loading}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove Member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {team.currentMembers === 1 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No other members yet. Invite some people to join your team!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamManagementModal;