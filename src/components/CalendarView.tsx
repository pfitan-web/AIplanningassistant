import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import EventModal from './EventModal';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function CalendarView() {
  const { selectedDate, setSelectedDate, items, generateRecurringInstances } = useNotesStore();
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handlePreviousWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  const handleNextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setShowEventModal(true);
  };

  const getItemsForDay = (day: Date) => {
    const dayItems = items.filter(item => {
      if (item.type === 'note') return false;
      
      // Handle recurring events
      if (item.recurrence && item.recurrence !== 'none') {
        const instances = generateRecurringInstances(item, weekStart, weekEnd);
        return instances.some(instance => {
          const instanceDate = new Date(instance.eventTime!);
          return isSameDay(instanceDate, day);
        });
      }
      
      const itemDate = new Date(item.eventTime || item.reminderTime || '');
      return isSameDay(itemDate, day);
    });

    return dayItems.sort((a, b) => {
      const timeA = new Date(a.eventTime || a.reminderTime || '');
      const timeB = new Date(b.eventTime || b.reminderTime || '');
      return timeA.getTime() - timeB.getTime();
    });
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <h2 className="text-lg font-semibold text-gray-900">
            Semaine du {format(weekStart, 'd MMMM', { locale: fr })} au {format(weekEnd, 'd MMMM yyyy', { locale: fr })}
          </h2>

          <Button
            onClick={() => {
              setSelectedDay(selectedDate);
              setShowEventModal(true);
            }}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Événement
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
            <div className="p-3 text-sm font-medium text-gray-700 text-center">
              Heure
            </div>
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`p-3 text-center border-l border-gray-200 ${
                  isSameDay(day, new Date())
                    ? 'bg-orange-50'
                    : ''
                }`}
              >
                <div className="text-sm font-medium text-gray-900">
                  {format(day, 'EEEE', { locale: fr })}
                </div>
                <div className={`text-lg font-semibold ${
                  isSameDay(day, new Date())
                    ? 'text-orange-600'
                    : 'text-gray-700'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="max-h-[600px] overflow-y-auto">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
                {/* Time Column */}
                <div className="p-2 text-sm text-gray-500 text-right border-r border-gray-200">
                  {format(setHours(new Date(), hour), 'HH:mm')}
                </div>

                {/* Day Columns */}
                {weekDays.map((day) => {
                  const dayItems = getItemsForDay(day);
                  const hourItems = dayItems.filter(item => {
                    const itemTime = new Date(item.eventTime || item.reminderTime || '');
                    return itemTime.getHours() === hour;
                  });

                  return (
                    <div
                      key={day.toISOString()}
                      className="border-l border-gray-200 p-1 min-h-[60px] cursor-pointer hover:bg-gray-50"
                      onClick={() => handleDayClick(day)}
                    >
                      {hourItems.map((item) => (
                        <div
                          key={item.id}
                          className={`text-xs p-1 mb-1 rounded truncate ${
                            item.type === 'event'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {item.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          onClose={() => setShowEventModal(false)}
          selectedDate={selectedDay || selectedDate}
        />
      )}
    </div>
  );
}