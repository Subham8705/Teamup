import React, { useEffect, useState } from 'react';
import { 
  Search, 
  MessageCircle, 
  Users, 
  Clock, 
  User,
  Loader2,
  Trash2
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  limit,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useChatContext } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface UserType {
  id: string;
  name: string;
  avatar: string;
  email: string;
  profileVisibility?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

interface Chat {
  id: string;
  type: 'direct' | 'team';
  name: string;
  avatar: string;
  lastMessage: string;
  updatedAt: Date;
  isOnline?: boolean;
  unreadCount?: number;
}

const UserList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'search'>('recent');
  const [collaborators, setCollaborators] = useState<Set<string>>(new Set());
  const [teamMembers, setTeamMembers] = useState<Set<string>>(new Set());
  const { selectedChat, setSelectedChat, startChat } = useChatContext();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadCollaborators();
      loadTeamMembers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && activeTab === 'recent') {
      loadRecentChats();
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    if (search.trim()) {
      setActiveTab('search');
      const delay = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setActiveTab('recent');
      setUsers([]);
      setLoading(false);
    }
  }, [search]);

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent triggering the chat selection
  try {
    // Add your Firestore delete logic here
    await deleteDoc(doc(db, 'chats', chatId));
    toast.success('Chat deleted successfully');
    // Optionally refresh the chat list
    loadRecentChats();
  } catch (error) {
    console.error('Error deleting chat:', error);
    toast.error('Failed to delete chat');
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

  const loadRecentChats = async () => {
    if (!currentUser) return;
    try {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('members', 'array-contains', currentUser.uid),
        orderBy('updatedAt', 'desc'),
        limit(20)
      );
      
      const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
        const chats: Chat[] = [];
        
        for (const docSnap of snapshot.docs) {
          const chatData = docSnap.data();
          let unreadCount = 0;
          
          // Count unread messages
          try {
            const messagesQuery = query(
              collection(db, 'chats', docSnap.id, 'messages'),
              where('senderId', '!=', currentUser.uid),
              where('seen', '==', false)
            );
            const unreadSnapshot = await getDocs(messagesQuery);
            unreadCount = unreadSnapshot.size;
          } catch (error) {
            // Handle compound query limitations
            console.log('Using alternative method for unread count');
          }
          
          if (chatData.type === 'direct') {
            const otherUserId = chatData.members.find((id: string) => id !== currentUser.uid);
            if (otherUserId) {
              const userDoc = await getDoc(doc(db, 'users', otherUserId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                chats.push({
                  id: docSnap.id,
                  type: 'direct',
                  name: userData.name || userData.email,
                  avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || userData.email)}&background=6366f1&color=fff`,
                  lastMessage: chatData.lastMessage || '',
                  updatedAt: chatData.updatedAt?.toDate() || new Date(),
                  isOnline: userData.isOnline || false,
                  unreadCount
                });
              }
            }
          } else if (chatData.type === 'team') {
            chats.push({
              id: docSnap.id,
              type: 'team',
              name: chatData.teamName,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(chatData.teamName)}&background=6366f1&color=fff`,
              lastMessage: chatData.lastMessage || '',
              updatedAt: chatData.updatedAt?.toDate() || new Date(),
              isOnline: true,
              unreadCount
            });
          }
        }
        
        // Sort by unread messages first, then by last activity
        chats.sort((a, b) => {
          if (a.unreadCount !== b.unreadCount) {
            return (b.unreadCount || 0) - (a.unreadCount || 0);
          }
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        });
        
        setRecentChats(chats);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error loading recent chats:', error);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }
    setLoading(true);
    try {
      const nameQuery = query(
        collection(db, 'users'),
        where('name', '>=', search),
        where('name', '<=', search + '\uf8ff'),
        limit(10)
      );
      const emailQuery = query(
        collection(db, 'users'),
        where('email', '>=', search.toLowerCase()),
        where('email', '<=', search.toLowerCase() + '\uf8ff'),
        limit(10)
      );
      const [nameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(nameQuery),
        getDocs(emailQuery)
      ]);
      const userMap = new Map<string, UserType>();
      nameSnapshot.docs.forEach(doc => {
        if (doc.id !== currentUser?.uid) {
          userMap.set(doc.id, { id: doc.id, ...doc.data() } as UserType);
        }
      });
      emailSnapshot.docs.forEach(doc => {
        if (doc.id !== currentUser?.uid) {
          userMap.set(doc.id, { id: doc.id, ...doc.data() } as UserType);
        }
      });
      setUsers(Array.from(userMap.values()));
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const canMessageUser = (user: UserType) => {
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

  const getRelationshipLabel = (user: UserType) => {
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

  const handleStartChat = (user: UserType) => {
    if (!canMessageUser(user)) {
      const isTeamMember = teamMembers.has(user.id);
      const isCollaborator = collaborators.has(user.id);
      
      if (isTeamMember) {
        toast.error(`${user.name} has a private profile. You can message them through your team chat instead.`);
      } else if (isCollaborator) {
        // This shouldn't happen as collaborators should be able to message
        toast.error(`${user.name} has a private profile. Try refreshing the page.`);
      } else {
        toast.error(`${user.name} has a private profile. Send them a collaboration request first to be able to message them.`);
      }
      return;
    }
    startChat(user);
  };

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat.id);
  };

 const formatTimestamp = (timestamp: any) => {
  const date = timestamp?.toDate?.() || new Date(timestamp); // handle both Timestamp and Date
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden h-full flex flex-col transition-colors duration-300">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by username..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300"
          />
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'recent'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Recent</span>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'recent' ? (
          <div className="p-4 space-y-2">
            {recentChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No recent chats</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Search for users to start a conversation
                </p>
              </div>
            ) : (
              recentChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  className={`group relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat === chat.id
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {chat.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium truncate text-gray-900 dark:text-white ${
                        chat.unreadCount && chat.unreadCount > 0 ? 'font-bold' : ''
                      }`}>
                        {chat.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(chat.updatedAt)}
                        </span>
                        {Number(chat.unreadCount) > 0 && (
                          <span className="bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className={`text-xs truncate text-gray-500 dark:text-gray-400 ${
                      chat.unreadCount && chat.unreadCount > 0 ? 'font-medium' : ''
                    }`}>
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                    {chat.type === 'team' && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Users className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                        <span className="text-xs text-purple-600 dark:text-purple-400">Team Chat</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                    title="Delete chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 dark:text-purple-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Searching users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {search.trim() ? 'No users found' : 'Start typing to search users'}
                </p>
                {search.trim() && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Try searching for someone's username or email
                  </p>
                )}
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
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
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
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        {user.isOnline ? (
                          <span className="text-xs text-green-600 dark:text-green-400">Online</span>
                        ) : user.lastSeen ? (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Last seen {formatTimestamp(user.lastSeen)}
                          </span>
                        ) : null}
                      </div>
                      {!canMessage && (
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          {teamMembers.has(user.id) 
                            ? 'Private profile - message via team chat'
                            : 'Private profile - send collaboration request first'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;