import React, { useState, useEffect } from 'react';
import { NotesStoreProvider, useNotesStore } from './hooks/useNotesStoreProvider';
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
  const { currentView } = useNotesStore();
  const [showEventModal, setShowEventModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

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

  // Cette fonction détermine quel écran afficher
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
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar gauche */}
      <Sidebar />
      
      {/* Zone de droite (Header + Contenu variable) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        {/* C'est ICI qu'on affiche le contenu qui avait disparu */}
        <main className="flex-1 overflow-y-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Modals de création */}
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

// Composant racine avec le Provider
export default function App() {
  return (
    <NotesStoreProvider>
      <AppContent />
    </NotesStoreProvider>
  );
}