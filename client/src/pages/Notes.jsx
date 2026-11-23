// client/src/pages/Notes.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, X, FileText, Save } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';

function formatTs(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const saveTimerRef = useRef(null);
  const [saved, setSaved] = useState(true);

  const selectedNote = notes.find(n => n.id === selectedId);

  // Sync local state when selected note changes
  useEffect(() => {
    if (selectedNote) {
      setLocalTitle(selectedNote.title);
      setLocalContent(selectedNote.content);
      setSaved(true);
    }
  }, [selectedId]);

  // Autosave on content changes
  useEffect(() => {
    if (!selectedId) return;
    setSaved(false);
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateNote(selectedId, { title: localTitle, content: localContent });
      setSaved(true);
    }, 800);
    return () => clearTimeout(saveTimerRef.current);
  }, [localTitle, localContent]);

  function handleNew() {
    const note = addNote();
    setSelectedId(note.id);
    addToast('New note created!', 'success');
  }

  function handleDelete() {
    const id = deleteId;
    if (selectedId === id) setSelectedId(null);
    deleteNote(id);
    addToast('Note deleted', 'info');
    setDeleteId(null);
  }

  const filtered = notes.filter(n => {
    if (!search) return true;
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="section-title">Notes</h1>
          <p className="section-subtitle">{notes.length} note{notes.length !== 1 ? 's' : ''} · autosave enabled</p>
        </div>
        <button className="btn btn-primary" onClick={handleNew}>
          <Plus size={16} /> New Note
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedNote ? '320px 1fr' : '1fr', gap: '1rem', alignItems: 'start' }}>

        {/* Notes list */}
        <div>
          <div className="search-bar mb-4">
            <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input placeholder="Search notes…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} /></button>}
          </div>

          {filtered.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-state-icon"><FileText size={28} /></div>
              <div className="empty-state-title">{search ? 'No results' : 'No notes yet'}</div>
              <div className="empty-state-text">{search ? 'Try a different term.' : 'Click "New Note" to start writing.'}</div>
            </div>
          ) : (
            filtered.map(note => (
              <div
                key={note.id}
                className="note-card"
                style={{ marginBottom: '0.75rem', border: selectedId === note.id ? '1px solid var(--color-primary-500)' : undefined, boxShadow: selectedId === note.id ? '0 0 0 3px rgb(99 102 241 / 0.15)' : undefined }}
                onClick={() => setSelectedId(note.id)}
              >
                <div className="note-card-title">{note.title || 'Untitled'}</div>
                <div className="note-card-content">{note.content || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Empty note…</span>}</div>
                <div className="note-card-footer">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTs(note.updatedAt)}</span>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    style={{ color: '#dc2626', opacity: 0.7 }}
                    onClick={e => { e.stopPropagation(); setDeleteId(note.id); }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Editor */}
        {selectedNote && (
          <div className="card" style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 1rem)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: 'var(--color-primary-500)' }} />
                <span className="text-sm text-secondary">{saved ? '✅ Saved' : '💾 Saving…'}</span>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedId(null)} title="Close">
                <X size={16} />
              </button>
            </div>

            <input
              className="form-input mb-3"
              style={{ fontSize: '1.125rem', fontWeight: 600, border: 'none', background: 'transparent', padding: '0.25rem 0', borderBottom: '1px solid var(--border-color)', borderRadius: 0 }}
              placeholder="Note title…"
              value={localTitle}
              onChange={e => setLocalTitle(e.target.value)}
            />

            <textarea
              className="form-textarea"
              style={{ minHeight: 400, border: 'none', background: 'transparent', padding: '0.5rem 0', resize: 'vertical', fontSize: '0.9375rem', lineHeight: 1.7 }}
              placeholder="Start writing your note…"
              value={localContent}
              onChange={e => setLocalContent(e.target.value)}
            />

            <div className="flex justify-between items-center mt-3" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              <span className="text-xs text-muted">{localContent.length} characters</span>
              <button
                className="btn btn-ghost btn-icon btn-sm"
                style={{ color: '#dc2626' }}
                onClick={() => setDeleteId(selectedNote.id)}
              >
                <Trash2 size={14} /> Delete note
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

