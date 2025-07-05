import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Check, X, Eye, Calendar, Mail } from 'lucide-react';

interface Application {
  id: string;
  teamId: string;
  teamName: string;
  teamOwnerId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  message: string;
  status: string;
  createdAt: string;
}

interface ApplicationsTabProps {
  applications: Application[];
  onAcceptApplication: (applicationId: string, applicantId: string, teamId: string) => void;
  onRejectApplication: (applicationId: string) => void;
  onViewProfile: (userId: string) => void;
  loading: { [key: string]: boolean };
}

const ApplicationsTab: React.FC<ApplicationsTabProps> = ({
  applications,
  onAcceptApplication,
  onRejectApplication,
  onViewProfile,
  loading
}) => {
  return (
    <div className="space-y-6">
      {applications.length > 0 ? (
        applications.map((application, index) => (
          <motion.div
            key={application.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {application.applicantName}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    wants to join
                  </span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {application.teamName}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <Mail className="w-4 h-4 mr-1" />
                  <span>{application.applicantEmail}</span>
                  <Calendar className="w-4 h-4 ml-4 mr-1" />
                  <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Application Message:</p>
                  <p className="text-gray-600 dark:text-gray-300">{application.message}</p>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onViewProfile(application.applicantId)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="View Profile"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onAcceptApplication(application.id, application.applicantId, application.teamId)}
                  disabled={loading[application.id]}
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                  title="Accept"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRejectApplication(application.id)}
                  disabled={loading[application.id]}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                  title="Reject"
                >
                  <X className="w-4 h-4" />
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
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No applications yet</h3>
          <p className="text-gray-600 dark:text-gray-300">
            When people apply to join your teams, you'll see their applications here
          </p>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTab;