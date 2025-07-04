import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface AboutTabProps {
  profileData: any;
}

const AboutTab: React.FC<AboutTabProps> = ({ profileData }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300"
    >
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">About Me</h3>
      {profileData?.about ? (
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
          {profileData.about}
        </p>
      ) : (
        <div className="text-center py-8">
          <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No description added yet. Edit your profile to add an about section.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default AboutTab;