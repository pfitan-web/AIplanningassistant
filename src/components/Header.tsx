import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, FileText, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';

export default function Header() {
  const { currentView, setCurrentView, selectedDate, setSelectedDate } = useNotesStore();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 flex-shrink-0 z-30">
      {/* Date à gauche - On la rend plus petite sur mobile */}
      <div className="flex flex-col">
        <h1 className="text-sm sm:text-lg font-bold text-gray-900 capitalize">
          {format(selectedDate, 'MMMM yyyy', { locale: fr })}
        </h1>
        <p className="text-[10px] sm:text-xs text-gray-500">
          {format(selectedDate, 'EEEE d', { locale: fr })}
        </p>
      </div>

      {/* Navigation Centrale - Les 4 icônes avec petits labels */}
      <nav className="flex items-center bg-gray-100 rounded-lg p-1 scale-90 sm:scale-100">
        <Button
          variant={currentView === 'timeline' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('timeline')}
          className="flex flex-col items-center px-2 py-0 h-10 w-12 sm:w-20"
        >
          <Clock className="h-4 w-4" />
          <span className="text-[9px] sm:text-xs mt-0.5">Jour</span>
        </Button>

        <Button
          variant={currentView === 'calendar' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('calendar')}
          className="flex flex-col items-center px-2 py-0 h-10 w-12 sm:w-20"
        >
          <Calendar className="h-4 w-4" />
          <span className="text-[9px] sm:text-xs mt-0.5">Semaine</span>
        </Button>

        <Button
          variant={currentView === 'notes' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('notes')}
          className="flex flex-col items-center px-2 py-0 h-10 w-12 sm:w-20"
        >
          <FileText className="h-4 w-4" />
          <span className="text-[9px] sm:text-xs mt-0.5">Notes</span>
        </Button>

        {/* NOUVEAU : Bouton Paramètres accessible sur mobile */}
        <Button
          variant={currentView === 'settings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('settings')}
          className="flex flex-col items-center px-2 py-0 h-10 w-12 sm:w-20"
        >
          <Settings className="h-4 w-4" />
          <span className="text-[9px] sm:text-xs mt-0.5">Réglages</span>
        </Button>
      </nav>

      {/* Boutons Suivant/Précédent à droite - Cachés sur très petits écrans pour gagner de la place */}
      <div className="hidden xs:flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}