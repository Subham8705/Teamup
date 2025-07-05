import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
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

interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

const UserList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser, startChat } = useChatContext();

  const handleSearch = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const loadRecentChats = async () => {
    if (!currentUser) return;
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
  };

  useEffect(() => {
    if (search.trim()) {
      const delay = setTimeout(() => handleSearch(), 300);
      return () => clearTimeout(delay);
    } else {
      loadRecentChats();
    }
  }, [search, currentUser]);

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {loading ? (
          <p className="text-gray-500 text-sm">Searching...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500 text-sm">No users found</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              onClick={() => startChat(user)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <img
                src={user.avatar || '/default-avatar.png'}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;
