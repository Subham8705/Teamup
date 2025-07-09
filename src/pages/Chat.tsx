import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  ArrowLeft,
  User as UserIcon,
  BookOpen
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
import NotesPanel from '../components/Chatsrelated/NotesPanel';
import { useAuth } from '../contexts/AuthContext';
import { useChatContext } from '../contexts/ChatContext';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: any;
  seen?: boolean;
}

const ChatPage: React.FC = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { selectedChat, setSelectedChat, startTeamChat } = useChatContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMobileUserList, setShowMobileUserList] = useState(false);
  const [currentChatInfo, setCurrentChatInfo] = useState<any>(null);
  const [showNotesPanel, setShowNotesPanel] = useState(false);

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

      // Create or update chat document
      await setDoc(chatRef, {
        id: chatId,
        type: 'direct',
        members: [user.uid, targetUserId],
        memberNames: [userProfile.name || user.email, targetUserName],
        memberEmails: [user.email, targetUserName + '@example.com'], // Fallback
        lastMessage: '',
        lastMessageSender: '',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        typingUsers: []
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
        markMessagesAsSeen(msgs);
      });
      
      return unsubscribe;
    } else {
      setMessages([]);
      setCurrentChatInfo(null);
    }
  }, [selectedChat]);

  const markMessagesAsSeen = async (msgs: Message[]) => {
    if (!user || !selectedChat) return;

    const unseenMessages = msgs.filter(msg => 
      msg.senderId !== user.uid && !msg.seen
    );

    if (unseenMessages.length > 0) {
      const batch = writeBatch(db);
      unseenMessages.forEach(msg => {
        const msgRef = doc(db, 'chats', selectedChat, 'messages', msg.id);
        batch.update(msgRef, { seen: true });
      });
      
      try {
        await batch.commit();
      } catch (error) {
        console.error('Error marking messages as seen:', error);
      }
    }
  };

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

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || !selectedChat || !user || !userProfile) {
      return;
    }
    setLoading(true);
    try {
      // Add message to subcollection
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
        lastMessageSender: user.uid,
        updatedAt: serverTimestamp()
      });
      
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
      const messagesQuery = query(collection(db, 'chats', selectedChat, 'messages'));
      const messagesSnapshot = await getDocs(messagesQuery);
      const batch = writeBatch(db);

      messagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      batch.update(doc(db, 'chats', selectedChat), {
        lastMessage: '',
        lastMessageSender: '',
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
    const otherName = currentChatInfo.memberNames?.find(
      (name: string) => name !== userProfile?.name && name !== user?.email
    );
    return otherName || 'Direct Chat';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto text-purple-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Please Sign In
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            You need to be signed in to access the chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="flex-shrink-0 p-6 pb-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                TeamUp Chat
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with your collaborators and team members
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Notes Button */}
            <button
              onClick={() => setShowNotesPanel(true)}
              className="bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
              title="Open Notes"
            >
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200" />
            </button>
            
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 shadow-lg transition-colors duration-300">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {userProfile?.name || user.email}
              </span>
            </div>
            <button
              onClick={() => setShowMobileUserList(!showMobileUserList)}
              className="lg:hidden bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-1 ${selectedChat && !showMobileUserList ? 'hidden lg:block' : ''}`}>
            <UserList />
          </div>
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
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg h-full flex items-center justify-center transition-colors duration-300">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Welcome to TeamUp Chat
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
                    Select a conversation from the sidebar or search for users to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes Panel */}
      <NotesPanel
        isOpen={showNotesPanel}
        onClose={() => setShowNotesPanel(false)}
        chatId={selectedChat || 'general'}
        userId={user.uid}
      />
    </div>
  );
};

export default ChatPage;