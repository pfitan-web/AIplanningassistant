import React, { useState, useEffect } from 'react';
import { X, Bold, Italic, List, ListOrdered, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useNotesStore, Item } from '../hooks/useNotesStore';

interface NoteEditorProps {
  note?: Item | null;
  onClose: () => void;
}

export default function NoteEditor({ note, onClose }: NoteEditorProps) {
  const { addItem, updateItem, addSubTask, toggleSubTask, deleteSubTask } = useNotesStore();
  
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [isFlagged, setIsFlagged] = useState(note?.isFlagged || false);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsPinned(note.isPinned);
      setIsFlagged(note.isFlagged);
    }
  }, [note]);

  const handleSave = () => {
    const noteData = {
      type: 'note' as const,
      title: title.trim(),
      content: content.trim(),
      folder: 'Notes',
      priority: 'none' as const,
      isPinned,
      isFlagged,
      isLocked: false,
      isCompleted: false,
    };

    if (note) {
      updateItem(note.id, noteData);
    } else {
      addItem(noteData);
    }

    onClose();
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim() && note) {
      addSubTask(note.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    if (note) {
      toggleSubTask(note.id, subtaskId);
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (note) {
      deleteSubTask(note.id, subtaskId);
    }
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById('note-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const replacement = syntax.replace('{}', selectedText);
      const newContent = content.substring(0, start) + replacement + content.substring(end);
      setContent(newContent);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + syntax.indexOf('{'), start + syntax.indexOf('}') - 1);
      }, 0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl">
            {note ? 'Modifier la note' : 'Nouvelle note'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPinned(!isPinned)}
              className={isPinned ? 'text-yellow-500' : ''}
            >
              📌
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFlagged(!isFlagged)}
              className={isFlagged ? 'text-orange-500' : ''}
            >
              🚩
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto">
          {/* Title */}
          <input
            type="text"
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-semibold mb-4 p-2 border-b border-gray-200 focus:border-blue-500 focus:outline-none"
            autoFocus
          />

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('**{}**')}
              title="Gras"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('*{}*')}
              title="Italique"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('\n- {}')}
              title="Liste à puces"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('\n1. {}')}
              title="Liste numérotée"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('\n- [ ] {}')}
              title="Tâche"
            >
              <CheckSquare className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <Textarea
            id="note-content"
            placeholder="Commencez à écrire..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] mb-4 border-none p-0 resize-none focus:outline-none"
            style={{ fontFamily: 'monospace' }}
          />

          {/* Subtasks */}
          {note && note.subtasks && note.subtasks.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Tâches</h3>
              <div className="space-y-2">
                {note.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => handleToggleSubtask(subtask.id)}
                      className="rounded"
                    />
                    <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                      {subtask.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Subtask */}
          {note && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Ajouter une tâche..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <Button onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-gray-500 pt-4 border-t">
            {note ? (
              <p>Modifié le {format(new Date(note.updatedAt), 'd MMMM yyyy à HH:mm', { locale: fr })}</p>
            ) : (
              <p>Nouvelle note</p>
            )}
          </div>
        </CardContent>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <div className="flex-1" />
          <Button onClick={handleSave} disabled={!title.trim() && !content.trim()}>
            {note ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </Card>
    </div>
  );
}