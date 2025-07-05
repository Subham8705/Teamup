import React, { createContext, useContext, useState, ReactNode } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface ChatContextType {
  selectedChat: string | null;
  setSelectedChat: (chatId: string | null) => void;
  currentUser: any;
  startChat: (targetUser: User) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const { user } = useAuth();

  const startChat = async (targetUser: User) => {
    if (!user) return;
    
    const chatId = [user.uid, targetUser.id].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    
    // Create chat document if it doesn't exist
    await setDoc(chatRef, {
      id: chatId,
      members: [user.uid, targetUser.id],
      lastMessage: '',
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    setSelectedChat(chatId);
  };

  return (
    <ChatContext.Provider
      value={{ selectedChat, setSelectedChat, currentUser: user, startChat }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within ChatProvider');
  return context;
};