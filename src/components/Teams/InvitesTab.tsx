import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Check, X, Calendar, Users } from 'lucide-react';

interface Invitation {
  id: string;
  teamId: string;
  teamName: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  message: string;
  status: string;
  createdAt: string;
}

interface InvitesTabProps {
  invitations: Invitation[];
  onAcceptInvitation: (invitationId: string, teamId: string) => void;
  onRejectInvitation: (invitationId: string) => void;
  loading: { [key: string]: boolean };
}

const InvitesTab: React.FC<InvitesTabProps> = ({
  invitations,
  onAcceptInvitation,
  onRejectInvitation,
  loading
}) => {
  return (
    <div className="space-y-6">
      {invitations.length > 0 ? (
        invitations.map((invitation, index) => (
          <motion.div
            key={invitation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invitation.fromUserName}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    invited you to join
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {invitation.teamName}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{new Date(invitation.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invitation Message:</p>
                  <p className="text-gray-600 dark:text-gray-300">{invitation.message}</p>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onAcceptInvitation(invitation.id, invitation.teamId)}
                  disabled={loading[invitation.id]}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept
                </button>
                <button
                  onClick={() => onRejectInvitation(invitation.id)}
                  disabled={loading[invitation.id]}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </button>
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No invitations</h3>
          <p className="text-gray-600 dark:text-gray-300">
            When team owners invite you to join their teams, you'll see the invitations here
          </p>
        </div>
      )}
    </div>
  );
};

export default InvitesTab;