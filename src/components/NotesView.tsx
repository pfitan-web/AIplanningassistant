import React, { useState, useEffect } from 'react';
import { Search, Mic, Plus, Edit, Trash2, Check } from 'lucide-react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import NoteModal from './NoteModal';

export default function NotesView() {
  const { items, addItem, updateItem, deleteItem } = useNotesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const notes = items.filter(item => item.type === 'note');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('La reconnaissance vocale n\'est pas supportée par votre navigateur');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      
      // Créer une nouvelle note avec la transcription
      addItem({
        type: 'note',
        title: transcript.slice(0, 50) + (transcript.length > 50 ? '...' : ''),
        content: transcript,
        isFlagged: false,
        isCompleted: false,
      });
      
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleComplete = (id: string) => {
    updateItem(id, { isCompleted: true });
  };

  const handleEdit = (note: any) => {
    // Pourrait ouvrir le modal avec la note pré-remplie
    setShowNoteModal(true);
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Search and Actions */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            onClick={handleVoiceInput}
            variant={isListening ? "default" : "outline"}
            className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
          >
            <Mic className={`h-4 w-4 mr-2 ${isListening ? 'animate-pulse' : ''}`} />
            {isListening ? 'Enregistrement...' : 'OK Google'}
          </Button>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Aucune note trouvée' : 'Aucune note'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Essayez une autre recherche'
                : 'Commencez par dicter ou écrire votre première note'
              }
            </p>
            <Button
              onClick={() => setShowNoteModal(true)}
              className="bg-green-500 hover:bg-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`group relative p-4 bg-white rounded-lg border-2 transition-all duration-200 ${
                  note.isCompleted
                    ? 'border-gray-200 opacity-60'
                    : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                }`}
              >
                {/* Action Buttons */}
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  {!note.isCompleted && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleComplete(note.id)}
                      className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(note)}
                    className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(note.id)}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Content */}
                <div>
                  <h3 className={`font-medium mb-2 ${
                    note.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}>
                    {note.title}
                  </h3>
                  
                  {note.content && (
                    <p className={`text-sm line-clamp-3 ${
                      note.isCompleted ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {note.content}
                    </p>
                  )}

                  <div className="mt-3 text-xs text-gray-400">
                    {new Date(note.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Note Modal */}
        {showNoteModal && (
          <NoteModal onClose={() => setShowNoteModal(false)} />
        )}
      </div>
    </div>
  );
}