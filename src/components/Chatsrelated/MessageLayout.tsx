import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Trash2, 
  MoreVertical, 
  ArrowDown,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: any;
}

interface MessageLayoutProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onDeleteMessage: (messageId: string) => void;
  loading: boolean;
  chatTitle: string;
  onClearChat: () => Promise<void> | void;
}

const MessageLayout: React.FC<MessageLayoutProps> = ({
  messages,
  onSendMessage,
  onDeleteMessage,
  loading,
  chatTitle,
  onClearChat
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [clearingChat, setClearingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollDown(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDeleteClick = (messageId: string) => {
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      onDeleteMessage(messageToDelete);
      setMessageToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleClearChat = () => {
    setShowClearModal(true);
    setShowDropdown(false);
  };

  const confirmClearChat = async () => {
    setClearingChat(true);
    try {
      await onClearChat();
      setShowClearModal(false);
    } catch (error) {
      console.error('Error clearing chat:', error);
      // You might want to show an error toast here
    } finally {
      setClearingChat(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-300 relative">
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {chatTitle.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{chatTitle}</h2>
            <p className="text-sm text-purple-100">
              {messages.length > 0 ? `${messages.length} messages` : 'No messages yet'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* More Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="More options"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
            
            {showDropdown && (
              <>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20">
                  <button
                    onClick={handleClearChat}
                    disabled={messages.length === 0}
                    className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors duration-200 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Chat</span>
                  </button>
                </div>
                {/* Click outside to close dropdown */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div 
          ref={messagesContainerRef}
          className="absolute inset-0 overflow-y-auto p-4 space-y-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Send a message to start the conversation
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] relative group ${
                      message.senderId === user?.uid
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                    } rounded-2xl px-4 py-3 shadow-sm transition-colors duration-300`}
                  >
                    {message.senderId !== user?.uid && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {message.senderName}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    {message.senderId === user?.uid && (
                      <button
                        onClick={() => handleDeleteClick(message.id)}
                        className="absolute -left-10 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        {showScrollDown && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-10"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl transition-colors duration-300">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[44px] max-h-32 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
              rows={1}
              style={{ 
                height: 'auto',
                minHeight: '44px',
                maxHeight: '128px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || loading}
            className={`p-3 rounded-full transition-all duration-200 ${
              messageText.trim() && !loading
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Message
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Clear Chat
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to clear all messages in this chat? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClearModal(false)}
                disabled={clearingChat}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearChat}
                disabled={clearingChat}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {clearingChat && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{clearingChat ? 'Clearing...' : 'Clear Chat'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageLayout;