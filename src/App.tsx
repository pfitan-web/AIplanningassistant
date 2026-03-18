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

  // Gestion des événements globaux pour ouvrir les fenêtres surgissantes (Modals)
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

  // Sélection de la vue à afficher
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
    // h-[100dvh] est crucial pour que l'app occupe tout l'écran de l'iPhone sans glisser sous la barre Safari
    <div className="h-[100dvh] w-full flex bg-gray-50 overflow-hidden">
      
      {/* SIDEBAR : Cachée sur mobile (hidden), affichée sur tablette/PC (md:flex) */}
      <aside className="hidden md:flex md:w-64 flex-col border-r bg-white flex-shrink-0">
        <Sidebar />
      </aside>
      
      {/* ZONE PRINCIPALE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header />
        
        {/* Zone de contenu qui défile */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4">
          <div className="max-w-full mx-auto h-full">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* MODALS (Fenêtres de création) */}
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
        <NoteModal onClose={() => setShowNoteModal(false)} />
      )}
    </div>
  );
}

// Composant racine avec le Store
export default function App() {
  return (
    <NotesStoreProvider>
      <AppContent />
    </NotesStoreProvider>
  );
}