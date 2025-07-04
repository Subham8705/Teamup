import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  MessageCircle, 
  Users, 
  Code, 
  Trophy,
  Calendar,
  Mail,
  Github,
  Linkedin,
  Globe,
  UserPlus
} from 'lucide-react';

const Discover: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const skills = ['React', 'Node.js', 'Python', 'UI/UX', 'Mobile', 'AI/ML', 'Blockchain', 'Data Science', 'DevOps', 'Java'];
  const roles = ['All', 'Student', 'Developer', 'Designer', 'Product Manager', 'Data Scientist', 'DevOps Engineer'];
  const locations = ['All', 'Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Toronto', 'Mumbai'];

  const developers = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Full Stack Developer',
      location: 'San Francisco, CA',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.9,
      projectsCompleted: 15,
      skills: ['React', 'Node.js', 'Python', 'AI/ML'],
      bio: 'Passionate full-stack developer with 5+ years of experience building scalable web applications. Love working on AI/ML projects and mentoring junior developers.',
      availability: 'Available',
      hourlyRate: '$75/hr',
      responseTime: '2 hours',
      github: 'https://github.com/sarahchen',
      linkedin: 'https://linkedin.com/in/sarahchen',
      portfolio: 'https://sarahchen.dev',
      joinedDate: '2022-01-15',
      badges: ['Top Collaborator', 'Hackathon Winner', 'Mentor']
    },
    {
      id: 2,
      name: 'Alex Rodriguez',
      role: 'UI/UX Designer',
      location: 'Remote',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.8,
      projectsCompleted: 12,
      skills: ['UI/UX', 'Figma', 'React', 'Design Systems'],
      bio: 'Creative designer focused on user-centered design. Experienced in creating beautiful, functional interfaces for web and mobile applications.',
      availability: 'Busy',
      hourlyRate: '$60/hr',
      responseTime: '4 hours',
      github: 'https://github.com/alexrodriguez',
      linkedin: 'https://linkedin.com/in/alexrodriguez',
      portfolio: 'https://alexdesigns.com',
      joinedDate: '2021-08-20',
      badges: ['Design Expert', 'Team Player']
    },
    {
      id: 3,
      name: 'Marcus Johnson',
      role: 'Blockchain Developer',
      location: 'New York, NY',
      avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.7,
      projectsCompleted: 8,
      skills: ['Blockchain', 'Solidity', 'Web3.js', 'React'],
      bio: 'Blockchain enthusiast building the future of decentralized applications. Specialized in smart contracts and DeFi protocols.',
      availability: 'Available',
      hourlyRate: '$90/hr',
      responseTime: '1 hour',
      github: 'https://github.com/marcusjohnson',
      linkedin: 'https://linkedin.com/in/marcusjohnson',
      portfolio: 'https://marcusblockchain.dev',
      joinedDate: '2022-03-10',
      badges: ['Blockchain Expert', 'Innovation Leader']
    },
    {
      id: 4,
      name: 'Priya Patel',
      role: 'Mobile Developer',
      location: 'London, UK',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.9,
      projectsCompleted: 20,
      skills: ['Flutter', 'React Native', 'iOS', 'Android'],
      bio: 'Mobile app developer with expertise in cross-platform development. Love creating smooth, performant mobile experiences.',
      availability: 'Available',
      hourlyRate: '$70/hr',
      responseTime: '3 hours',
      github: 'https://github.com/priyapatel',
      linkedin: 'https://linkedin.com/in/priyapatel',
      portfolio: 'https://priyamobile.dev',
      joinedDate: '2021-11-05',
      badges: ['Mobile Expert', 'Top Rated', 'Fast Delivery']
    },
    {
      id: 5,
      name: 'David Kim',
      role: 'Data Scientist',
      location: 'Remote',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.8,
      projectsCompleted: 10,
      skills: ['Python', 'AI/ML', 'Data Science', 'TensorFlow'],
      bio: 'Data scientist passionate about extracting insights from complex datasets. Experienced in machine learning and predictive analytics.',
      availability: 'Available',
      hourlyRate: '$80/hr',
      responseTime: '2 hours',
      github: 'https://github.com/davidkim',
      linkedin: 'https://linkedin.com/in/davidkim',
      portfolio: 'https://daviddata.science',
      joinedDate: '2022-06-12',
      badges: ['AI Expert', 'Research Leader']
    },
    {
      id: 6,
      name: 'Emma Thompson',
      role: 'Product Manager',
      location: 'Toronto, CA',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.9,
      projectsCompleted: 18,
      skills: ['Product Management', 'Strategy', 'Analytics', 'Leadership'],
      bio: 'Strategic product manager with a track record of launching successful digital products. Expert in user research and product strategy.',
      availability: 'Busy',
      hourlyRate: '$85/hr',
      responseTime: '6 hours',
      github: '',
      linkedin: 'https://linkedin.com/in/emmathompson',
      portfolio: 'https://emmathompson.pm',
      joinedDate: '2021-09-18',
      badges: ['Product Expert', 'Strategy Leader', 'Team Builder']
    }
  ];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Busy': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'Unavailable': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const filteredDevelopers = developers.filter(dev => {
    const nameMatch = searchTerm === '' || dev.name.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = selectedRole === '' || selectedRole === 'All' || dev.role.includes(selectedRole);
    const locationMatch = selectedLocation === '' || selectedLocation === 'All' || dev.location.includes(selectedLocation);
    const skillsMatch = selectedSkills.length === 0 || selectedSkills.some(skill => dev.skills.includes(skill));
    
    return nameMatch && roleMatch && locationMatch && skillsMatch;
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discover Talent</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Find amazing developers, designers, and creators to collaborate with</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors duration-300">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {roles.map(role => (
                <option key={role} value={role === 'All' ? '' : role}>
                  {role}
                </option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {locations.map(location => (
                <option key={location} value={location === 'All' ? '' : location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by skills:</p>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Developers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevelopers.map((developer, index) => (
            <motion.div
              key={developer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={developer.avatar}
                      alt={developer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{developer.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{developer.role}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(developer.availability)}`}>
                    {developer.availability}
                  </span>
                </div>

                {/* Bio */}
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {developer.bio}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{developer.rating}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                      <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                      Rating
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{developer.projectsCompleted}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                      <Code className="w-3 h-3 mr-1" />
                      Projects
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{developer.responseTime}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Response
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {developer.skills.slice(0, 4).map(skill => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {developer.skills.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                        +{developer.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {developer.badges.slice(0, 2).map(badge => (
                      <span
                        key={badge}
                        className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium flex items-center"
                      >
                        <Trophy className="w-3 h-3 mr-1" />
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Location & Rate */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{developer.location}</span>
                  </div>
                  <span className="font-medium text-purple-600 dark:text-purple-400">{developer.hourlyRate}</span>
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    {developer.github && (
                      <a href={developer.github} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    <a href={developer.linkedin} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href={developer.portfolio} className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                      <Globe className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Joined {new Date(developer.joinedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Collaborate
                  </button>
                  <button className="flex-1 border border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 py-2 px-4 rounded-lg font-medium hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white transition-all duration-300 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDevelopers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No developers found</h3>
            <p className="text-gray-600 dark:text-gray-300">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;