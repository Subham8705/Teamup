import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  orderBy,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useChatContext } from '../contexts/ChatContext';
import { LogOut, MessageCircle } from 'lucide-react';
import MessageLayout from '../components/Chatsrelated/MessageLayout';
import UserList from '../components/Chatsrelated/UserList';

interface Chat {
  id: string;
  type: 'direct' | 'team';
  members?: string[];
  memberNames?: string[];
  teamId?: string;
  teamName?: string;
  lastMessage: string;
  updatedAt: any;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: any;
  seen: boolean;
}

const ChatPage: React.FC = () => {
  const { user, logout, userProfile } = useAuth();
  const { selectedChat, setSelectedChat, startTeamChat } = useChatContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentChatInfo, setCurrentChatInfo] = useState<Chat | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Check for URL parameters to auto-start chat
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUserId = urlParams.get('user');
    const targetUserName = urlParams.get('name');
    const teamId = urlParams.get('team');
    const teamName = urlParams.get('name');
    
    if (teamId && teamName && user) {
      startTeamChatFromUrl(teamId, teamName);
    } else if (targetUserId && user) {
      startChatWithUser(targetUserId, targetUserName || 'User');
    }
  }, [user]);

  const startChatWithUser = async (targetUserId: string, targetUserName: string) => {
    if (!user) return;
    
    try {
      const chatId = [user.uid, targetUserId].sort().join('_');
      const chatRef = doc(db, 'chats', chatId);
      
      await setDoc(chatRef, {
        id: chatId,
        type: 'direct',
        members: [user.uid, targetUserId],
        memberNames: [userProfile?.name || user.email, targetUserName],
        lastMessage: '',
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setSelectedChat(chatId);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const startTeamChatFromUrl = async (teamId: string, teamName: string) => {
    if (!user) return;
    
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) {
        console.error('Team not found');
        return;
      }
      
      const teamData = teamDoc.data();
      if (!teamData.members.includes(user.uid)) {
        console.error('User is not a member of this team');
        return;
      }

      await startTeamChat(teamId, teamName);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Error starting team chat:', error);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      loadChatInfo(selectedChat);
      
      const messagesQuery = query(
        collection(db, 'chats', selectedChat, 'messages'),
        orderBy('timestamp', 'asc')
      );
      
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Message));
        setMessages(msgs);
        markMessagesAsSeen(selectedChat, msgs);
      });

      return unsubscribe;
    }
  }, [selectedChat]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const loadChatInfo = async (chatId: string) => {
    try {
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (chatDoc.exists()) {
        setCurrentChatInfo({ id: chatId, ...chatDoc.data() } as Chat);
      }
    } catch (error) {
      console.error('Error loading chat info:', error);
    }
  };

  const markMessagesAsSeen = async (chatId: string, msgs: Message[]) => {
    if (!user) return;
    
    const unseenMessages = msgs.filter(m => !m.seen && m.senderId !== user.uid);
    
    for (const message of unseenMessages) {
      const messageRef = doc(db, 'chats', chatId, 'messages', message.id);
      await updateDoc(messageRef, { seen: true });
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !user || !userProfile) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'chats', selectedChat, 'messages'), {
        senderId: user.uid,
        senderName: userProfile.name || user.email,
        content: messageText.trim(),
        timestamp: serverTimestamp(),
        seen: false
      });

      await updateDoc(doc(db, 'chats', selectedChat), {
        lastMessage: messageText.trim(),
        updatedAt: serverTimestamp()
      });

      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setLoading(false);
  };

  const getChatTitle = () => {
    if (!currentChatInfo) return 'Chat';
    
    if (currentChatInfo.type === 'team') {
      return `${currentChatInfo.teamName} (Team Chat)`;
    } else {
      const otherUserName = currentChatInfo.memberNames?.find(name => 
        name !== userProfile?.name && name !== user?.email
      );
      return otherUserName || 'Direct Chat';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TeamUp Chat</h1>
              <p className="text-gray-600 dark:text-gray-400">Connect with your collaborators and team members</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 12rem)' }}>
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <UserList />
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedChat ? (
              <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getChatTitle()}
                  </h3>
                  {currentChatInfo?.type === 'team' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Team collaboration space
                    </p>
                  )}
                </div>

                {/* Messages Container */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900"
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center py-12">
                        <div className="bg-gray-200 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">
                          {currentChatInfo?.type === 'team' 
                            ? 'Start collaborating with your team!' 
                            : 'No messages yet. Start the conversation!'
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                            msg.senderId === user?.uid
                              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          {currentChatInfo?.type === 'team' && msg.senderId !== user?.uid && (
                            <p className="text-xs font-medium mb-1 text-purple-600 dark:text-purple-400">
                              {msg.senderName}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <div className="flex items-center justify-end space-x-1 mt-2">
                            <span className={`text-xs ${
                              msg.senderId === user?.uid ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {msg.timestamp?.seconds ? 
                                new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                'Sending...'
                              }
                            </span>
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
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder={`Message ${getChatTitle()}...`}
                        rows={1}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-colors"
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!messageText.trim() || loading}
                      className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-gray-100 dark:bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Chat Selected
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Search for people or teams to start a conversation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;