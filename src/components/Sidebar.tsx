import React from 'react';
import { Calendar, FileText, Clock, Settings, Plus, Home } from 'lucide-react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';

export default function Sidebar() {
  const { currentView, setCurrentView, items, selectedDate } = useNotesStore();

  const getNotificationCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return items.filter(item => {
      if (item.type === 'reminder' && !item.isCompleted) {
        const reminderDate = new Date(item.reminderTime!);
        return reminderDate >= today && reminderDate < tomorrow;
      }
      return false;
    }).length;
  };

  const getTodayEventsCount = () => {
    return items.filter(item => {
      if (item.type === 'event' && !item.isCompleted) {
        const eventDate = new Date(item.eventTime!);
        return eventDate.toDateString() === selectedDate.toDateString();
      }
      return false;
    }).length;
  };

  const getNotesCount = () => {
    return items.filter(item => item.type === 'note').length;
  };

  const menuItems = [
    {
      id: 'timeline',
      label: 'Aujourd\'hui',
      icon: Home,
      count: getTodayEventsCount(),
      color: 'text-orange-600 hover:bg-orange-50',
    },
    {
      id: 'calendar',
      label: 'Calendrier',
      icon: Calendar,
      count: null,
      color: 'text-blue-600 hover:bg-blue-50',
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: FileText,
      count: getNotesCount(),
      color: 'text-green-600 hover:bg-green-50',
    },
    {
      id: 'reminders',
      label: 'Rappels',
      icon: Clock,
      count: getNotificationCount(),
      color: 'text-purple-600 hover:bg-purple-50',
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      count: null,
      color: 'text-gray-600 hover:bg-gray-50',
    },
  ];

  const handleQuickAdd = () => {
    if (currentView === 'timeline' || currentView === 'calendar') {
      // Ouvrir le modal d'événement
      const event = new CustomEvent('openEventModal');
      window.dispatchEvent(event);
    } else if (currentView === 'notes') {
      // Ouvrir le modal de note
      const event = new CustomEvent('openNoteModal');
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Harmony Notes</h2>
        <p className="text-sm text-gray-500 mt-1">Organisez votre journée</p>
      </div>

      {/* Quick Add Button */}
      <div className="p-4">
        <Button
          onClick={handleQuickAdd}
          className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-medium shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          {currentView === 'notes' ? 'Nouvelle note' : 'Nouvel événement'}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 pb-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-500'
                    : `text-gray-700 ${item.color}`
                }`}
              >
                <div className="flex items-center">
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && item.count > 0 && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    isActive ? 'bg-orange-200 text-orange-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div className="flex justify-between mb-1">
            <span>Total des notes</span>
            <span className="font-medium">{getNotesCount()}</span>
          </div>
          <div className="flex justify-between">
            <span>Événements aujourd'hui</span>
            <span className="font-medium">{getTodayEventsCount()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}