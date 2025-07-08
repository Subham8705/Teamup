import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Lock, 
  MessageCircle, 
  Users, 
  Clock, 
  User,
  Loader2
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
  limit
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useChatContext } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface User {
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
  lastMessageSender?: string;
  lastMessageSenderName?: string;
  updatedAt: Date;
  unseenCount: number;
  isOnline?: boolean;
  members?: string[];
  memberNames?: string[];
}

const UserList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'search'>('recent');
  const [collaborators, setCollaborators] = useState<Set<string>>(new Set());
  const [teamMembers, setTeamMembers] = useState<Set<string>>(new Set());
  const { selectedChat, setSelectedChat, startChat } = useChatContext();
  const { user: currentUser, userProfile } = useAuth();

  // Load collaborators and team members
  useEffect(() => {
    if (currentUser) {
      loadCollaborators();
      loadTeamMembers();
    }
  }, [currentUser]);

  // Load recent chats with real-time updates
  useEffect(() => {
    if (currentUser && activeTab === 'recent') {
      const unsubscribe = loadRecentChats();
      return unsubscribe;
    }
  }, [currentUser, activeTab]);

  // Handle search
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

  const loadRecentChats = () => {
    if (!currentUser) return;

    try {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('members', 'array-contains', currentUser.uid),
        orderBy('updatedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
        const chats: Chat[] = [];
        
        for (const docSnap of snapshot.docs) {
          const chatData = docSnap.data();
          
          if (chatData.type === 'direct') {
            // Get other user's info
            const otherUserId = chatData.members.find((id: string) => id !== currentUser.uid);
            if (otherUserId) {
              const userDoc = await getDoc(doc(db, 'users', otherUserId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                
                // Count unseen messages
                const unseenQuery = query(
                  collection(db, 'chats', docSnap.id, 'messages'),
                  where('senderId', '!=', currentUser.uid),
                  where('seen', '==', false)
                );
                const unseenSnapshot = await getDocs(unseenQuery);
                
                chats.push({
                  id: docSnap.id,
                  type: 'direct',
                  name: userData.name || userData.email,
                  avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || userData.email)}&background=6366f1&color=fff`,
                  lastMessage: chatData.lastMessage || '',
                  lastMessageSender: chatData.lastMessageSender || '',
                  lastMessageSenderName: chatData.lastMessageSenderName || '',
                  updatedAt: chatData.updatedAt?.toDate() || new Date(),
                  unseenCount: unseenSnapshot.size,
                  isOnline: userData.isOnline || false,
                  members: chatData.members,
                  memberNames: chatData.memberNames
                });
              }
            }
          } else if (chatData.type === 'team') {
            // Count unseen messages for team chat
            const unseenQuery = query(
              collection(db, 'chats', docSnap.id, 'messages'),
              where('senderId', '!=', currentUser.uid),
              where('seen', '==', false)
            );
            const unseenSnapshot = await getDocs(unseenQuery);
            
            chats.push({
              id: docSnap.id,
              type: 'team',
              name: chatData.teamName,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(chatData.teamName)}&background=6366f1&color=fff`,
              lastMessage: chatData.lastMessage || '',
              lastMessageSender: chatData.lastMessageSender || '',
              lastMessageSenderName: chatData.lastMessageSenderName || '',
              updatedAt: chatData.updatedAt?.toDate() || new Date(),
              unseenCount: unseenSnapshot.size,
              isOnline: true,
              members: chatData.members
            });
          }
        }
        
        // Sort by unseen count first, then by update time
        chats.sort((a, b) => {
          if (a.unseenCount !== b.unseenCount) {
            return b.unseenCount - a.unseenCount;
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
      // Search by name
      const nameQuery = query(
        collection(db, 'users'),
        where('name', '>=', search),
        where('name', '<=', search + '\uf8ff'),
        limit(10)
      );
      
      // Search by email
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

      const userMap = new Map<string, User>();
      
      // Add users from name search
      nameSnapshot.docs.forEach(doc => {
        if (doc.id !== currentUser?.uid) {
          userMap.set(doc.id, { id: doc.id, ...doc.data() } as User);
        }
      });
      
      // Add users from email search
      emailSnapshot.docs.forEach(doc => {
        if (doc.id !== currentUser?.uid) {
          userMap.set(doc.id, { id: doc.id, ...doc.data() } as User);
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

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat.id);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const formatLastMessage = (chat: Chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    
    if (chat.type === 'team' && chat.lastMessageSenderName) {
      return `${chat.lastMessageSenderName}: ${chat.lastMessage}`;
    } else if (chat.type === 'direct') {
      if (chat.lastMessageSender === currentUser?.uid) {
        return `You: ${chat.lastMessage}`;
      } else {
        return chat.lastMessage;
      }
    }
    
    return chat.lastMessage;
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
                <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-sm">No recent chats</p>
                <p className="text-xs text-gray-400 mt-2">
                  Search for users to start a conversation
                </p>
              </div>
            ) : (
              recentChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
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
                    {chat.isOnline && chat.type === 'direct' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                    {chat.unseenCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unseenCount > 9 ? '9+' : chat.unseenCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium truncate ${
                        chat.unseenCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {chat.name}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(chat.updatedAt)}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${
                      chat.unseenCount > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatLastMessage(chat)}
                    </p>
                    {chat.type === 'team' && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Users className="w-3 h-3 text-purple-500" />
                        <span className="text-xs text-purple-600 dark:text-purple-400">Team Chat</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-4" />
                <p className="text-gray-500 text-sm">Searching users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-sm">
                  {search.trim() ? 'No users found' : 'Start typing to search users'}
                </p>
                {search.trim() && (
                  <p className="text-xs text-gray-400 mt-2">
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
                      {user.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      )}
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
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        {user.isOnline ? (
                          <span className="text-xs text-green-600 dark:text-green-400">Online</span>
                        ) : user.lastSeen ? (
                          <span className="text-xs text-gray-400">
                            Last seen {formatTimestamp(user.lastSeen)}
                          </span>
                        ) : null}
                      </div>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;