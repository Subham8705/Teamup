import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  doc, 
  setDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  getDoc
} from 'firebase/firestore';
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
  startTeamChat: (teamId: string, teamName: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const { user, userProfile } = useAuth();

  const startChat = async (targetUser: User) => {
    if (!user || !userProfile) return;
    
    const chatId = [user.uid, targetUser.id].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    
    // Check if chat already exists
    const existingChat = await getDoc(chatRef);
    
    if (!existingChat.exists()) {
      // Create new chat document
      await setDoc(chatRef, {
        id: chatId,
        type: 'direct',
        members: [user.uid, targetUser.id],
        memberNames: [userProfile.name || user.email, targetUser.name],
        memberEmails: [user.email, targetUser.email],
        lastMessage: '',
        lastMessageSender: '',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        typingUsers: []
      });
    }
    
    setSelectedChat(chatId);
  };

  const startTeamChat = async (teamId: string, teamName: string) => {
    if (!user || !userProfile) return;
    
    // Check if user is a member of the team
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }
      
      const teamData = teamDoc.data();
      if (!teamData.members?.includes(user.uid)) {
        throw new Error('You are not a member of this team');
      }
      
      const chatId = `team_${teamId}`;
      const chatRef = doc(db, 'chats', chatId);
      
      // Check if team chat already exists
      const existingChat = await getDoc(chatRef);
      
      if (!existingChat.exists()) {
        // Create team chat document
        await setDoc(chatRef, {
          id: chatId,
          type: 'team',
          teamId: teamId,
          teamName: teamName,
          members: teamData.members,
          lastMessage: '',
          lastMessageSender: '',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          typingUsers: []
        });
      }
      
      setSelectedChat(chatId);
    } catch (error) {
      console.error('Error starting team chat:', error);
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{ selectedChat, setSelectedChat, currentUser: user, startChat, startTeamChat }}
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