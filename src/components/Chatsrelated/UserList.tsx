import React, { useEffect, useState } from 'react';
import { Search, Lock, MessageCircle } from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useChatContext } from '../../contexts/ChatContext';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  profileVisibility?: string;
}

interface RecentChat {
  id: string;
  type: 'direct' | 'team';
  members?: string[];
  memberNames?: string[];
  teamId?: string;
  teamName?: string;
  lastMessage: string;
  updatedAt: any;
  otherUser?: User;
  unreadCount?: number;
}

const UserList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Set<string>>(new Set());
  const [teamMembers, setTeamMembers] = useState<Set<string>>(new Set());
  const { currentUser, startChat } = useChatContext();

  const handleSearch = async () => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('name', '>=', search),
        where('name', '<=', search + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      const results: User[] = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as User) }))
        .filter((u) => u.id !== currentUser?.uid);
      
      setUsers(results);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentChats = async () => {
    if (!currentUser) return;
    
    try {
      const chatQuery = query(
        collection(db, 'chats'),
        orderBy('updatedAt', 'desc'),
        limit(20)
      );
      const chatSnapshot = await getDocs(chatQuery);
      const chatsWithUsers: RecentChat[] = [];

      for (const docSnap of chatSnapshot.docs) {
        const data = docSnap.data();
        
        if (data.type === 'direct' && data.members?.includes(currentUser.uid)) {
          const otherUserId = data.members.find((id: string) => id !== currentUser.uid);
          if (otherUserId) {
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            if (userDoc.exists()) {
              const otherUser = { id: otherUserId, ...userDoc.data() } as User;
              
              // Get unread count for this chat
              const messagesQuery = query(
                collection(db, 'chats', docSnap.id, 'messages'),
                where('senderId', '!=', currentUser.uid),
                where('seen', '==', false)
              );
              
              let unreadCount = 0;
              try {
                const messagesSnapshot = await getDocs(messagesQuery);
                unreadCount = messagesSnapshot.size;
              } catch (error) {
                // Handle compound query limitations
                console.log('Using alternative query for unread messages');
              }
              
              chatsWithUsers.push({
                id: docSnap.id,
                ...data,
                otherUser,
                unreadCount
              } as RecentChat);
            }
          }
        } else if (data.type === 'team' && data.teamId) {
          // For team chats, check if user is a team member
          const teamDoc = await getDoc(doc(db, 'teams', data.teamId));
          if (teamDoc.exists() && teamDoc.data().members?.includes(currentUser.uid)) {
            chatsWithUsers.push({
              id: docSnap.id,
              ...data,
              unreadCount: 0 // Team chat unread count can be implemented later
            } as RecentChat);
          }
        }
      }

      setRecentChats(chatsWithUsers);
    } catch (error) {
      console.error('Error loading recent chats:', error);
    }
  };

  const loadCollaborators = async () => {
    if (!currentUser) return;

    try {
      const sentQuery = query(
        collection(db, 'collaborationRequests'),
        where('fromUserId', '==', currentUser.uid),
        where('status', '==', 'accepted')
      );
      
      const receivedQuery = query(
        collection(db, 'collaborationRequests'),
        where('toUserId', '==', currentUser.uid),
        where('status', '==', 'accepted')
      );

      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery)
      ]);

      const collabIds = new Set<string>();
      
      sentSnapshot.docs.forEach(doc => {
        collabIds.add(doc.data().toUserId);
      });
      
      receivedSnapshot.docs.forEach(doc => {
        collabIds.add(doc.data().fromUserId);
      });

      setCollaborators(collabIds);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    }
  };

  const loadTeamMembers = async () => {
    if (!currentUser) return;

    try {
      // Get all teams where user is a member
      const teamsQuery = query(
        collection(db, 'teams'),
        where('members', 'array-contains', currentUser.uid)
      );
      
      const teamsSnapshot = await getDocs(teamsQuery);
      const allTeamMemberIds = new Set<string>();

      teamsSnapshot.docs.forEach(doc => {
        const teamData = doc.data();
        teamData.members.forEach((memberId: string) => {
          if (memberId !== currentUser.uid) {
            allTeamMemberIds.add(memberId);
          }
        });
      });

      setTeamMembers(allTeamMemberIds);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadCollaborators();
      loadTeamMembers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (search.trim()) {
      const delay = setTimeout(() => handleSearch(), 300);
      return () => clearTimeout(delay);
    } else {
      loadRecentChats();
      setUsers([]); // Clear search results when not searching
    }
  }, [search, currentUser]);

  const canMessageUser = (user: User) => {
    // If user has public profile or no visibility setting (default to public), anyone can message
    if (!user.profileVisibility || user.profileVisibility === 'public') {
      return true;
    }
    
    // If user has private profile, only collaborators and team members can message
    if (user.profileVisibility === 'private') {
      return collaborators.has(user.id) || teamMembers.has(user.id);
    }
    
    return false;
  };

  const getRelationshipLabel = (user: User) => {
    const isCollaborator = collaborators.has(user.id);
    const isTeamMember = teamMembers.has(user.id);
    
    if (isCollaborator && isTeamMember) {
      return 'Collaborator & Teammate';
    } else if (isCollaborator) {
      return 'Collaborator';
    } else if (isTeamMember) {
      return 'Teammate';
    }
    return null;
  };

  const handleStartChat = (user: User) => {
    if (!canMessageUser(user)) {
      const isTeamMember = teamMembers.has(user.id);
      if (isTeamMember) {
        toast.error(`${user.name} has a private profile, but you can message them through your team chat.`);
      } else {
        toast.error(`${user.name} has a private profile. You need to collaborate with them first to send messages.`);
      }
      return;
    }
    
    startChat(user);
  };

  const handleStartChatFromRecent = (chat: RecentChat) => {
    if (chat.type === 'direct' && chat.otherUser) {
      startChat(chat.otherUser);
    } else if (chat.type === 'team' && chat.teamId && chat.teamName) {
      // Handle team chat
      window.location.href = `/chat?team=${chat.teamId}&name=${encodeURIComponent(chat.teamName)}`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by username..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {search.trim() ? 'Search Results' : 'Recent Chats'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {loading ? (
            <p className="text-gray-500 text-sm text-center py-4">Searching...</p>
          ) : search.trim() ? (
            // Show search results
            users.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-sm">No users found</p>
                <p className="text-xs text-gray-400 mt-2">
                  Try searching for someone's username to start a conversation
                </p>
              </div>
            ) : (
              users.map((user) => {
                const canMessage = canMessageUser(user);
                const relationshipLabel = getRelationshipLabel(user);
                
                return (
                  <div
                    key={user.id}
                    onClick={() => handleStartChat(user)}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      canMessage 
                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer' 
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {!canMessage && (
                        <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1">
                          <Lock className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        {relationshipLabel && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                            {relationshipLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      {!canMessage && (
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          {teamMembers.has(user.id) 
                            ? 'Private profile - use team chat'
                            : 'Private profile - collaborate first'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            // Show recent chats
            recentChats.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-sm">No recent chats</p>
              <p className="text-xs text-gray-400 mt-2">
                Search for someone's username to start a conversation
              </p>
            </div>
            ) : (
              recentChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleStartChatFromRecent(chat)}
                  className="flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <div className="relative">
                    {chat.type === 'direct' && chat.otherUser ? (
                      <img
                        src={chat.otherUser.avatar || '/default-avatar.png'}
                        alt={chat.otherUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${
                        chat.unreadCount && chat.unreadCount > 0 
                          ? 'font-bold text-gray-900 dark:text-white' 
                          : 'font-medium text-gray-900 dark:text-white'
                      }`}>
                        {chat.type === 'direct' && chat.otherUser 
                          ? chat.otherUser.name 
                          : chat.teamName
                        }
                      </p>
                      {chat.type === 'team' && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                          Team
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                        {chat.unreadCount} new message{chat.unreadCount > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;