import React, { useState } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNotesStore } from '../hooks/useNotesStore';
import { Button } from './ui/button';
import EventModal from './EventModal';

export default function CalendarView() {
  const { items, selectedDate, setSelectedDate } = useNotesStore();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayForAdd, setSelectedDayForAdd] = useState<Date | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeekStart);
    day.setDate(day.getDate() + i);
    return day;
  });

  const getEventsForDay = (day: Date) => {
    return items.filter(item => 
      item.eventTime && isSameDay(parseISO(item.eventTime), day)
    );
  };

  const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

  const handleAddEvent = (day: Date) => {
    setSelectedDayForAdd(day);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={handlePrevWeek}><ChevronLeft /></Button>
        <h2 className="text-lg font-semibold capitalize">
          {format(currentWeekStart, 'MMMM yyyy', { locale: fr })}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextWeek}><ChevronRight /></Button>
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1">
        {weekDays.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "border rounded-lg p-2 flex flex-col gap-1 relative min-h-[100px]",
                isToday ? "border-orange-400 bg-orange-50/50" : "border-gray-200"
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={cn("text-sm font-medium", isToday && "text-orange-600")}>
                  {format(day, 'EEE d', { locale: fr })}
                </span>
                <button 
                  onClick={() => handleAddEvent(day)}
                  className="h-5 w-5 flex items-center justify-center rounded-full bg-gray-100 hover:bg-orange-100 text-gray-500 hover:text-orange-600"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    className={cn(
                      "text-[10px] p-1 rounded truncate border-l-2",
                      event.type === 'reminder' ? "bg-orange-100 border-orange-400 text-orange-800" : "bg-blue-100 border-blue-400 text-blue-800",
                      event.isCompleted && "opacity-50 line-through"
                    )}
                  >
                    {format(parseISO(event.eventTime!), 'HH:mm')} {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedDayForAdd && (
        <EventModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setSelectedDayForAdd(null); }} 
          initialDate={selectedDayForAdd}
        />
      )}
    </div>
  );
}