// client/src/hooks/useNotes.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getItem, setItem } from '../utils/storage';

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (!user?.sub) { setNotes([]); return; }
    setNotes(getItem(user.sub, 'notes') || []);
  }, [user?.sub]);

  useEffect(() => {
    if (!user?.sub) return;
    // Debounced save
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setItem(user.sub, 'notes', notes);
    }, 500);
    return () => clearTimeout(saveTimerRef.current);
  }, [notes, user?.sub]);

  const addNote = useCallback(() => {
    const note = {
      id: newId(),
      title: 'New Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [note, ...prev]);
    return note;
  }, []);

  const updateNote = useCallback((id, updates) => {
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    ));
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notes, addNote, updateNote, deleteNote };
}

