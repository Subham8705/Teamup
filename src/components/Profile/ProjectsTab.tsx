import React from 'react';
import { motion } from 'framer-motion';
import { Code, Github, Globe, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface ProjectsTabProps {
  profileData: any;
  showProjectForm: boolean;
  setShowProjectForm: (show: boolean) => void;
  editProjectId: string | null;
  setEditProjectId: (id: string | null) => void;
  handleAddOrUpdateProject: (e: any) => Promise<void>;
  handleDeleteProject: (id: string) => Promise<void>;
  handleEditProject: (project: any) => void;
  loading: boolean;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({
  profileData,
  showProjectForm,
  setShowProjectForm,
  editProjectId,
  setEditProjectId,
  handleAddOrUpdateProject,
  handleDeleteProject,
  handleEditProject,
  loading
}) => {
  const { register } = useForm();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">My Projects</h3>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { 
            setShowProjectForm(!showProjectForm); 
            setEditProjectId(null); 
          }} 
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded-full flex items-center shadow-md disabled:opacity-50 transition-all duration-300"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            showProjectForm ? 'Close' : 'Add Project +'
          )}
        </motion.button>
      </div>
      
      {showProjectForm && (
        <motion.form 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          onSubmit={handleAddOrUpdateProject} 
          className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8 transition-colors duration-300"
        >
          <h4 className="font-medium text-lg text-gray-900 dark:text-white">
            {editProjectId ? 'Edit Project' : 'Add New Project'}
          </h4>
          <input 
            {...register('title')} 
            placeholder="Project Title" 
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
            required 
            disabled={loading}
          />
          <textarea 
            {...register('description')} 
            placeholder="Project Description" 
            rows={4}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
            required 
            disabled={loading}
          />
          <input 
            {...register('github')} 
            placeholder="GitHub Link (https://...)" 
            type="url"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
            disabled={loading}
          />
          <input 
            {...register('link')} 
            placeholder="Live Demo Link (https://...)" 
            type="url"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300" 
            disabled={loading}
          />
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setShowProjectForm(false)}
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
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                editProjectId ? 'Update Project' : 'Add Project'
              )}
            </button>
          </div>
        </motion.form>
      )}

      <div className="space-y-4">
        {profileData?.projects?.length ? (
          profileData.projects.map((project: any) => (
            <motion.div 
              key={project.id}
              whileHover={{ y: -2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{project.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-3">
                    {project.github && (
                      <a 
                        href={project.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Github className="w-4 h-4 mr-1" /> GitHub
                      </a>
                    )}
                    {project.link && (
                      <a 
                        href={project.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Globe className="w-4 h-4 mr-1" /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 md:mt-0">
                  <button 
                    onClick={() => handleEditProject(project)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    aria-label="Edit project"
                    disabled={loading}
                  >
                    <Pencil className="w-4 h-4 text-yellow-500" />
                  </button>
                  <button 
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    aria-label="Delete project"
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center transition-colors duration-300">
            <Code className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No Projects Yet</h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Add your first project to showcase your work
            </p>
            <button 
              onClick={() => setShowProjectForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-md disabled:opacity-50 transition-colors duration-300"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mx-auto animate-spin" />
              ) : (
                'Add Project'
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectsTab;