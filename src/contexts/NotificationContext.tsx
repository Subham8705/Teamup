import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

interface ChatNotification {
  chatId: string;
  chatName: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: any;
}

interface NotificationCounts {
  teams: number;
  chats: number;
  collaborations: number;
  total: number;
  chatDetails: ChatNotification[];
}

interface NotificationContextType {
  notifications: NotificationCounts;
  markTeamNotificationsRead: () => Promise<void>;
  markChatNotificationsRead: (chatId?: string) => Promise<void>;
  markCollabNotificationsRead: () => Promise<void>;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user, userProfile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationCounts>({
    teams: 0,
    chats: 0,
    collaborations: 0,
    total: 0,
    chatDetails: []
  });

  useEffect(() => {
    if (!user) {
      setNotifications({ teams: 0, chats: 0, collaborations: 0, total: 0, chatDetails: [] });
      return;
    }

    const unsubscribes: (() => void)[] = [];

    // Listen to team applications
    const teamApplicationsQuery = query(
      collection(db, 'teamApplications'),
      where('teamOwnerId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribeApplications = onSnapshot(teamApplicationsQuery, (snapshot) => {
      const applicationCount = snapshot.size;
      updateTeamNotifications(applicationCount, 'applications');
    });
    unsubscribes.push(unsubscribeApplications);

    // Listen to team invitations
    const teamInvitationsQuery = query(
      collection(db, 'teamInvitations'),
      where('toUserId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribeInvitations = onSnapshot(teamInvitationsQuery, (snapshot) => {
      const invitationCount = snapshot.size;
      updateTeamNotifications(invitationCount, 'invitations');
    });
    unsubscribes.push(unsubscribeInvitations);

    // Listen to collaboration requests
    const collabRequestsQuery = query(
      collection(db, 'collaborationRequests'),
      where('toUserId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribeCollabRequests = onSnapshot(collabRequestsQuery, (snapshot) => {
      const collabCount = snapshot.size;
      setNotifications(prev => ({
        ...prev,
        collaborations: collabCount
      }));
    });
    unsubscribes.push(unsubscribeCollabRequests);

    // Listen to chats and unread messages
    const chatsQuery = query(collection(db, 'chats'));
    const unsubscribeChats = onSnapshot(chatsQuery, async (snapshot) => {
      const chatNotifications: ChatNotification[] = [];
      let totalUnreadCount = 0;
      
      for (const chatDoc of snapshot.docs) {
        const chatData = chatDoc.data();
        
        // Check if user is part of this chat
        const isDirectChat = chatData.type === 'direct' && chatData.members?.includes(user.uid);
        const isTeamChat = chatData.type === 'team';
        
        if (isDirectChat || isTeamChat) {
          // Get unread messages for this chat
          const messagesQuery = query(
            collection(db, 'chats', chatDoc.id, 'messages'),
            orderBy('timestamp', 'desc'),
            limit(50)
          );
          
          try {
            const messagesSnapshot = await getDocs(messagesQuery);
            let unreadCount = 0;
            let lastMessage = '';
            let lastMessageTime = null;
            
            messagesSnapshot.docs.forEach(messageDoc => {
              const messageData = messageDoc.data();
              
              // Count unread messages from others
              if (messageData.senderId !== user.uid && !messageData.seen) {
                unreadCount++;
              }
              
              // Get last message info
              if (!lastMessage) {
                lastMessage = messageData.content;
                lastMessageTime = messageData.timestamp;
              }
            });
            
            if (unreadCount > 0) {
              let chatName = '';
              
              if (chatData.type === 'team') {
                chatName = chatData.teamName || 'Team Chat';
              } else {
                // For direct chats, get the other person's name
                const otherUserName = chatData.memberNames?.find((name: string) => 
                  name !== userProfile?.name && name !== user.email
                );
                chatName = otherUserName || 'Direct Chat';
              }
              
              chatNotifications.push({
                chatId: chatDoc.id,
                chatName,
                unreadCount,
                lastMessage: lastMessage.substring(0, 50) + (lastMessage.length > 50 ? '...' : ''),
                lastMessageTime
              });
              
              totalUnreadCount += unreadCount;
            }
          } catch (error) {
            console.log('Error fetching messages for chat:', chatDoc.id);
          }
        }
      }
      
      setNotifications(prev => ({
        ...prev,
        chats: totalUnreadCount,
        chatDetails: chatNotifications
      }));
    });
    unsubscribes.push(unsubscribeChats);

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [user, userProfile]);

  // Update total whenever individual counts change
  useEffect(() => {
    setNotifications(prev => ({
      ...prev,
      total: prev.teams + prev.chats + prev.collaborations
    }));
  }, [notifications.teams, notifications.chats, notifications.collaborations]);

  const updateTeamNotifications = (count: number, type: 'applications' | 'invitations') => {
    setNotifications(prev => {
      const currentApplications = type === 'applications' ? count : Math.floor(prev.teams / 2);
      const currentInvitations = type === 'invitations' ? count : prev.teams - Math.floor(prev.teams / 2);
      
      return {
        ...prev,
        teams: currentApplications + currentInvitations
      };
    });
  };

  const markTeamNotificationsRead = async () => {
    setNotifications(prev => ({
      ...prev,
      teams: 0
    }));
  };

  const markChatNotificationsRead = async (chatId?: string) => {
    if (chatId) {
      // Mark specific chat as read
      setNotifications(prev => ({
        ...prev,
        chatDetails: prev.chatDetails.filter(chat => chat.chatId !== chatId),
        chats: Math.max(0, prev.chats - (prev.chatDetails.find(chat => chat.chatId === chatId)?.unreadCount || 0))
      }));
    } else {
      // Mark all chats as read
      setNotifications(prev => ({
        ...prev,
        chats: 0,
        chatDetails: []
      }));
    }
  };

  const markCollabNotificationsRead = async () => {
    setNotifications(prev => ({
      ...prev,
      collaborations: 0
    }));
  };

  const refreshNotifications = () => {
    // Force refresh by re-triggering useEffect
    if (user) {
      setNotifications({ teams: 0, chats: 0, collaborations: 0, total: 0, chatDetails: [] });
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      markTeamNotificationsRead,
      markChatNotificationsRead,
      markCollabNotificationsRead,
      refreshNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};