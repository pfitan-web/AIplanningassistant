import React, { useState, useEffect } from 'react';
import { NotesStoreProvider } from './hooks/useNotesStoreProvider';
import { useNotesStore } from './hooks/useNotesStoreProvider';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TimelineView from './components/TimelineView';
import CalendarView from './components/CalendarView';
import NotesView from './components/NotesView';
import RemindersView from './components/RemindersView';
import SettingsView from './components/SettingsView';
import EventModal from './components/EventModal';
import NoteModal from './components/NoteModal';

function AppContent() {
  const { currentView, setCurrentView } = useNotesStore();
  const [showEventModal, setShowEventModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  // Écouter les événements personnalisés pour ouvrir les modals
  useEffect(() => {
    const handleOpenEventModal = () => {
      setSelectedTime(null);
      setShowEventModal(true);
    };
    
    const handleOpenEventModalWithTime = (event: any) => {
      setSelectedTime(event.detail.time);
      setShowEventModal(true);
    };
    
    const handleOpenNoteModal = () => setShowNoteModal(true);

    window.addEventListener('openEventModal', handleOpenEventModal);
    window.addEventListener('openEventModalWithTime', handleOpenEventModalWithTime);
    window.addEventListener('openNoteModal', handleOpenNoteModal);

    return () => {
      window.removeEventListener('openEventModal', handleOpenEventModal);
      window.removeEventListener('openEventModalWithTime', handleOpenEventModalWithTime);
      window.removeEventListener('openNoteModal', handleOpenNoteModal);
    };
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'timeline':
        return <TimelineView />;
      case 'calendar':
        return <CalendarView />;
      case 'notes':
        return <NotesView />;
      case 'reminders':
        return <RemindersView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TimelineView />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header currentView={currentView} setCurrentView={setCurrentView} />
        {renderCurrentView()}
      </div>

      {/* Modals */}
      {showEventModal && (
        <EventModal
          onClose={() => {
            setShowEventModal(false);
            setSelectedTime(null);
          }}
          selectedDate={selectedTime}
        />
      )}
      
      {showNoteModal && (
        <NoteModal
          onClose={() => setShowNoteModal(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <NotesStoreProvider>
      <AppContent />
    </NotesStoreProvider>
  );
}

export default App;