import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, MessageCircle, Heart, Trash2 } from 'lucide-react';
import { doc, updateDoc, increment, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import CommentsModal from './CommentsModal';

interface IdeaCardProps {
  idea: any;
  onUpdate?: () => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(idea.likes || 0);
  const [commentsCount, setCommentsCount] = useState(idea.comments || 0);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if current user has liked this idea
    if (user && idea.likedBy && Array.isArray(idea.likedBy)) {
      setIsLiked(idea.likedBy.includes(user.uid));
    }
  }, [user, idea.likedBy]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Idea': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'In Progress': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'Completed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like ideas');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    try {
      const ideaRef = doc(db, 'ideas', idea.id);
      
      if (isLiked) {
        // Unlike: remove user from likedBy array and decrement likes
        await updateDoc(ideaRef, {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid)
        });
        
        setLikesCount(prev => prev - 1);
        setIsLiked(false);
        toast.success('Like removed!');
      } else {
        // Like: add user to likedBy array and increment likes
        await updateDoc(ideaRef, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid)
        });
        
        setLikesCount(prev => prev + 1);
        setIsLiked(true);
        toast.success('Idea liked!');
      }
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!user || user.uid !== idea.authorId) {
      toast.error('You can only delete your own ideas');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'ideas', idea.id));
      toast.success('Idea deleted successfully!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error('Failed to delete idea');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCommentsUpdate = (newCount: number) => {
    setCommentsCount(newCount);
    if (onUpdate) onUpdate();
  };

  // Check if current user is the author
  const isAuthor = user && user.uid === idea.authorId;

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(idea.stage)}`}>
              {idea.stage}
            </span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className={`transition-all duration-200 transform hover:scale-110 ${
                  isLiked
                    ? 'text-red-500' 
                    : 'text-gray-400 hover:text-red-500'
                } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart 
                  className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} 
                />
              </button>
              {isAuthor && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="text-gray-400 hover:text-red-500 transition-colors transform hover:scale-110"
                  title="Delete your idea"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
            {idea.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {idea.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {idea.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
            {idea.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium">
                +{idea.tags.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{idea.authorName}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
              </div>
              <button 
                onClick={() => setShowComments(true)}
                className="flex items-center hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
              </button>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-sm font-medium">
              Join Team
            </button>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Idea</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{idea.title}"? This action cannot be undone and will also delete all comments associated with this idea.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showComments && (
        <CommentsModal 
          idea={idea}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          onCommentsUpdate={handleCommentsUpdate}
        />
      )}
    </>
  );
};

export default IdeaCard;