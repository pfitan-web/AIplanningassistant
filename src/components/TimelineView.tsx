import React, { useState, useRef, useEffect } from 'react';
import { format, setHours, setMinutes, addMinutes, isSameDay, parseISO, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotesStore, Item } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import EventModal from './EventModal';
import NoteModal from './NoteModal';
import { Check, Edit, Trash2, Calendar, Clock, AlertCircle, MapPin, Car, RefreshCw } from 'lucide-react';

export default function TimelineView() {
  const { items, selectedDate, addItem, updateItem, deleteItem } = useNotesStore();
  const [showEventModal, setShowEventModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to current time
  useEffect(() => {
    if (isSameDay(selectedDate, new Date()) && timelineRef.current) {
      const currentHour = new Date().getHours();
      const scrollPosition = currentHour * 80; // 80px per hour
      timelineRef.current.scrollTop = scrollPosition - 200; // Offset for better visibility
    }
  }, [selectedDate]);

  // Generate all hours from 00:00 to 23:00
  const hours = Array.from({ length: 24 }, (_, i) => {
    return setMinutes(setHours(selectedDate, i), 0);
  });

  // Filter and sort items for selected date
  const dayItems = items
    .filter(item => {
      if (item.type === 'note') return false;
      const itemDate = parseISO(item.eventTime || item.reminderTime || '');
      return isSameDay(itemDate, selectedDate);
    })
    .sort((a, b) => {
      const timeA = parseISO(a.eventTime || a.reminderTime || '');
      const timeB = parseISO(b.eventTime || b.reminderTime || '');
      return timeA.getTime() - timeB.getTime();
    });

  const getItemsForHour = (hour: number) => {
    return dayItems.filter(item => {
      const itemTime = parseISO(item.eventTime || item.reminderTime || '');
      return itemTime.getHours() === hour;
    });
  };

  const getEventDuration = (item: Item) => {
    if (!item.endTime) return 60; // Default 1 hour
    const startTime = parseISO(item.eventTime!);
    const endTime = parseISO(item.endTime);
    return differenceInMinutes(endTime, startTime);
  };

  const getEventPosition = (item: Item) => {
    const startTime = parseISO(item.eventTime!);
    const hour = startTime.getHours();
    const minute = startTime.getMinutes();
    return (hour * 60 + minute) / 60; // Position in hours
  };

  const getEventHeight = (item: Item) => {
    const duration = getEventDuration(item);
    return (duration / 60) * 80; // 80px per hour
  };

  const handleComplete = (id: string) => {
    updateItem(id, { isCompleted: true });
  };

  const handleEdit = (item: Item) => {
    if (item.type === 'event') {
      setShowEventModal(true);
    } else {
      setShowNoteModal(true);
    }
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
  };

  const isCurrentTime = (hour: number) => {
    const now = new Date();
    return isSameDay(selectedDate, now) && now.getHours() === hour;
  };

  const getCurrentMinutePosition = () => {
    const now = new Date();
    if (!isSameDay(selectedDate, now)) return 0;
    return (now.getMinutes() / 60) * 80; // 80px per hour
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header with quick actions */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowEventModal(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Nouvel événement
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowNoteModal(true)}
            >
              <Clock className="h-4 w-4 mr-2" />
              Note rapide
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{format(currentTime, 'HH:mm')}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div 
        ref={timelineRef}
        className="flex-1 overflow-auto bg-gray-50"
        style={{ height: 'calc(100vh - 140px)' }}
      >
        <div className="relative">
          {/* Current time line */}
          {isSameDay(selectedDate, new Date()) && (
            <div
              className="absolute left-20 right-0 z-10 pointer-events-none"
              style={{ top: `${getCurrentMinutePosition() + 40}px` }}
            >
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="flex-1 h-0.5 bg-red-500"></div>
              </div>
            </div>
          )}

          {/* Time slots and events */}
          <div className="relative">
            {hours.map((hour, index) => {
              const hourItems = getItemsForHour(hour.getHours());
              const isCurrentHour = isCurrentTime(hour.getHours());
              
              return (
                <div
                  key={hour.toISOString()}
                  className={`flex border-b border-gray-200 ${
                    isCurrentHour ? 'bg-orange-50' : 'bg-white'
                  }`}
                  style={{ height: '80px' }}
                >
                  {/* Time label */}
                  <div className="w-20 flex-shrink-0 border-r border-gray-200 py-2 px-3">
                    <div className={`text-sm font-medium ${
                      isCurrentHour ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      {format(hour, 'HH:mm')}
                    </div>
                  </div>

                  {/* Events container */}
                  <div className="flex-1 relative py-1 px-2">
                    {hourItems.length === 0 ? (
                      <div className="h-full flex items-center">
                        <button
                          onClick={() => {
                            const eventTime = setMinutes(setHours(selectedDate, hour.getHours()), 0);
                            const customEvent = new CustomEvent('openEventModalWithTime', { 
                              detail: { time: eventTime } 
                            });
                            window.dispatchEvent(customEvent);
                          }}
                          className="w-full h-6 border-2 border-dashed border-gray-300 rounded hover:border-gray-400 hover:bg-gray-50 transition-colors"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {hourItems.map((item, itemIndex) => {
                          const duration = getEventDuration(item);
                          const height = Math.min((duration / 60) * 76, 76); // Max height for the slot
                          
                          return (
                            <div
                              key={item.id}
                              className={`group relative rounded-lg border-2 p-3 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                item.isCompleted
                                  ? 'bg-gray-100 border-gray-300 opacity-60'
                                  : item.type === 'event'
                                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 hover:border-blue-400'
                                  : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300 hover:border-orange-400'
                              }`}
                              style={{ 
                                height: `${height}px`,
                                minHeight: '60px'
                              }}
                              onClick={() => handleEdit(item)}
                            >
                              {/* Action buttons */}
                              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                {!item.isCompleted && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleComplete(item.id);
                                    }}
                                    className="h-6 w-6 p-0 bg-white/80 hover:bg-white text-green-600"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(item);
                                  }}
                                  className="h-6 w-6 p-0 bg-white/80 hover:bg-white text-blue-600"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item.id);
                                  }}
                                  className="h-6 w-6 p-0 bg-white/80 hover:bg-white text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Event content */}
                              <div className="pr-16 h-full flex flex-col justify-between">
                                <div>
                                  <h4 className={`font-semibold text-sm ${
                                    item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                                  }`}>
                                    {item.title}
                                  </h4>
                                  
                                  {item.content && (
                                    <p className={`text-xs mt-1 line-clamp-2 ${
                                      item.isCompleted ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                      {item.content}
                                    </p>
                                  )}
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center space-x-2 mt-1">
                                  {item.location && (
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {item.location}
                                    </span>
                                  )}
                                  
                                  {item.travelTime?.enabled && (
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <Car className="h-3 w-3 mr-1" />
                                      {item.travelTime.duration}min
                                    </span>
                                  )}

                                  {item.alerts && item.alerts.length > 0 && (
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      {item.alerts.length}
                                    </span>
                                  )}

                                  {item.recurrence && item.recurrence !== 'none' && (
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <RefreshCw className="h-3 w-3 mr-1" />
                                    </span>
                                  )}

                                  {item.endTime && (
                                    <span className="text-xs text-gray-500">
                                      {format(parseISO(item.endTime), 'HH:mm')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEventModal && (
        <EventModal onClose={() => setShowEventModal(false)} />
      )}
      
      {showNoteModal && (
        <NoteModal onClose={() => setShowNoteModal(false)} />
      )}
    </div>
  );
}