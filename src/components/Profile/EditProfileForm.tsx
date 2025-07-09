import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Lock, Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface EditProfileFormProps {
  profileData: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  profileData,
  onSubmit,
  onCancel,
  loading
}) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      ...profileData,
      profileVisibility: profileData?.profileVisibility || 'public'
    }
  });

  const profileVisibility = watch('profileVisibility');

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)} 
      className="mt-6 space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-colors duration-300"
    >
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Profile</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
          <input 
            {...register('name')} 
            placeholder="Your name" 
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role</label>
          <input 
            {...register('role')} 
            placeholder="Your role" 
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
            disabled={loading}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Skills (comma separated)</label>
        <input 
          {...register('skills')} 
          placeholder="JavaScript, React, Node.js" 
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
          disabled={loading}
        />
      </div>

      {/* Profile Visibility Settings */}
      <div>
        <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Profile & Messaging Settings</label>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <input
              {...register('profileVisibility')}
              type="radio"
              value="public"
              id="public"
              className="mt-1 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
              disabled={loading}
            />
            <div className="flex-1">
              <label htmlFor="public" className="flex items-center text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                <Globe className="w-4 h-4 mr-2 text-green-600" />
                Public Profile
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Anyone can find you in search and send you messages directly. Best for networking and finding new collaborations.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <input
              {...register('profileVisibility')}
              type="radio"
              value="private"
              id="private"
              className="mt-1 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
              disabled={loading}
            />
            <div className="flex-1">
              <label htmlFor="private" className="flex items-center text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                <Lock className="w-4 h-4 mr-2 text-orange-600" />
                Private Profile
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Only your collaborators and team members can message you directly. Others must send collaboration requests first. More privacy and control.
              </p>
            </div>
          </div>
        </div>
        
        {/* Visual indicator */}
        <div className={`mt-3 p-3 rounded-lg border-l-4 ${
          profileVisibility === 'public' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-400' 
            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-400'
        }`}>
          <div className="flex items-center">
            {profileVisibility === 'public' ? (
              <Globe className="w-4 h-4 mr-2 text-green-600" />
            ) : (
              <Lock className="w-4 h-4 mr-2 text-orange-600" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {profileVisibility === 'public' ? 'Public Profile Active' : 'Private Profile Active'}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {profileVisibility === 'public' 
              ? 'Your profile is discoverable and anyone can message you.'
              : 'Your profile is protected and only collaborators and team members can message you directly.'
            }
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">GitHub URL</label>
          <input 
            {...register('github')} 
            placeholder="https://github.com/username" 
            type="url"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">LinkedIn URL</label>
          <input 
            {...register('linkedin')} 
            placeholder="https://linkedin.com/in/username" 
            type="url"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Website</label>
          <input 
            {...register('website')} 
            placeholder="https://yourwebsite.com" 
            type="url"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
            disabled={loading}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">About Me</label>
        <textarea 
          {...register('about')} 
          placeholder="Tell us about yourself..." 
          rows={5}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
          disabled={loading}
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-300"
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-md disabled:opacity-50 flex items-center transition-colors duration-300"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </motion.form>
  );
};

export default EditProfileForm;