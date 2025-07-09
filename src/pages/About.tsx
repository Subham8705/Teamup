import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Heart, 
  Rocket, 
  Github, 
  Linkedin, 
  Mail,
  Code,
  Lightbulb,
  Globe,
  MessageCircle
} from 'lucide-react';

const About: React.FC = () => {
  const founders = [
    {
      name: 'Nikhil Pabbisetti',
      role: 'Co-Founder',
      bio: 'Full-stack developer with 1+ years experience. Passionate about building platforms that connect creative minds.',
      image: 'https://res.cloudinary.com/dpa0sb1tm/image/upload/c_crop,w_300,h_150,g_auto/v1751541159/gandu_kcdzmz.jpg',
      github: 'https://github.com/Nikhil-p570',
      linkedin: 'https://www.linkedin.com/in/nikhil-pabbisetti/',
      email: 'nikhil.pabbisetti2006@gmail.com'
    },
    {
      name: 'Subham Kumar Shee',
      role: 'Co-Founder',
      bio: 'AI/ML engineer and former Google software engineer. Believes in the power of collaboration to solve complex problems.',
      image: 'https://res.cloudinary.com/dpa0sb1tm/image/upload/c_crop,w_490,h_180,g_auto/v1743426464/A-20250216-WA0006_-_Subham_kumar_fhw4hr.jpg',
      github: 'https://github.com/Subham8705/Teamup',
      linkedin: 'https://www.linkedin.com/in/subham-kumar-shee-221886328/',
      email: 'subhamkumarshee@gmail.com '
    }
  ];

  const values = [
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in the power of community and collaboration to drive innovation forward.'
    },
    {
      icon: Target,
      title: 'Purpose-Driven',
      description: 'Every feature we build serves to connect creators and bring amazing ideas to life.'
    },
    {
      icon: Heart,
      title: 'Passion for Impact',
      description: 'We are passionate about creating positive change through technology and teamwork.'
    },
    {
      icon: Rocket,
      title: 'Innovation Focus',
      description: 'We constantly evolve our platform to meet the changing needs of modern developers.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '2,500+', label: 'Projects Created' },
    { number: '500+', label: 'Hackathons Won' },
    { number: '50+', label: 'Countries Reached' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold mb-6">About TeamUp</h1>
              <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                We're on a mission to connect passionate creators, innovators, and dreamers 
                to build the future together. Every great idea deserves a great team.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              To democratize innovation by making it easy for anyone with a great idea 
              to find the right team and turn their vision into reality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Numbers that show the amazing community we've built together
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Founders Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Meet the Founders</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The passionate team behind TeamUp's mission
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-40">
            {founders.map((founder, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-600"
              >
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{founder.name}</h3>
                  <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">{founder.role}</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{founder.bio}</p>
                  
                  <div className="flex space-x-4">
                    <a
                      href={founder.github}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                    <a
                      href={founder.linkedin}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href={`mailto:${founder.email}`}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Story</h2>
          </div>

          <div className="prose prose-lg mx-auto text-gray-600 dark:text-gray-300">
            <p className="text-xl leading-relaxed mb-6">
              TeamUp was born from a simple frustration: having great ideas but struggling to find the right people to build them with. 
              As students and early-career developers, we experienced this challenge firsthand during hackathons and personal projects.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              We realized that talent is everywhere, but opportunities to collaborate are scattered. 
              So we built TeamUp to bridge that gap - creating a space where anyone can share their ideas, 
              find like-minded collaborators, and build something amazing together.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              What started as a side project has grown into a thriving community of over 10,000 creators worldwide. 
              We've seen incredible projects come to life, from AI applications solving real-world problems to 
              innovative mobile apps that have reached thousands of users.
            </p>

            <p className="text-lg leading-relaxed">
              Today, TeamUp continues to evolve based on feedback from our amazing community. 
              We're constantly adding new features and improving the platform to make collaboration even easier and more effective.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-xl text-purple-100 mb-8">
            Have questions, feedback, or just want to say hello? We'd love to hear from you!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:nikhil.pabbisetti2006@gmail.com"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <Mail className="w-5 h-5 mr-2" />
              nikhil.pabbisetti2006@gmail.com
            </a>
            {/* <a
              href="#"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Join our Discord
            </a> */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;