import React, { useState } from 'react';
import { X, Clock, Calendar, Check } from 'lucide-react';
import { format, addMinutes, addHours, addDays, isTomorrow, isToday, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface ReminderPickerProps {
  onClose: () => void;
  onSelect: (reminderTime: string) => void;
  eventTime?: string;
}

export default function ReminderPicker({ onClose, onSelect, eventTime }: ReminderPickerProps) {
  const [customDate, setCustomDate] = useState('');
  const [customHour, setCustomHour] = useState(9);
  const [customMinute, setCustomMinute] = useState(0);
  const [showCustom, setShowCustom] = useState(false);

  const now = new Date();
  const eventDate = eventTime ? new Date(eventTime) : now;

  // Quick options
  const quickOptions = [
    {
      label: 'Dans 15 minutes',
      time: addMinutes(now, 15).toISOString()
    },
    {
      label: 'Dans 30 minutes',
      time: addMinutes(now, 30).toISOString()
    },
    {
      label: 'Dans 1 heure',
      time: addHours(now, 1).toISOString()
    },
    {
      label: 'Demain à 9h',
      time: new Date(new Date().setHours(9, 0, 0, 0)).toISOString()
    },
    {
      label: 'Dans 3 jours',
      time: addDays(now, 3).toISOString()
    },
    {
      label: 'La semaine prochaine',
      time: addDays(now, 7).toISOString()
    }
  ];

  // If there's an event, add options relative to event
  if (eventTime) {
    const relativeOptions = [
      {
        label: 'Au moment de l\'événement',
        time: eventTime
      },
      {
        label: '15 minutes avant',
        time: addMinutes(eventDate, -15).toISOString()
      },
      {
        label: '30 minutes avant',
        time: addMinutes(eventDate, -30).toISOString()
      },
      {
        label: '1 heure avant',
        time: addHours(eventDate, -1).toISOString()
      }
    ];

    // Add "la veille à 18h" option correctly
    const dayBefore = subDays(eventDate, 1);
    dayBefore.setHours(18, 0, 0, 0);
    relativeOptions.push({
      label: 'La veille à 18h',
      time: dayBefore.toISOString()
    });

    quickOptions.unshift(...relativeOptions);
  }

  const handleCustomSelect = () => {
    const reminderDate = new Date(customDate);
    reminderDate.setHours(customHour, customMinute, 0, 0);
    onSelect(reminderDate.toISOString());
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  if (showCustom) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rappel personnalisé
            </h3>

            {/* Date Input */}
            <div className="mb-4">
              <Label className="text-sm font-medium text-gray-700">Date</Label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      onClick={() => setCustomHour(hour)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                        customHour === hour ? 'bg-orange-100 text-orange-700' : ''
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
                      onClick={() => setCustomMinute(minute)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                        customMinute === minute ? 'bg-orange-100 text-orange-700' : ''
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
              <Button variant="outline" onClick={() => setShowCustom(false)}>
                Retour
              </Button>
              <Button
                onClick={handleCustomSelect}
                disabled={!customDate}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Check className="h-4 w-4 mr-2" />
                Définir
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Quand voulez-vous être rappelé ?
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Options */}
          <div className="space-y-2 mb-4">
            {quickOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => onSelect(option.time)}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">
                  {format(new Date(option.time), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </div>
              </button>
            ))}
          </div>

          {/* Custom Option */}
          <button
            onClick={() => setShowCustom(true)}
            className="w-full text-left px-4 py-3 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
          >
            <div className="font-medium text-orange-900">Personnalisé...</div>
            <div className="text-sm text-orange-700">Choisir une date et heure spécifiques</div>
          </button>

          {/* Cancel */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} className="w-full">
              Annuler
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}