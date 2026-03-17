import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface DateTimePickerProps {
  onSelect: (date: Date) => void;
  onCancel: () => void;
}

export default function DateTimePicker({ onSelect, onCancel }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleConfirm = () => {
    const date = new Date(selectedDate);
    date.setHours(selectedHour, selectedMinute, 0, 0);
    onSelect(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold">Définir un rappel</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Date Picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-400 focus:outline-none"
            />
          </div>

          {/* Time Picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
            <div className="flex items-center gap-2">
              {/* Hour Wheel */}
              <div className="flex-1 h-32 overflow-y-auto border border-gray-300 rounded-lg">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => setSelectedHour(hour)}
                    className={`w-full py-2 text-center hover:bg-orange-50 ${
                      selectedHour === hour ? 'bg-orange-100 text-orange-600 font-semibold' : ''
                    }`}
                  >
                    {hour.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>

              <span className="text-2xl font-bold text-gray-400">:</span>

              {/* Minute Wheel */}
              <div className="flex-1 h-32 overflow-y-auto border border-gray-300 rounded-lg">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    onClick={() => setSelectedMinute(minute)}
                    className={`w-full py-2 text-center hover:bg-orange-50 ${
                      selectedMinute === minute ? 'bg-orange-100 text-orange-600 font-semibold' : ''
                    }`}
                  >
                    {minute.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-orange-400 hover:bg-orange-500"
            >
              Définir le rappel
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}