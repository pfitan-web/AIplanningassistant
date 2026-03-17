import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Bell, Check, Save } from 'lucide-react';
import { format, parseISO, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useNotesStore, Item } from '../hooks/useNotesStoreProvider';
import ReminderPicker from './ReminderPicker';

interface NoteModalProps {
  note?: Item | null;
  onClose: () => void;
  selectedDate?: Date;
}

export default function NoteModal({ note, onClose, selectedDate }: NoteModalProps) {
  const { addItem, updateItem } = useNotesStore();
  
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [reminderTime, setReminderTime] = useState(note?.reminderTime || '');
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((title.trim() || content.trim()) && !note) {
        handleSave(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        setContent(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSave = (close = true) => {
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

    if (close) {
      onClose();
    }
  };

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      alert('La reconnaissance vocale n\'est pas disponible dans votre navigateur. Utilisez Chrome pour cette fonctionnalité.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setIsRecording(true);
    }
  };

  const handleReminderSelect = (reminderDateTime: string) => {
    setReminderTime(reminderDateTime);
    setShowReminderPicker(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {note ? 'Modifier la note' : 'Note rapide'}
            </h2>
            {isRecording && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-600">Enregistrement...</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Titre (optionnel)
              </Label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la note..."
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                  Contenu *
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceToggle}
                  className={`h-8 px-3 ${isListening ? 'text-red-600 hover:text-red-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {isListening ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
                  {isListening ? 'Arrêter' : 'OK Google'}
                </Button>
              </div>
              <Textarea
                id="content"
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Dites ou écrivez votre note ici... (auto-sauvegarde toutes les 2 secondes)"
                className="mt-1 min-h-[200px] resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Utilisez *texte* pour le gras, - pour les listes
              </p>
            </div>

            {/* Reminder */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                <Bell className="h-4 w-4 inline mr-1" />
                Rappel (optionnel)
              </Label>
              <Button
                variant="outline"
                onClick={() => setShowReminderPicker(true)}
                className="mt-1 w-full justify-start"
              >
                <Bell className="h-4 w-4 mr-2" />
                {reminderTime 
                  ? format(parseISO(reminderTime), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })
                  : 'Ajouter un rappel'
                }
              </Button>
            </div>

            {/* Summary */}
            {(title.trim() || content.trim()) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm text-green-900">
                  <div className="font-medium mb-1">Résumé de la note :</div>
                  <div>📝 {title || 'Note sans titre'}</div>
                  <div>📄 {content.length} caractères</div>
                  {reminderTime && <div>🔔 Rappel: {format(parseISO(reminderTime), "d MMMM 'à' HH:mm", { locale: fr })}</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {!note && 'Auto-sauvegarde activée'}
            {note && 'Modifications non sauvegardées'}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={!title.trim() && !content.trim()}
              className="bg-green-500 hover:bg-green-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {note ? 'Mettre à jour' : 'Sauvegarder'}
            </Button>
          </div>
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