import React, { createContext, useContext, useState, ReactNode } from 'react';
import { doc, setDoc, serverTimestamp, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

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
    
    // Check if we can message this user based on their profile visibility
    const canMessage = await checkCanMessageUser(targetUser.id);
    if (!canMessage) {
      return; // Error message already shown in checkCanMessageUser
    }
    
    const chatId = [user.uid, targetUser.id].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    const existingChat = await getDoc(chatRef);
    if (!existingChat.exists()) {
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

  const checkCanMessageUser = async (targetUserId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Get target user's profile to check visibility
      const targetUserDoc = await getDoc(doc(db, 'users', targetUserId));
      if (!targetUserDoc.exists()) {
        toast.error('User not found');
        return false;
      }
      
      const targetUserData = targetUserDoc.data();
      
      // If user has public profile or no visibility setting (default to public), anyone can message
      if (!targetUserData.profileVisibility || targetUserData.profileVisibility === 'public') {
        return true;
      }
      
      // If user has private profile, check if current user is a collaborator or team member
      if (targetUserData.profileVisibility === 'private') {
        // Check if they are collaborators
        const sentCollabQuery = query(
          collection(db, 'collaborationRequests'),
          where('fromUserId', '==', user.uid),
          where('toUserId', '==', targetUserId),
          where('status', '==', 'accepted')
        );
        
        const receivedCollabQuery = query(
          collection(db, 'collaborationRequests'),
          where('fromUserId', '==', targetUserId),
          where('toUserId', '==', user.uid),
          where('status', '==', 'accepted')
        );
        
        const [sentSnapshot, receivedSnapshot] = await Promise.all([
          getDocs(sentCollabQuery),
          getDocs(receivedCollabQuery)
        ]);
        
        const isCollaborator = !sentSnapshot.empty || !receivedSnapshot.empty;
        
        if (isCollaborator) {
          return true;
        }
        
        // Check if they are team members
        const teamsQuery = query(
          collection(db, 'teams'),
          where('members', 'array-contains', user.uid)
        );
        
        const teamsSnapshot = await getDocs(teamsQuery);
        const isTeamMember = teamsSnapshot.docs.some(doc => {
          const teamData = doc.data();
          return teamData.members.includes(targetUserId);
        });
        
        if (isTeamMember) {
          toast.error(`This user has a private profile. You can message them through your team chat instead.`);
          return false;
        }
        
        // Not a collaborator or team member
        toast.error(`This user has a private profile. Send them a collaboration request first to be able to message them.`);
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking message permissions:', error);
      toast.error('Failed to check messaging permissions');
      return false;
    }
  };

  const startTeamChat = async (teamId: string, teamName: string) => {
    if (!user || !userProfile) return;
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) throw new Error('Team not found');
      const teamData = teamDoc.data();
      if (!teamData.members?.includes(user.uid)) throw new Error('You are not a member of this team');
      const chatId = `team_${teamId}`;
      const chatRef = doc(db, 'chats', chatId);
      const existingChat = await getDoc(chatRef);
      if (!existingChat.exists()) {
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