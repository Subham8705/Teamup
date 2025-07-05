import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, UserMinus, Crown, Search, Loader2 } from 'lucide-react';

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

  const handleInvite = () => {
    if (inviteUsername.trim() && inviteMessage.trim()) {
      onInviteUser(inviteUsername.trim(), inviteMessage.trim());
      setInviteUsername('');
      setInviteMessage('');
    }
  };

  if (!isOpen || !team) return null;

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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="Enter username to invite"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Members ({team.currentMembers})
            </h3>
            <div className="space-y-2">
              {/* Owner */}
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center">
                  <Crown className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="font-medium text-gray-900 dark:text-white">{team.ownerName}</span>
                  <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium">
                    Owner
                  </span>
                </div>
              </div>

              {/* Other Members */}
              {team.members.filter(memberId => memberId !== team.ownerId).map((memberId, index) => (
                <div key={memberId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">Member {index + 1}</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                      Member
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveMember(memberId)}
                    disabled={loading}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                    title="Remove Member"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {team.currentMembers === 1 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No other members yet. Invite some people to join your team!
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamManagementModal;