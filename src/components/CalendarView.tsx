import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, setHours } from 'date-fns';
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

  const handlePreviousWeek = () => setSelectedDate(subWeeks(selectedDate, 1));
  const handleNextWeek = () => setSelectedDate(addWeeks(selectedDate, 1));

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setShowEventModal(true);
  };

  const getItemsForDay = (day: Date) => {
    return items.filter(item => {
      if (item.type === 'note') return false;
      if (item.recurrence && item.recurrence !== 'none') {
        const instances = generateRecurringInstances(item, weekStart, weekEnd);
        return instances.some(instance => isSameDay(new Date(instance.eventTime!), day));
      }
      return isSameDay(new Date(item.eventTime || item.reminderTime || ''), day);
    }).sort((a, b) => new Date(a.eventTime || '').getTime() - new Date(b.eventTime || '').getTime());
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Navigation - Adaptée Mobile */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 px-2">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePreviousWeek}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek}><ChevronRight className="h-4 w-4" /></Button>
          <h2 className="text-sm sm:text-lg font-semibold text-gray-900">
            {format(weekStart, 'd MMM', { locale: fr })} - {format(weekEnd, 'd MMM yyyy', { locale: fr })}
          </h2>
        </div>
        <Button onClick={() => { setSelectedDay(selectedDate); setShowEventModal(true); }} className="w-full sm:w-auto bg-blue-500 text-white">
          <Plus className="h-4 w-4 mr-2" /> Événement
        </Button>
      </div>

      {/* CONTENEUR DE SCROLL HORIZONTAL */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden border rounded-xl bg-white shadow-sm custom-scrollbar">
        <div className="min-w-[800px] flex flex-col h-full">
          {/* Header Jours */}
          <div className="grid grid-cols-8 bg-gray-50 border-b sticky top-0 z-20">
            <div className="p-3 text-xs font-medium text-gray-500 text-center">Heure</div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className={`p-3 text-center border-l ${isSameDay(day, new Date()) ? 'bg-orange-50' : ''}`}>
                <div className="text-xs font-medium text-gray-600 uppercase">{format(day, 'EEE', { locale: fr })}</div>
                <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-orange-600' : 'text-gray-900'}`}>{format(day, 'd')}</div>
              </div>
            ))}
          </div>

          {/* Grille Heures - Scroll Vertical Interne */}
          <div className="flex-1 overflow-y-auto">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-50">
                <div className="p-2 text-xs text-gray-400 text-right border-r bg-gray-50/50">
                  {format(setHours(new Date(), hour), 'HH:mm')}
                </div>
                {weekDays.map((day) => {
                  const hourItems = getItemsForDay(day).filter(item => new Date(item.eventTime || '').getHours() === hour);
                  return (
                    <div key={day.toISOString()} className="border-l border-gray-100 p-1 min-h-[60px] hover:bg-gray-50/50" onClick={() => handleDayClick(day)}>
                      {hourItems.map((item) => (
                        <div key={item.id} className={`text-[10px] p-1 mb-1 rounded truncate leading-tight ${item.type === 'event' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
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

      {showEventModal && <EventModal onClose={() => setShowEventModal(false)} selectedDate={selectedDay || selectedDate} />}
    </div>
  );
}