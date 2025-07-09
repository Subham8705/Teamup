import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Edit3, 
  Save, 
  Trash2, 
  BookOpen,
  Clock,
  Search
} from 'lucide-react';
import {
  collection,
  query,
  where,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  updatedAt: any;
  userId: string;
  chatId?: string;
}

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  chatId?: string;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ isOpen, onClose, chatId }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Load notes on component mount
  useEffect(() => {
    if (user && isOpen) {
      loadNotes();
    }
  }, [user, isOpen, chatId]);

  const loadNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Use a simpler query without orderBy to avoid index requirement
      const notesQuery = query(
        collection(db, 'notes'),
        where('userId', '==', user.uid)
      );
      
      const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
        const notesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Note))
        // Sort on the client side instead of in the query
        .sort((a, b) => {
          const aTime = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
          const bTime = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
          return bTime.getTime() - aTime.getTime();
        });
        
        setNotes(notesData);
        setLoading(false);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error loading notes:', error);
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!user || !newNote.content.trim()) return;
    
    try {
      await addDoc(collection(db, 'notes'), {
        title: newNote.title.trim() || 'Untitled Note',
        content: newNote.content.trim(),
        userId: user.uid,
        chatId: chatId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setNewNote({ title: '', content: '' });
      setIsCreating(false);
      toast.success('Note saved successfully!');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };

  const updateNote = async (noteId: string, title: string, content: string) => {
    if (!user || !content.trim()) return;
    
    try {
      await updateDoc(doc(db, 'notes', noteId), {
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        updatedAt: serverTimestamp()
      });
      
      setEditingNote(null);
      toast.success('Note updated successfully!');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      toast.success('Note deleted successfully!');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              My Notes
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add Note Button */}
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Note</span>
          </button>

          {/* Create Note Form */}
          {isCreating && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-600">
              <input
                type="text"
                placeholder="Note title (optional)"
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-400"
              />
              <textarea
                placeholder="Write your note here..."
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
              />
              <div className="flex space-x-2">
                <button
                  onClick={saveNote}
                  disabled={!newNote.content.trim()}
                  className="flex items-center space-x-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewNote({ title: '', content: '' });
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notes List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notes yet. Create your first note!</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                isEditing={editingNote === note.id}
                onEdit={() => setEditingNote(note.id)}
                onSave={(title, content) => updateNote(note.id, title, content)}
                onDelete={() => deleteNote(note.id)}
                onCancel={() => setEditingNote(null)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface NoteCardProps {
  note: Note;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (title: string, content: string) => void;
  onDelete: () => void;
  onCancel: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, isEditing, onEdit, onSave, onDelete, onCancel }) => {
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    onSave(editTitle, editContent);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isEditing) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-600">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
        />
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white resize-none"
        />
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm"
          >
            <Save className="w-3 h-3" />
            <span>Save</span>
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
          {note.title}
        </h3>
        <div className="flex space-x-1">
          <button
            onClick={onEdit}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
          >
            <Edit3 className="w-3 h-3 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
          >
            <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-2">
        {note.content}
      </p>
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <Clock className="w-3 h-3 mr-1" />
        {formatDate(note.updatedAt)}
      </div>
    </div>
  );
};

export default NotesPanel;