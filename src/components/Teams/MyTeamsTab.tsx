import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, MessageCircle, UserPlus, UserMinus, Trash2, Settings, Eye, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
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
}

interface MyTeamsTabProps {
  ownedTeams: Team[];
  memberTeams: Team[];
  onChatWithTeam: (teamId: string, teamName: string) => void;
  onManageTeam: (team: Team) => void;
  onLeaveTeam: (teamId: string) => void;
  onDeleteTeam: (teamId: string) => void;
  currentUserId: string | undefined;
}

const MyTeamsTab: React.FC<MyTeamsTabProps> = ({
  ownedTeams,
  memberTeams,
  onChatWithTeam,
  onManageTeam,
  onLeaveTeam,
  onDeleteTeam,
  currentUserId
}) => {
  const [teamMembers, setTeamMembers] = useState<{ [teamId: string]: TeamMember[] }>({});
  const [loadingMembers, setLoadingMembers] = useState<{ [teamId: string]: boolean }>({});
  const [showMembersModal, setShowMembersModal] = useState<string | null>(null);

  const getCategoryColor = (category: string) => {
    const colors = {
      'Startup': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'Hackathon': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'Open Source': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Research': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Learning': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'Competition': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'Side Project': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const fetchTeamMembers = async (team: Team) => {
    if (teamMembers[team.id]) return; // Already loaded

    setLoadingMembers(prev => ({ ...prev, [team.id]: true }));
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
      setTeamMembers(prev => ({ ...prev, [team.id]: members }));
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoadingMembers(prev => ({ ...prev, [team.id]: false }));
    }
  };

  const handleViewMembers = (team: Team) => {
    fetchTeamMembers(team);
    setShowMembersModal(team.id);
  };

  const handleChatWithMember = (memberId: string, memberName: string) => {
    // Navigate to direct chat with team member
    window.location.href = `/chat?user=${memberId}&name=${encodeURIComponent(memberName)}`;
    setShowMembersModal(null);
  };

  const TeamCard: React.FC<{ team: Team; isOwner: boolean }> = ({ team, isOwner }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            {isOwner && (
              <Crown className="w-5 h-5 text-yellow-500" title="You own this team" />
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(team.category)}`}>
              {team.category}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onChatWithTeam(team.id, team.name)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Team Chat"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewMembers(team)}
              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
              title="View Members"
            >
              <Eye className="w-4 h-4" />
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => onManageTeam(team)}
                  className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                  title="Manage Team"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteTeam(team.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Delete Team"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            {!isOwner && (
              <button
                onClick={() => onLeaveTeam(team.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Leave Team"
              >
                <UserMinus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          {team.name}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {team.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{team.currentMembers}/{team.maxMembers} members</span>
          </div>
          <span>{team.location}</span>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Created {new Date(team.createdAt).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Owned Teams */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Crown className="w-5 h-5 mr-2 text-yellow-500" />
          Teams You Own ({ownedTeams.length})
        </h3>
        
        {ownedTeams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedTeams.map(team => (
              <TeamCard key={team.id} team={team} isOwner={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Crown className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">You haven't created any teams yet</p>
          </div>
        )}
      </div>

      {/* Member Teams */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-500" />
          Teams You're In ({memberTeams.length})
        </h3>
        
        {memberTeams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberTeams.map(team => (
              <TeamCard key={team.id} team={team} isOwner={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">You're not a member of any teams yet</p>
          </div>
        )}
      </div>

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
                <button
                  onClick={() => setShowMembersModal(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Users className="w-5 h-5" />
                </button>
              </div>

              {loadingMembers[showMembersModal] ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : (
                <div className="space-y-3">
                  {teamMembers[showMembersModal]?.map((member) => {
                    const team = [...ownedTeams, ...memberTeams].find(t => t.id === showMembersModal);
                    const isOwner = member.id === team?.ownerId;
                    
                    return (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center flex-1">
                          {isOwner && <Crown className="w-4 h-4 text-yellow-500 mr-2" />}
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                            {member.role && (
                              <div className="text-xs text-purple-600 dark:text-purple-400">{member.role}</div>
                            )}
                          </div>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            isOwner 
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          }`}>
                            {isOwner ? 'Owner' : 'Member'}
                          </span>
                        </div>
                        {member.id !== currentUserId && (
                          <button
                            onClick={() => handleChatWithMember(member.id, member.name)}
                            className="ml-3 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Message"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyTeamsTab;