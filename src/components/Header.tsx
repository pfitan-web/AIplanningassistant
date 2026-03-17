import React from 'react';
import { Calendar, FileText, Clock, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// On n'a plus besoin de passer de fonctions par les "props"
export default function Header() {
  const { currentView, setCurrentView, selectedDate, setCurrentFocusItem } = useNotesStore();

  // Cette fonction gère le bouton + en ouvrant le formulaire de création
  const handleAddClick = () => {
    setCurrentFocusItem('new'); 
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white font-bold shadow-sm">
            H
          </div>
          <span className="font-bold text-lg tracking-tight text-orange-900">Harmony</span>
        </div>

        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-full">
          <Button
            variant={currentView === 'timeline' ? 'default' : 'ghost'}
            size="sm"
            className={`rounded-full ${currentView === 'timeline' ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}`}
            onClick={() => setCurrentView('timeline')}
          >
            <Clock className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Aujourd'hui</span>
          </Button>
          
          <Button
            variant={currentView === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            className={`rounded-full ${currentView === 'calendar' ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}`}
            onClick={() => setCurrentView('calendar')}
          >
            <Calendar className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Calendrier</span>
          </Button>

          <Button
            variant={currentView === 'notes' ? 'default' : 'ghost'}
            size="sm"
            className={`rounded-full ${currentView === 'notes' ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}`}
            onClick={() => setCurrentView('notes')}
          >
            <FileText className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Notes</span>
          </Button>
        </div>

        {/* Le bouton + appelle maintenant handleAddClick directement */}
        <Button 
          size="icon" 
          className="rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg transition-transform active:scale-95" 
          onClick={handleAddClick}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {currentView === 'timeline' && (
        <div className="text-center py-2 text-sm text-muted-foreground border-t bg-orange-50/50 capitalize">
          {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
        </div>
      )}
    </header>
  );
}