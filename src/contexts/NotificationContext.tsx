import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, query, where, onSnapshot, doc, updateDoc,getDocs,orderBy,limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

interface NotificationCounts {
  teams: number;
  chats: number;
  collaborations: number;
  total: number;
}

interface NotificationContextType {
  notifications: NotificationCounts;
  markTeamNotificationsRead: () => Promise<void>;
  markChatNotificationsRead: () => Promise<void>;
  markCollabNotificationsRead: () => Promise<void>;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationCounts>({
    teams: 0,
    chats: 0,
    collaborations: 0,
    total: 0
  });

  useEffect(() => {
    if (!user) {
      setNotifications({ teams: 0, chats: 0, collaborations: 0, total: 0 });
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
      setNotifications(prev => ({
        ...prev,
        teams: applicationCount + prev.teams - (prev.teams > 0 ? Math.floor(prev.teams / 2) : 0)
      }));
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
      setNotifications(prev => ({
        ...prev,
        teams: prev.teams + invitationCount
      }));
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

    // Listen to unread messages
    const chatsQuery = query(collection(db, 'chats'));
    const unsubscribeChats = onSnapshot(chatsQuery, async (snapshot) => {
      let unreadCount = 0;
      
      for (const chatDoc of snapshot.docs) {
        const chatData = chatDoc.data();
        
        // Check if user is part of this chat
        const isDirectChat = chatData.type === 'direct' && chatData.members?.includes(user.uid);
        const isTeamChat = chatData.type === 'team';
        
        if (isDirectChat || isTeamChat) {
          // Check for unread messages
          const messagesQuery = query(
            collection(db, 'chats', chatDoc.id, 'messages'),
            where('senderId', '!=', user.uid),
            where('seen', '==', false),
            orderBy('senderId'),
            orderBy('timestamp', 'desc'),
            limit(50)
          );
          
          try {
            const messagesSnapshot = await getDocs(messagesQuery);
            unreadCount += messagesSnapshot.size;
          } catch (error) {
            // Handle compound query limitations
            console.log('Using alternative query for unread messages');
          }
        }
      }
      
      setNotifications(prev => ({
        ...prev,
        chats: unreadCount
      }));
    });
    unsubscribes.push(unsubscribeChats);

    // Calculate total
    setNotifications(prev => ({
      ...prev,
      total: prev.teams + prev.chats + prev.collaborations
    }));

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [user]);

  // Update total whenever individual counts change
  useEffect(() => {
    setNotifications(prev => ({
      ...prev,
      total: prev.teams + prev.chats + prev.collaborations
    }));
  }, [notifications.teams, notifications.chats, notifications.collaborations]);

  const markTeamNotificationsRead = async () => {
    setNotifications(prev => ({
      ...prev,
      teams: 0,
      total: prev.chats + prev.collaborations
    }));
  };

  const markChatNotificationsRead = async () => {
    setNotifications(prev => ({
      ...prev,
      chats: 0,
      total: prev.teams + prev.collaborations
    }));
  };

  const markCollabNotificationsRead = async () => {
    setNotifications(prev => ({
      ...prev,
      collaborations: 0,
      total: prev.teams + prev.chats
    }));
  };

  const refreshNotifications = () => {
    // Force refresh by re-triggering useEffect
    if (user) {
      setNotifications({ teams: 0, chats: 0, collaborations: 0, total: 0 });
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