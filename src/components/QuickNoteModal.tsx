import React, { useState, useEffect } from 'react';
import { X, Bell, Check, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useNotesStore, Item } from '../hooks/useNotesStoreProvider';
import ReminderPicker from './ReminderPicker';

interface QuickNoteModalProps {
  note?: Item | null;
  onClose: () => void;
}

export default function QuickNoteModal({ note, onClose }: QuickNoteModalProps) {
  const { addItem, updateItem } = useNotesStore();
  
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [reminderTime, setReminderTime] = useState(note?.reminderTime || '');
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Auto-save every 2 seconds when content changes
  useEffect(() => {
    if (!note) return; // Only auto-save for existing notes
    
    const timer = setTimeout(() => {
      if (title.trim() || content.trim()) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content]);

  const handleAutoSave = () => {
    if (!note) return;
    
    setIsAutoSaving(true);
    updateItem(note.id, {
      title: title.trim() || 'Note sans titre',
      content: content.trim()
    });
    
    setTimeout(() => setIsAutoSaving(false), 1000);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    const noteData = {
      type: 'note' as const,
      title: title.trim() || 'Note sans titre',
      content: content.trim(),
      reminderTime: reminderTime || undefined,
      isFlagged: false,
      isCompleted: false
    };

    if (note) {
      updateItem(note.id, noteData);
    } else {
      addItem(noteData);
    }

    onClose();
  };

  const handleReminderSelect = (reminderDateTime: string) => {
    setReminderTime(reminderDateTime);
    setShowReminderPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    // Escape to close
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {note ? 'Note rapide' : 'Nouvelle note rapide'}
          </h2>
          <div className="flex items-center gap-2">
            {isAutoSaving && (
              <span className="text-xs text-green-600">Enregistrement...</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la note (optionnel)..."
                className="text-lg font-medium border-none px-0 focus-visible:ring-0 shadow-none"
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Content */}
            <div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Capturez votre pensée...
                
Raccourcis :
• Cmd/Ctrl + Entrée : Enregistrer
• Échap : Fermer"
                className="min-h-[300px] resize-none border-none px-0 focus-visible:ring-0 shadow-none text-gray-700"
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>

            {/* Reminder */}
            <div className="pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setShowReminderPicker(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Bell className="h-4 w-4 mr-2" />
                {reminderTime 
                  ? `Rappel : ${format(parseISO(reminderTime), "d MMMM 'à' HH:mm", { locale: fr })}`
                  : 'Ajouter un rappel (optionnel)'
                }
              </Button>
            </div>

            {/* Reminder Display */}
            {reminderTime && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    Rappel défini pour : {format(parseISO(reminderTime), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            {note ? 'Auto-sauvegarde activée' : 'Cmd/Ctrl + Entrée pour enregistrer'}
          </div>
          <Button
            onClick={handleSave}
            disabled={!title.trim() && !content.trim()}
            className="bg-green-500 hover:bg-green-600"
          >
            <Check className="h-4 w-4 mr-2" />
            {note ? 'Mettre à jour' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Reminder Picker */}
      {showReminderPicker && (
        <ReminderPicker
          onClose={() => setShowReminderPicker(false)}
          onSelect={handleReminderSelect}
        />
      )}
    </div>
  );
}