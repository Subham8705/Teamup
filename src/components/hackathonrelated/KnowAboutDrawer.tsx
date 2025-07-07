import React from 'react';
import { X, BookOpen, Trophy, Users, Lightbulb, Code, Target } from 'lucide-react';

interface KnowAboutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const KnowAboutDrawer: React.FC<KnowAboutDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl z-50 transform transition-all duration-700 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Chart Paper Effect */}
        <div className={`absolute inset-0 opacity-10 ${isOpen ? 'animate-pulse' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 30px,
              rgba(139, 92, 246, 0.1) 30px,
              rgba(139, 92, 246, 0.1) 32px
            )`,
          }}></div>
        </div>

        {/* Header */}
        <div className="relative p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Know About Hackathons</h2>
                <p className="text-gray-600 dark:text-gray-300">Your complete guide to hackathons</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-8 overflow-y-auto h-full pb-24">
          <div className="space-y-8">
            {/* What is a Hackathon */}
            <section className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">What is a Hackathon?</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                A hackathon is a competitive event where developers, designers, and entrepreneurs come together to build innovative solutions within a limited timeframe, usually 24-48 hours. It's about collaboration, creativity, and turning ideas into reality.
              </p>
            </section>

            {/* Why Participate */}
            <section className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Why Participate?</h3>
              </div>
              <div className="grid gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🚀 Skill Development</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Learn new technologies, frameworks, and tools while building real projects.</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🤝 Networking</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Connect with like-minded developers, mentors, and potential employers.</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💰 Win Prizes</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Compete for cash prizes, internships, and recognition in the tech community.</p>
                </div>
              </div>
            </section>

            {/* How to Participate */}
            <section className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">How to Participate</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Find a Hackathon</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Browse platforms like Devfolio, Unstop, MLH, or HackerEarth.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Form a Team</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Find 2-4 teammates with complementary skills (developers, designers, etc.).</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Prepare</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Research the problem, plan your solution, and set up your development environment.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Build & Submit</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Code your solution, test it, and submit before the deadline.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Tips for Success */}
            <section className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tips for Success</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <p className="text-gray-600 dark:text-gray-300">Start with a simple, achievable idea</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <p className="text-gray-600 dark:text-gray-300">Focus on the problem, not the technology</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <p className="text-gray-600 dark:text-gray-300">Create a working prototype, not a perfect product</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <p className="text-gray-600 dark:text-gray-300">Practice your pitch before presenting</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <p className="text-gray-600 dark:text-gray-300">Don't forget to sleep and eat!</p>
                </div>
              </div>
            </section>

            {/* Popular Platforms */}
            <section className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Popular Platforms</h3>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">Devfolio</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">India's largest hackathon platform</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">Unstop</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Competitions and hackathons</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">MLH</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Major League Hacking</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">HackerEarth</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Global hackathon platform</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default KnowAboutDrawer;