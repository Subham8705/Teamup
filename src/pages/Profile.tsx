import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Github, 
  Linkedin, 
  Globe, 
  Edit3, 
  Trophy, 
  Star,
  Code,
  Users,
  Lightbulb,
  MessageCircle,
  UserPlus,
  Clock,
  DollarSign,
  Award,
  Heart
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Projects', value: '12', icon: Code },
    { label: 'Teams Joined', value: '8', icon: Users },
    { label: 'Ideas Posted', value: '5', icon: Lightbulb },
    { label: 'Hackathons Won', value: '3', icon: Trophy }
  ];

  const projects = [
    {
      id: 1,
      title: 'AI Task Manager',
      description: 'Smart task management with AI prioritization',
      tech: ['React', 'Python', 'TensorFlow'],
      status: 'Completed',
      collaborators: 4,
      image: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 2,
      title: 'Blockchain Voting',
      description: 'Secure voting system using blockchain',
      tech: ['Solidity', 'React', 'Web3.js'],
      status: 'In Progress',
      collaborators: 3,
      image: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 3,
      title: 'EcoTracker Mobile',
      description: 'Carbon footprint tracking mobile app',
      tech: ['Flutter', 'Firebase', 'Node.js'],
      status: 'Completed',
      collaborators: 2,
      image: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=300'
    }
  ];

  const achievements = [
    {
      title: 'First Hackathon Win',
      description: 'Won AI Innovation Challenge 2023',
      date: 'Dec 2023',
      icon: Trophy
    },
    {
      title: 'Team Player',
      description: 'Successfully collaborated on 10+ projects',
      date: 'Nov 2023',
      icon: Users
    },
    {
      title: 'Idea Generator',
      description: 'Posted 5 innovative project ideas',
      date: 'Oct 2023',
      icon: Lightbulb
    }
  ];

  const collaborationRequests = [
    {
      id: 1,
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50',
      project: 'AI Healthcare Platform',
      message: 'Hi! I saw your work on machine learning projects. Would you like to collaborate on an AI healthcare platform?',
      skills: ['Python', 'TensorFlow', 'React'],
      time: '2 hours ago'
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=50',
      project: 'Blockchain DeFi App',
      message: 'Your blockchain experience looks impressive! Want to build a DeFi application together?',
      skills: ['Solidity', 'Web3.js', 'React'],
      time: '1 day ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'In Progress': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'On Hold': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Please log in</h2>
          <p className="text-gray-600 dark:text-gray-300">You need to be logged in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{userProfile?.name || user?.email}</h1>
                <p className="text-purple-100 text-lg">{userProfile?.role || 'Developer'}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center text-purple-100">
                    <Mail className="w-4 h-4 mr-1" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center text-purple-100">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Joined {new Date(user?.metadata?.creationTime || '').toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center text-purple-100">
                    <Star className="w-4 h-4 mr-1 text-yellow-300 fill-current" />
                    <span>4.9 Rating</span>
                  </div>
                  <div className="flex items-center text-purple-100">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>2 hours response time</span>
                  </div>
                  <div className="flex items-center text-purple-100">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>$75/hr</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'projects', label: 'Projects', icon: Code },
              { id: 'collaboration', label: 'Collaboration', icon: UserPlus },
              { id: 'about', label: 'About Me', icon: Heart }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1">
              {/* Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <stat.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(userProfile?.skills || ['React', 'Node.js', 'Python', 'UI/UX']).map((skill: string) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connect</h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <Github className="w-5 h-5 mr-3" />
                    <span>GitHub Profile</span>
                  </a>
                  <a href="#" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <Linkedin className="w-5 h-5 mr-3" />
                    <span>LinkedIn Profile</span>
                  </a>
                  <a href="#" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <Globe className="w-5 h-5 mr-3" />
                    <span>Personal Website</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
              {/* Achievements */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Achievements</h3>
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4"
                    >
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <achievement.icon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{achievement.description}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{achievement.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{project.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{project.description}</p>
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{project.collaborators} collaborators</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Collaboration Tab */}
        {activeTab === 'collaboration' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Collaboration Requests</h3>
              <div className="space-y-4">
                {collaborationRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={request.avatar}
                        alt={request.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{request.name}</h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{request.time}</span>
                        </div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">{request.project}</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{request.message}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {request.skills.map(skill => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-3">
                          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                            Accept
                          </button>
                          <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Decline
                          </button>
                          <button className="border border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white transition-all duration-300">
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* About Me Tab */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">About Me</h3>
                <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </button>
              </div>
              
              <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300">
                <p className="mb-6">
                  I'm a passionate full-stack developer with over 5 years of experience building scalable web applications 
                  and mobile solutions. I love working on challenging projects that push the boundaries of technology and 
                  create meaningful impact for users.
                </p>
                
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">What I'm Looking For</h4>
                <p className="mb-6">
                  I'm always excited to collaborate on innovative projects, especially those involving AI/ML, blockchain, 
                  or sustainable technology. I'm particularly interested in:
                </p>
                
                <ul className="list-disc list-inside mb-6 space-y-2">
                  <li>AI-powered applications that solve real-world problems</li>
                  <li>Blockchain and DeFi projects</li>
                  <li>Environmental and sustainability-focused solutions</li>
                  <li>Open-source contributions</li>
                  <li>Mentoring junior developers</li>
                </ul>
                
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">My Collaboration Style</h4>
                <p className="mb-6">
                  I believe in transparent communication, agile development practices, and continuous learning. 
                  I'm comfortable working in remote teams and have experience leading cross-functional projects. 
                  I value code quality, user experience, and building products that users love.
                </p>
                
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Availability</h4>
                <p className="mb-4">
                  Currently available for new collaborations! I typically respond to messages within 2 hours 
                  and can commit 20-30 hours per week to exciting projects.
                </p>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mt-6">
                  <h5 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Ready to Collaborate?</h5>
                  <p className="text-purple-700 dark:text-purple-300 text-sm">
                    Feel free to reach out if you have an interesting project or idea you'd like to discuss. 
                    I'm always open to new opportunities and love meeting fellow creators!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;