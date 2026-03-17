import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useNotesStore, Item } from '../hooks/useNotesStoreProvider';

interface TimelineModalProps {
  item?: Item | null;
  onClose: () => void;
}

export default function TimelineModal({ item, onClose }: TimelineModalProps) {
  const { addItem, updateItem } = useNotesStore();
  
  const [title, setTitle] = useState(item?.title || '');
  const [content, setContent] = useState(item?.content || '');
  const [itemType, setItemType] = useState<'reminder' | 'event'>(
    item?.reminderTime ? 'reminder' : item?.eventTime ? 'event' : 'reminder'
  );
  const [reminderTime, setReminderTime] = useState(item?.reminderTime || '');
  const [eventTime, setEventTime] = useState(item?.eventTime || '');
  const [eventEndTime, setEventEndTime] = useState(item?.eventEndTime || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    (reminderTime || eventTime) ? parseISO(reminderTime || eventTime!) : new Date()
  );
  const [selectedHour, setSelectedHour] = useState(
    (reminderTime || eventTime) ? parseInt(format(parseISO(reminderTime || eventTime!), 'HH')) : 12
  );
  const [selectedMinute, setSelectedMinute] = useState(
    (reminderTime || eventTime) ? parseInt(format(parseISO(reminderTime || eventTime!), 'mm')) : 0
  );

  useEffect(() => {
    const time = reminderTime || eventTime;
    if (time) {
      const date = parseISO(time);
      setSelectedDate(date);
      setSelectedHour(parseInt(format(date, 'HH')));
      setSelectedMinute(parseInt(format(date, 'mm')));
    }
  }, [reminderTime, eventTime]);

  const handleSave = () => {
    if (!title.trim()) return;

    const dateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedHour,
      selectedMinute
    ).toISOString();

    const itemData = {
      type: itemType,
      title: title.trim(),
      content: content.trim(),
      reminderTime: itemType === 'reminder' ? dateTime : undefined,
      eventTime: itemType === 'event' ? dateTime : undefined,
      eventEndTime: itemType === 'event' ? eventEndTime : undefined,
      isFlagged: false,
      isCompleted: false
    };

    if (item) {
      updateItem(item.id, itemData);
    } else {
      addItem(itemData);
    }

    onClose();
  };

  const handleDateSelect = () => {
    const dateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedHour,
      selectedMinute
    ).toISOString();
    
    if (itemType === 'reminder') {
      setReminderTime(dateTime);
    } else {
      setEventTime(dateTime);
    }
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
            {item ? 'Modifier l\'élément' : 'Nouvel élément'}
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
            {/* Type Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Type</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={itemType === 'reminder' ? 'default' : 'outline'}
                  onClick={() => setItemType('reminder')}
                  className={itemType === 'reminder' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Rappel
                </Button>
                <Button
                  variant={itemType === 'event' ? 'default' : 'outline'}
                  onClick={() => setItemType('event')}
                  className={itemType === 'event' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Événement
                </Button>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Titre
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre..."
                className="mt-1"
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Description..."
                className="mt-1 min-h-[120px] resize-none"
              />
            </div>

            {/* Date/Time */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                {itemType === 'reminder' ? 'Date et heure du rappel' : 'Date et heure de l\'événement'}
              </Label>
              <Button
                variant="outline"
                onClick={() => setShowDatePicker(true)}
                className="mt-1 w-full justify-start"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {(reminderTime || eventTime) 
                  ? format(parseISO(reminderTime || eventTime!), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })
                  : 'Choisir une date et heure'
                }
              </Button>
            </div>

            {/* Event End Time */}
            {itemType === 'event' && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Heure de fin (optionnel)
                </Label>
                <Input
                  type="time"
                  value={eventEndTime ? format(parseISO(eventEndTime), 'HH:mm') : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [hours, minutes] = e.target.value.split(':');
                      const endTime = new Date(eventTime || new Date());
                      endTime.setHours(parseInt(hours), parseInt(minutes));
                      setEventEndTime(endTime.toISOString());
                    } else {
                      setEventEndTime('');
                    }
                  }}
                  className="mt-1"
                />
              </div>
            )}

            {/* Display */}
            {(reminderTime || eventTime) && (
              <div className={`border rounded-lg p-3 ${
                itemType === 'reminder' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className={`flex items-center gap-2 ${
                  itemType === 'reminder' ? 'text-orange-700' : 'text-blue-700'
                }`}>
                  {itemType === 'reminder' ? <Clock className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {itemType === 'reminder' ? 'Rappel' : 'Événement'}: {format(parseISO(reminderTime || eventTime!), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
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
            disabled={!title.trim() || (!reminderTime && !eventTime)}
            className={itemType === 'reminder' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'}
          >
            <Check className="h-4 w-4 mr-2" />
            {item ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Définir la date et l'heure
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