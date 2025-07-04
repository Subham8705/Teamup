import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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
  const { register, handleSubmit } = useForm({
    defaultValues: profileData
  });

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