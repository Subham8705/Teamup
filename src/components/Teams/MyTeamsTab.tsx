import React from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, MessageCircle, UserPlus, UserMinus, Trash2, Settings } from 'lucide-react';

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
    </div>
  );
};

export default MyTeamsTab;