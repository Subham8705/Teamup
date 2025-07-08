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
        teams: applicationCount
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

    // Listen to unread messages in all chats
    const chatsQuery = query(
      collection(db, 'chats'),
      where('members', 'array-contains', user.uid)
    );
    
    const unsubscribeChats = onSnapshot(chatsQuery, async (snapshot) => {
      let totalUnreadCount = 0;
      
      for (const chatDoc of snapshot.docs) {
        try {
          // Count unread messages in this chat
          const messagesQuery = query(
            collection(db, 'chats', chatDoc.id, 'messages'),
            where('senderId', '!=', user.uid),
            where('seen', '==', false)
          );
          
          const messagesSnapshot = await getDocs(messagesQuery);
          totalUnreadCount += messagesSnapshot.size;
        } catch (error) {
          // Handle compound query limitations - fallback to simpler query
          console.log('Using fallback query for chat notifications');
          const messagesQuery = query(
            collection(db, 'chats', chatDoc.id, 'messages'),
            where('seen', '==', false),
            orderBy('timestamp', 'desc'),
            limit(50)
          );
          
          try {
            const messagesSnapshot = await getDocs(messagesQuery);
            const unreadMessages = messagesSnapshot.docs.filter(doc => 
              doc.data().senderId !== user.uid
            );
            totalUnreadCount += unreadMessages.length;
          } catch (fallbackError) {
            console.error('Error counting unread messages:', fallbackError);
          }
        }
      }
      
      setNotifications(prev => ({
        ...prev,
        chats: totalUnreadCount
      }));
    });
    unsubscribes.push(unsubscribeChats);

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