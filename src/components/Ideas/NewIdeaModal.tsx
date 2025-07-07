import React from 'react';
import { motion } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface NewIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface IdeaForm {
  title: string;
  description: string;
  tags: string;
  stage: string;
}

const NewIdeaModal: React.FC<NewIdeaModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, userProfile } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<IdeaForm>();

  const allTags = ['AI', 'Web Development', 'Mobile App', 'Blockchain', 'IoT', 'Game Dev', 'Data Science', 'UI/UX', 'Fintech', 'EdTech'];
  const stages = ['Idea', 'In Progress', 'Completed'];

  const onSubmit = async (data: IdeaForm) => {
    try {
      await addDoc(collection(db, 'ideas'), {
        title: data.title,
        description: data.description,
        tags: data.tags.split(',').map(tag => tag.trim()),
        stage: data.stage,
        authorId: user?.uid,
        authorName: userProfile?.name || user?.email,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        likedBy: []
      });

      toast.success('Idea shared successfully!');
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error creating idea:', error);
      toast.error('Failed to share idea');
    }
  };

  const handleTagClick = (tag: string) => {
    // Add tag to the input field
    const currentTags = document.getElementById('tags') as HTMLInputElement;
    const currentValue = currentTags.value;
    const tagsArray = currentValue.split(',').map(t => t.trim()).filter(t => t);
    
    if (!tagsArray.includes(tag)) {
      const newValue = tagsArray.length > 0 ? `${currentValue}, ${tag}` : tag;
      currentTags.value = newValue;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share Your Idea</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Idea Title
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your idea title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
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
                placeholder="Describe your idea, what problem it solves, and what skills you're looking for..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                {...register('tags', { required: 'Tags are required' })}
                id="tags"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., AI, Web Development, Mobile App (comma-separated)"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {errors.tags && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tags.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stage
              </label>
              <select
                {...register('stage', { required: 'Stage is required' })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select stage</option>
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
              {errors.stage && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.stage.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sharing...' : 'Share Idea'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default NewIdeaModal;