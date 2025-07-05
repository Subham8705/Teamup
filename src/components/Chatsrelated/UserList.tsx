import React, { useEffect, useState } from 'react';
import { Search, Lock, MessageCircle } from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot
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

const UserList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Set<string>>(new Set());
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
      const chatQuery = query(collection(db, 'chats'));
      const chatSnapshot = await getDocs(chatQuery);
      const otherUserIds: Set<string> = new Set();

      chatSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.members?.includes(currentUser.uid)) {
          data.members.forEach((id: string) => {
            if (id !== currentUser.uid) otherUserIds.add(id);
          });
        }
      });

      const promises = Array.from(otherUserIds).map(async (uid) => {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          return { id: uid, ...(userDoc.data() as User) };
        }
      });

      const results = (await Promise.all(promises)).filter(Boolean) as User[];
      setUsers(results);
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

  useEffect(() => {
    if (currentUser) {
      loadCollaborators();
    }
  }, [currentUser]);

  useEffect(() => {
    if (search.trim()) {
      const delay = setTimeout(() => handleSearch(), 300);
      return () => clearTimeout(delay);
    } else {
      loadRecentChats();
    }
  }, [search, currentUser]);

  const canMessageUser = (user: User) => {
    // If user has public profile or no visibility setting (default to public), anyone can message
    if (!user.profileVisibility || user.profileVisibility === 'public') {
      return true;
    }
    
    // If user has private profile, only collaborators can message
    if (user.profileVisibility === 'private') {
      return collaborators.has(user.id);
    }
    
    return false;
  };

  const handleStartChat = (user: User) => {
    if (!canMessageUser(user)) {
      toast.error(`${user.name} has a private profile. You need to collaborate with them first to send messages.`);
      return;
    }
    
    startChat(user);
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
            placeholder="Search users by name..."
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
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-sm">
                {search.trim() ? 'No users found' : 'No recent chats'}
              </p>
              {search.trim() && (
                <p className="text-xs text-gray-400 mt-2">
                  Try searching for someone's name to start a conversation
                </p>
              )}
            </div>
          ) : (
            users.map((user) => {
              const canMessage = canMessageUser(user);
              const isCollaborator = collaborators.has(user.id);
              
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
                      {isCollaborator && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                          Collaborator
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                    {!canMessage && (
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        Private profile - collaborate first
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;