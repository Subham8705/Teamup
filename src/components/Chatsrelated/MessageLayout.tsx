import React, { RefObject } from 'react';
import { Send, Clock, Check, CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: any;
  seen: boolean;
}

interface Props {
  chats: Message[];
  onSend: () => void;
  messageText: string;
  setMessageText: (msg: string) => void;
  bottomRef: RefObject<HTMLDivElement>;
  currentUser: any;
}

const MessageLayout: React.FC<Props> = ({ 
  chats, 
  onSend, 
  messageText, 
  setMessageText, 
  bottomRef, 
  currentUser 
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
        {chats.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-200 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chats.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  msg.senderId === currentUser?.uid
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <div className="flex items-center justify-end space-x-1 mt-2">
                  <span className={`text-xs ${
                    msg.senderId === currentUser?.uid ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </span>
                  {msg.senderId === currentUser?.uid && (
                    <div className="ml-1">
                      {msg.seen ? (
                        <CheckCheck className="w-3 h-3 text-purple-200" />
                      ) : (
                        <Check className="w-3 h-3 text-purple-200" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-colors"
            />
          </div>
          <button
            onClick={onSend}
            disabled={!messageText.trim()}
            className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageLayout;