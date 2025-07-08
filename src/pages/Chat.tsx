import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  ArrowLeft,
  User as UserIcon
} from 'lucide-react';
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
  getDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import MessageLayout from '../components/Chatsrelated/MessageLayout';
import UserList from '../components/Chatsrelated/UserList';
import { useAuth } from '../contexts/AuthContext';
import { useChatContext } from '../contexts/ChatContext';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: any;
  seen: boolean;
}

const ChatPage: React.FC = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { selectedChat, setSelectedChat, startTeamChat } = useChatContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMobileUserList, setShowMobileUserList] = useState(false);
  const [currentChatInfo, setCurrentChatInfo] = useState<any>(null);

  // Handle URL parameters for direct chat or team chat
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUserId = urlParams.get('user');
    const targetUserName = urlParams.get('name');
    const teamId = urlParams.get('team');
    const teamName = urlParams.get('teamName');

    if (teamId && teamName && user) {
      startTeamChatFromUrl(teamId, teamName);
    } else if (targetUserId && user) {
      startChatWithUser(targetUserId, targetUserName || 'User');
    }
  }, [user]);

  const startChatWithUser = async (targetUserId: string, targetUserName: string) => {
    if (!user || !userProfile) return;
    
    try {
      const chatId = [user.uid, targetUserId].sort().join('_');
      const chatRef = doc(db, 'chats', chatId);
      
      await setDoc(chatRef, {
        id: chatId,
        type: 'direct',
        members: [user.uid, targetUserId],
        memberNames: [userProfile.name || user.email, targetUserName],
        lastMessage: '',
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setSelectedChat(chatId);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const startTeamChatFromUrl = async (teamId: string, teamName: string) => {
    if (!user) return;
    
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) {
        toast.error('Team not found');
        return;
      }
      
      const teamData = teamDoc.data();
      if (!teamData.members?.includes(user.uid)) {
        toast.error('You are not a member of this team');
        return;
      }
      
      await startTeamChat(teamId, teamName);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Error starting team chat:', error);
      toast.error('Failed to start team chat');
    }
  };

  useEffect(() => {
    if (selectedChat) {
      loadChatInfo(selectedChat);
      
      // Set up real-time listener for messages
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
        
        // Mark messages as seen
        markMessagesAsSeen(selectedChat, msgs);
      });
      
      return unsubscribe;
    } else {
      setMessages([]);
      setCurrentChatInfo(null);
    }
  }, [selectedChat]);

  const loadChatInfo = async (chatId: string) => {
    try {
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (chatDoc.exists()) {
        setCurrentChatInfo({ id: chatId, ...chatDoc.data() });
      }
    } catch (error) {
      console.error('Error loading chat info:', error);
    }
  };

  const markMessagesAsSeen = async (chatId: string, msgs: Message[]) => {
    if (!user) return;
    
    const unseenMessages = msgs.filter(m => !m.seen && m.senderId !== user.uid);
    if (unseenMessages.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      
      unseenMessages.forEach(message => {
        const messageRef = doc(db, 'chats', chatId, 'messages', message.id);
        batch.update(messageRef, { seen: true });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as seen:', error);
    }
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || !selectedChat || !user || !userProfile) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Add message to Firestore
      await addDoc(collection(db, 'chats', selectedChat, 'messages'), {
        senderId: user.uid,
        senderName: userProfile.name || user.email,
        content: messageContent.trim(),
        timestamp: serverTimestamp(),
        seen: false
      });
      
      // Update chat's last message
      await updateDoc(doc(db, 'chats', selectedChat), {
        lastMessage: messageContent.trim(),
        updatedAt: serverTimestamp()
      });
      
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!selectedChat || !user) return;
    
    try {
      await deleteDoc(doc(db, 'chats', selectedChat, 'messages', msgId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleClearChat = async () => {
    if (!selectedChat || !user) return;
    
    try {
      // Get all messages in the chat
      const messagesQuery = query(collection(db, 'chats', selectedChat, 'messages'));
      const messagesSnapshot = await getDocs(messagesQuery);
      
      // Delete all messages
      const batch = writeBatch(db);
      messagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Update chat's last message
      batch.update(doc(db, 'chats', selectedChat), {
        lastMessage: '',
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();
      toast.success('Chat cleared');
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Failed to clear chat');
    }
  };

  const getChatTitle = () => {
    if (!currentChatInfo) return 'Chat';
    
    if (currentChatInfo.type === 'team') {
      return `${currentChatInfo.teamName} (Team Chat)`;
    }
    
    // For direct chats, find the other user's name
    const otherName = currentChatInfo.memberNames?.find(
      (name: string) => name !== userProfile?.name && name !== user?.email
    );
    return otherName || 'Direct Chat';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto text-purple-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Please Sign In
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be signed in to access the chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                TeamUp Chat
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with your collaborators and team members
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* User Profile */}
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {userProfile?.name || user.email}
              </span>
            </div>
            
            {/* Mobile back button */}
            <button
              onClick={() => setShowMobileUserList(!showMobileUserList)}
              className="lg:hidden bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Chat Container */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List - Hidden on mobile when chat is selected */}
          <div className={`lg:col-span-1 ${selectedChat && !showMobileUserList ? 'hidden lg:block' : ''}`}>
            <UserList />
          </div>

          {/* Chat Interface */}
          <div className={`lg:col-span-2 ${!selectedChat && !showMobileUserList ? 'hidden lg:block' : ''}`}>
            {selectedChat ? (
              <MessageLayout
                messages={messages}
                onSendMessage={sendMessage}
                onDeleteMessage={handleDeleteMessage}
                onClearChat={handleClearChat}
                loading={loading}
                chatTitle={getChatTitle()}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Welcome to TeamUp Chat
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    Select a conversation from the sidebar or search for users to start chatting
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