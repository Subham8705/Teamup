import React from 'react';
import { motion } from 'framer-motion';
import { X, Users, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  canCreateTeam: boolean;
  nextCreationDate: Date | null;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  canCreateTeam,
  nextCreationDate
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const categories = [
    'Startup', 'Hackathon', 'Open Source', 'Research', 
    'Learning', 'Competition', 'Side Project'
  ];

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
    reset();
  };

  if (!isOpen) return null;

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
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Team</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {!canCreateTeam && nextCreationDate && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                You can create your next team on {nextCreationDate.toLocaleDateString()} at {nextCreationDate.toLocaleTimeString()}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Name
              </label>
              <input
                {...register('name', { required: 'Team name is required' })}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your team name"
                disabled={!canCreateTeam}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe your team's goals and what you're looking for..."
                disabled={!canCreateTeam}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!canCreateTeam}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  {...register('location', { required: 'Location is required' })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Remote, New York, Global"
                  disabled={!canCreateTeam}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Members
              </label>
              <input
                {...register('maxMembers', { 
                  required: 'Maximum members is required',
                  min: { value: 2, message: 'Minimum 2 members required' },
                  max: { value: 20, message: 'Maximum 20 members allowed' }
                })}
                type="number"
                min="2"
                max="20"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 5"
                disabled={!canCreateTeam}
              />
              {errors.maxMembers && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maxMembers.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Required Skills (comma-separated)
              </label>
              <input
                {...register('requiredSkills')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., React, Node.js, UI/UX Design"
                disabled={!canCreateTeam}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !canCreateTeam}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Team'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateTeamModal;