import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Flag, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useNotesStore, Item } from '../hooks/useNotesStoreProvider';

interface NotesModalProps {
  note?: Item | null;
  onClose: () => void;
}

export default function NotesModal({ note, onClose }: NotesModalProps) {
  const { addItem, updateItem } = useNotesStore();
  
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [reminderTime, setReminderTime] = useState(note?.reminderTime || '');
  const [isFlagged, setIsFlagged] = useState(note?.isFlagged || false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    reminderTime ? parseISO(reminderTime) : new Date()
  );
  const [selectedHour, setSelectedHour] = useState(
    reminderTime ? parseInt(format(parseISO(reminderTime), 'HH')) : 12
  );
  const [selectedMinute, setSelectedMinute] = useState(
    reminderTime ? parseInt(format(parseISO(reminderTime), 'mm')) : 0
  );

  useEffect(() => {
    if (reminderTime) {
      const date = parseISO(reminderTime);
      setSelectedDate(date);
      setSelectedHour(parseInt(format(date, 'HH')));
      setSelectedMinute(parseInt(format(date, 'mm')));
    }
  }, [reminderTime]);

  const handleSave = () => {
    if (!title.trim()) return;

    const reminderDateTime = reminderTime
      ? new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          selectedHour,
          selectedMinute
        ).toISOString()
      : undefined;

    const noteData = {
      type: 'note' as const,
      title: title.trim(),
      content: content.trim(),
      reminderTime: reminderDateTime,
      isFlagged,
      isCompleted: false
    };

    if (note) {
      updateItem(note.id, noteData);
    } else {
      addItem(noteData);
    }

    onClose();
  };

  const handleToggleReminder = () => {
    if (reminderTime) {
      setReminderTime('');
    } else {
      setShowDatePicker(true);
    }
  };

  const handleDateSelect = () => {
    const reminderDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedHour,
      selectedMinute
    ).toISOString();
    setReminderTime(reminderDateTime);
    setShowDatePicker(false);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {note ? 'Modifier la note' : 'Nouvelle note'}
          </h2>
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
                Titre
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la note..."
                className="mt-1"
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                Contenu
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrivez votre note ici..."
                className="mt-1 min-h-[200px] resize-none"
              />
            </div>

            {/* Options */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              {/* Reminder Toggle */}
              <Button
                variant={reminderTime ? "default" : "outline"}
                size="sm"
                onClick={handleToggleReminder}
                className={reminderTime ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                <Clock className="h-4 w-4 mr-2" />
                {reminderTime ? 'Rappel défini' : 'Ajouter un rappel'}
              </Button>

              {/* Flag Toggle */}
              <Button
                variant={isFlagged ? "default" : "outline"}
                size="sm"
                onClick={() => setIsFlagged(!isFlagged)}
                className={isFlagged ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                <Flag className="h-4 w-4 mr-2" />
                {isFlagged ? 'Signalé' : 'Signaler'}
              </Button>
            </div>

            {/* Reminder Display */}
            {reminderTime && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-700">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Rappel: {format(parseISO(reminderTime), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Check className="h-4 w-4 mr-2" />
            {note ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Définir un rappel
              </h3>

              {/* Date Input */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700">Date</Label>
                <Input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="mt-1"
                />
              </div>

              {/* Time Pickers */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Heure</Label>
                  <div className="mt-1 h-32 overflow-y-auto border border-gray-200 rounded-lg">
                    {hours.map((hour) => (
                      <button
                        key={hour}
                        onClick={() => setSelectedHour(hour)}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                          selectedHour === hour ? 'bg-orange-100 text-orange-700' : ''
                        }`}
                      >
                        {hour.toString().padStart(2, '0')}:00
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Minute</Label>
                  <div className="mt-1 h-32 overflow-y-auto border border-gray-200 rounded-lg">
                    {minutes.map((minute) => (
                      <button
                        key={minute}
                        onClick={() => setSelectedMinute(minute)}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                          selectedMinute === minute ? 'bg-orange-100 text-orange-700' : ''
                        }`}
                      >
                        {minute.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setShowDatePicker(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleDateSelect}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Définir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}