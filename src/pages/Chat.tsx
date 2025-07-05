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
  setDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useChatContext } from '../contexts/ChatContext';
import { LogOut, MessageCircle } from 'lucide-react';
import MessageLayout from '../components/Chatsrelated/MessageLayout';
import UserList from '../components/Chatsrelated/UserList';

interface Chat {
  id: string;
  members: string[];
  lastMessage: string;
  updatedAt: any;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: any;
  seen: boolean;
}

const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { selectedChat } = useChatContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChat) {
      const q = query(
        collection(db, 'chats', selectedChat, 'messages'),
        orderBy('timestamp', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const markMessagesAsSeen = async (chatId: string, msgs: Message[]) => {
    if (!user) return;
    
    const unseenMessages = msgs.filter(m => !m.seen && m.senderId !== user.uid);
    
    for (const message of unseenMessages) {
      const messageRef = doc(db, 'chats', chatId, 'messages', message.id);
      await updateDoc(messageRef, { seen: true });
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !user) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'chats', selectedChat, 'messages'), {
        senderId: user.uid,
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ChatApp</h1>
              <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <UserList />
          </div>

          {/* Messages */}
          <div className="lg:col-span-2">
            {selectedChat ? (
              <MessageLayout
                chats={messages}
                onSend={sendMessage}
                messageText={messageText}
                setMessageText={setMessageText}
                bottomRef={bottomRef}
                currentUser={user}
              />
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
                    Search for people to start a conversation
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