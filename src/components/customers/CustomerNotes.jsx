import React, { useEffect, useMemo, useState } from 'react';
import { Trash2Icon } from 'lucide-react';
import { customersApi } from '../../apis/APIs';
import { useStore } from '../login/StoreContext';
import { useNotification } from '../../contexts/NotificationContext';

// Utility to normalize notes returned from API into component shape { id, date, note, isStarred }
const mapApiNote = (n) => ({
  id: n.id || n.noteId || n._id,
  date: n.createdAt || n.updatedAt || n.date || new Date().toISOString(),
  note: n.note || n.text || n.message || '',
  isStarred: !!(n.starred ?? n.isStarred ?? n.favourite)
});


// --- SVG Star Icon Component ---
// A reusable, self-contained SVG icon for starring notes.
const StarIcon = ({ isStarred, className = '' }) => (
  <svg
    className={`w-5 h-5 transition-all duration-200 ease-in-out ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={isStarred ? '#ffc107' : 'none'}
    stroke={isStarred ? '#ffc107' : '#4db6ac'} // Teal stroke for unstarred
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);


// --- Customer Notes Component ---
// This is the main component for displaying and managing notes, styled with Tailwind CSS.
export const CustomerNotes = ({ customer }) => {
  const { currentStore } = useStore();
  const { showNotification } = useNotification();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const customerId = useMemo(() => customer?.id || customer?.customerId || customer?.raw?.id || null, [customer]);

  useEffect(() => {
    const fetchNotes = async () => {
      setError('');
      setLoading(true);
      try {
        if (!currentStore?.id || !customerId) { setNotes([]); return; }
        const res = await customersApi.listNotes(currentStore.id, customerId);
        const mapped = (res?.notes || []).map(mapApiNote)
          .sort((a, b) => (b.isStarred - a.isStarred) || (new Date(b.date) - new Date(a.date)));
        setNotes(mapped);
      } catch (e) {
        console.error('Failed to fetch notes:', e);
        setError(e?.message || 'Failed to load notes');
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [currentStore?.id, customerId]);

  // Toggle star status (persist via API, then update UI)
  const handleToggleStar = async (note) => {
    try {
      if (!currentStore?.id || !customerId || !note?.id) return;
      const nextStar = !note.isStarred;
      await customersApi.updateNote(currentStore.id, customerId, note.id, { starred: nextStar });
      setNotes(prev => prev
        .map(n => (n.id === note.id ? { ...n, isStarred: nextStar } : n))
        .sort((a, b) => (b.isStarred - a.isStarred) || (new Date(b.date) - new Date(a.date))));
    } catch (e) {
      console.error('Failed to update note star:', e);
      showNotification(e?.message || 'Failed to update note', 'error');
    }
  };

  // Delete a note via API and update UI
  const handleDelete = async (noteId) => {
    try {
      if (!currentStore?.id || !customerId || !noteId) return;
      await customersApi.deleteNote(currentStore.id, customerId, noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (e) {
      console.error('Failed to delete note:', e);
      showNotification(e?.message || 'Failed to delete note', 'error');
    }
  };
  
  return (
    <div className="flex flex-col h-full text-gray-800">

      <div className="flex-grow overflow-y-auto p-4 sm:p-6">
        {loading && (
          <div className="text-center p-6 text-teal-500">Loading notes…</div>
        )}
        {!loading && error && (
          <div className="text-center p-6 text-red-500">{error}</div>
        )}
        {!loading && !error && notes.length > 0 ? (
          notes.map((note) => (
            <div 
              key={note.id} 
              className={`
                p-4 rounded-lg mb-3 transition-all duration-300 ease-in-out 
                border-l-4
                ${note.isStarred 
                  ? 'bg-teal-50 border-teal-600 shadow-md' 
                  : 'bg-white border-teal-400 shadow-sm'
                }
              `}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-teal-600 text-xs font-semibold uppercase tracking-wide">
                  {new Date(note.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="bg-transparent border-none cursor-pointer p-1 rounded-full flex items-center justify-center transition-colors hover:bg-teal-100"
                    onClick={() => handleToggleStar(note)}
                    aria-label={note.isStarred ? 'Unstar this note' : 'Star this note'}
                  >
                    <StarIcon isStarred={note.isStarred} />
                  </button>
                  <button
                    className="bg-transparent border-none cursor-pointer p-1 rounded-full flex items-center justify-center transition-colors hover:bg-red-50"
                    onClick={() => handleDelete(note.id)}
                    aria-label="Delete note"
                    title="Delete note"
                  >
                    <Trash2Icon className="text-red-600" size={18} />
                  </button>
                </div>
              </div>
              <p className="m-0 text-slate-700 leading-relaxed text-sm">
                {note.note}
              </p>
            </div>
          ))
        ) : (!loading && !error && (
          <div className="text-center p-10 text-teal-400">
            <p>No notes found.</p>
          </div>
        ))}
      </div>
    </div>
  );
};