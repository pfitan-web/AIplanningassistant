import React, { useState, useRef, useEffect } from 'react';
import { Mic, Plus, Search, Clock, Bell, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { format, parseISO, isToday, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { useNotesStore, Item } from '../hooks/useNotesStoreProvider';
import QuickNoteModal from './QuickNoteModal';

export default function QuickNotesView() {
  const {
    items,
    searchQuery,
    setSearchQuery,
    deleteItem,
    updateItem
  } = useNotesStore();

  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Item | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceInput, setVoiceInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter for notes (type 'note' without eventTime)
  const notes = items.filter(item => item.type === 'note' && !item.eventTime);

  // Filter by search
  const filteredNotes = searchQuery
    ? notes.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : notes;

  // Group notes: recent today, older, with reminders
  const todayNotes = filteredNotes.filter(item => 
    isToday(parseISO(item.createdAt))
  );

  const notesWithReminders = filteredNotes.filter(item => 
    item.reminderTime && !isToday(parseISO(item.createdAt))
  );

  const olderNotes = filteredNotes.filter(item => 
    !isToday(parseISO(item.createdAt)) && !item.reminderTime
  );

  const handleQuickAdd = () => {
    setEditingNote(null);
    setShowQuickNoteModal(true);
  };

  const handleEditNote = (note: Item) => {
    setEditingNote(note);
    setShowQuickNoteModal(true);
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      deleteItem(noteId);
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setVoiceInput(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (voiceInput.trim()) {
          // Auto-create note from voice input
          const noteData = {
            type: 'note' as const,
            title: voiceInput.slice(0, 50) + (voiceInput.length > 50 ? '...' : ''),
            content: voiceInput,
            isFlagged: false,
            isCompleted: false
          };
          // This would need to be connected to the store
          setVoiceInput('');
        }
      };

      recognition.start();
    } else {
      alert('La reconnaissance vocale n\'est pas supportée par votre navigateur');
    }
  };

  const QuickNoteCard = ({ note }: { note: Item }) => {
    const hasReminder = !!note.reminderTime;
    const isOverdue = hasReminder && note.reminderTime && isPast(parseISO(note.reminderTime));

    return (
      <Card className="mb-3 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{note.title}</h3>
              {note.content && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{note.content}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>
                  {format(parseISO(note.createdAt), "d MMMM 'à' HH:mm", { locale: fr })}
                </span>
                {hasReminder && (
                  <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                    <Bell className="h-3 w-3" />
                    {format(parseISO(note.reminderTime!), "d MMM HH:mm", { locale: fr })}
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowMenu(showMenu === note.id ? null : note.id)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          {/* Dropdown Menu */}
          {showMenu === note.id && (
            <div className="absolute right-4 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  handleEditNote(note);
                  setShowMenu(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </button>
              <button
                onClick={() => {
                  handleDeleteNote(note.id);
                  setShowMenu(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Notes Rapides</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              onClick={handleVoiceInput}
              className="relative"
            >
              <Mic className="h-4 w-4 mr-2" />
              {isRecording ? 'Enregistrement...' : 'OK Google'}
              {isRecording && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </Button>
            <Button
              onClick={handleQuickAdd}
              className="bg-green-500 hover:bg-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Note rapide
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Voice Input Display */}
      {isRecording && voiceInput && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="text-sm text-red-800">
            <strong>Enregistrement en cours :</strong> {voiceInput}
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">Aucune note</p>
            <p className="text-sm text-gray-400 mb-4">
              {searchQuery ? 'Essayez une autre recherche' : 'Capturez vos pensées rapidement'}
            </p>
            {!searchQuery && (
              <div className="flex gap-2">
                <Button onClick={handleQuickAdd} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Note rapide
                </Button>
                <Button onClick={handleVoiceInput} variant="outline">
                  <Mic className="h-4 w-4 mr-2" />
                  Vocal
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Today's Notes */}
            {todayNotes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Aujourd'hui ({todayNotes.length})
                </h3>
                {todayNotes.map(note => (
                  <QuickNoteCard key={note.id} note={note} />
                ))}
              </div>
            )}

            {/* Notes with Reminders */}
            {notesWithReminders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Avec rappels ({notesWithReminders.length})
                </h3>
                {notesWithReminders.map(note => (
                  <QuickNoteCard key={note.id} note={note} />
                ))}
              </div>
            )}

            {/* Older Notes */}
            {olderNotes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Plus anciennes ({olderNotes.length})
                </h3>
                {olderNotes.map(note => (
                  <QuickNoteCard key={note.id} note={note} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Note Modal */}
      {showQuickNoteModal && (
        <QuickNoteModal
          note={editingNote}
          onClose={() => {
            setShowQuickNoteModal(false);
            setEditingNote(null);
          }}
        />
      )}
    </div>
  );
}