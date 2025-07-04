import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Video, MoreHorizontal, Search, Users } from 'lucide-react';

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');

  const chats = [
    {
      id: 1,
      name: 'AI Healthcare Team',
      lastMessage: 'Great work on the ML model!',
      time: '2 min ago',
      unread: 2,
      avatar: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=50',
      members: 4
    },
    {
      id: 2,
      name: 'Sarah Chen',
      lastMessage: 'Can we schedule a meeting?',
      time: '1 hour ago',
      unread: 0,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50',
      members: 1
    },
    {
      id: 3,
      name: 'Blockchain Project',
      lastMessage: 'Smart contract is ready for testing',
      time: '3 hours ago',
      unread: 1,
      avatar: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=50',
      members: 6
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'Alex Johnson',
      content: 'Hey team! I\'ve finished the user authentication module. Ready for review.',
      time: '10:30 AM',
      isMe: false,
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=50'
    },
    {
      id: 2,
      sender: 'You',
      content: 'Awesome! I\'ll test it this afternoon and get back to you.',
      time: '10:32 AM',
      isMe: true,
      avatar: null
    },
    {
      id: 3,
      sender: 'Sarah Chen',
      content: 'Great work everyone! The AI model is showing 94% accuracy now.',
      time: '10:35 AM',
      isMe: false,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50'
    },
    {
      id: 4,
      sender: 'You',
      content: 'That\'s incredible! Should we schedule a demo for the stakeholders?',
      time: '10:37 AM',
      isMe: true,
      avatar: null
    },
    {
      id: 5,
      sender: 'Marcus Rodriguez',
      content: 'I can help prepare the presentation. When works for everyone?',
      time: '10:40 AM',
      isMe: false,
      avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=50'
    }
  ];

  const selectedChatInfo = chats.find(chat => chat.id === selectedChat);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add message logic here
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-[calc(100vh-8rem)] flex border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <motion.div
                  key={chat.id}
                  whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.5)' }}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors duration-300 ${
                    selectedChat === chat.id ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {chat.members > 1 && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Users className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{chat.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{chat.lastMessage}</p>
                    </div>
                    {chat.unread > 0 && (
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">{chat.unread}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedChatInfo?.avatar}
                  alt={selectedChatInfo?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedChatInfo?.name}</h3>
                  {selectedChatInfo?.members && selectedChatInfo.members > 1 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedChatInfo.members} members</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${msg.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!msg.isMe && (
                      <img
                        src={msg.avatar}
                        alt={msg.sender}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div className={`px-4 py-2 rounded-lg ${
                      msg.isMe 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      {!msg.isMe && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{msg.sender}</p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.isMe ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;