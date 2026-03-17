import React, { useState, useEffect } from 'react';
import { Search, Plus, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useNotesStore, Note } from '../hooks/useNotesStore';
import DateTimePicker from './DateTimePicker';

export default function NotesEditor() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { notes, createNote, updateNote, deleteNote } = useNotesStore();

  const filteredNotes = notes.filter(note => 
    !note.reminderTime && 
    (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     note.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateNote = () => {
    const newNote = createNote('Nouvelle Note', '');
    setSelectedNote(newNote);
  };

  const handleSaveNote = () => {
    if (selectedNote) {
      updateNote(selectedNote.id, {
        title: selectedNote.title,
        content: selectedNote.content
      });
    }
  };

  const handleSetReminder = (date: Date) => {
    if (selectedNote) {
      updateNote(selectedNote.id, {
        reminderTime: date,
        type: 'reminder'
      });
      setShowDatePicker(false);
      setSelectedNote(null);
    }
  };

  useEffect(() => {
    if (selectedNote) {
      const timer = setTimeout(() => {
        handleSaveNote();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedNote?.title, selectedNote?.content]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Rechercher des notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-orange-200 focus:border-orange-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Notes</h3>
            <Button onClick={handleCreateNote} className="bg-orange-400 hover:bg-orange-500">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Note
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-gray-600">Aucune note pour le moment</p>
                <p className="text-sm text-gray-500">Créez votre première note pour commencer</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`cursor-pointer transition-all ${
                    selectedNote?.id === note.id
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  <CardContent className="p-3">
                    <h4 className="font-medium text-gray-800 truncate">{note.title || 'Sans titre'}</h4>
                    {note.content && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.content}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {format(new Date(note.updatedAt), 'd MMM HH:mm', { locale: fr })}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Note Editor */}
        <div>
          {selectedNote ? (
            <Card className="border-orange-200">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <Input
                    placeholder="Titre de la note..."
                    value={selectedNote.title}
                    onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value})}
                    className="text-lg font-semibold border-orange-200 focus:border-orange-400"
                  />
                  
                  <textarea
                    placeholder="Écrivez votre note ici..."
                    value={selectedNote.content}
                    onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value})}
                    className="w-full h-48 p-3 border border-orange-200 rounded-lg resize-none focus:border-orange-400 focus:outline-none"
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowDatePicker(true)}
                      variant="outline"
                      className="border-orange-200 text-orange-600 hover:bg-orange-50"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Définir un rappel
                    </Button>
                    <Button
                      onClick={() => deleteNote(selectedNote.id)}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600">Sélectionnez une note pour la modifier</p>
              <p className="text-sm text-gray-500 mt-2">Ou créez-en une nouvelle pour commencer</p>
            </div>
          )}
        </div>
      </div>

      {/* Date Time Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          onSelect={handleSetReminder}
          onCancel={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
}