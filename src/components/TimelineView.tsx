import React, { useState, useRef, useEffect } from 'react';
import { format, setHours, setMinutes, isSameDay, parseISO, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotesStore, Item } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import EventModal from './EventModal';
import NoteModal from './NoteModal';
import { Check, Edit, Trash2, Calendar, Clock, MapPin } from 'lucide-react';

export default function TimelineView() {
  const { items, selectedDate, updateItem, deleteItem } = useNotesStore();
  const [showEventModal, setShowEventModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isSameDay(selectedDate, new Date()) && timelineRef.current) {
      const scrollPosition = new Date().getHours() * 80;
      timelineRef.current.scrollTop = scrollPosition - 150;
    }
  }, [selectedDate]);

  const hours = Array.from({ length: 24 }, (_, i) => setMinutes(setHours(selectedDate, i), 0));
  const dayItems = items.filter(item => item.type !== 'note' && isSameDay(parseISO(item.eventTime || ''), selectedDate));

  const getEventHeight = (item: Item) => {
    const duration = item.endTime ? differenceInMinutes(parseISO(item.endTime), parseISO(item.eventTime!)) : 60;
    return Math.max((duration / 60) * 76, 60);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header Actions - Compact sur mobile */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowEventModal(true)} className="bg-blue-500 text-white text-xs">
            <Calendar className="h-3 w-3 mr-1" /> Événement
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowNoteModal(true)} className="text-xs">
            <Clock className="h-3 w-3 mr-1" /> Note
          </Button>
        </div>
        <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
          {format(currentTime, 'HH:mm')}
        </div>
      </div>

      <div ref={timelineRef} className="flex-1 overflow-y-auto bg-gray-50 relative">
        {/* Ligne rouge "Maintenant" */}
        {isSameDay(selectedDate, new Date()) && (
          <div className="absolute left-16 right-0 z-10 pointer-events-none" style={{ top: `${(currentTime.getHours() * 80) + (currentTime.getMinutes() / 60 * 80)}px` }}>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1 h-px bg-red-500"></div>
            </div>
          </div>
        )}

        {hours.map((hour) => {
          const hourItems = dayItems.filter(item => parseISO(item.eventTime!).getHours() === hour.getHours());
          return (
            <div key={hour.toISOString()} className="flex border-b border-gray-100" style={{ height: '80px' }}>
              <div className="w-16 flex-shrink-0 border-r border-gray-200 p-2 text-right">
                <span className="text-[10px] font-bold text-gray-400">{format(hour, 'HH:mm')}</span>
              </div>
              <div className="flex-1 p-1 space-y-1">
                {hourItems.map(item => (
                  <div key={item.id} className={`p-2 rounded-lg border-l-4 shadow-sm text-xs cursor-pointer ${item.type === 'event' ? 'bg-blue-50 border-blue-400' : 'bg-orange-50 border-orange-400'}`} 
                       style={{ height: `${getEventHeight(item)}px` }}>
                    <div className="font-bold truncate">{item.title}</div>
                    {item.location && <div className="text-[10px] flex items-center text-gray-500"><MapPin className="h-2 w-2 mr-1" /> {item.location}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showEventModal && <EventModal onClose={() => setShowEventModal(false)} />}
      {showNoteModal && <NoteModal onClose={() => setShowNoteModal(false)} />}
    </div>
  );
}