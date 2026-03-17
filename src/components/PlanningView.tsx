import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, ArrowRight, Coffee, BrainCircuit } from 'lucide-react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function PlanningView() {
  const { getBacklogItems, getTodayTasks, moveToToday, setCurrentView, settings } = useNotesStore();
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [selectedForToday, setSelectedForToday] = useState<Set<string>>(new Set());
  
  const backlog = getBacklogItems();
  const todayTasks = getTodayTasks();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedForToday);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      if (newSelection.size >= 5) return; // Limit to 5 tasks
      newSelection.add(id);
    }
    setSelectedForToday(newSelection);
  };

  const commitToToday = () => {
    selectedForToday.forEach(id => moveToToday(id));
    setSelectedForToday(new Set());
    setCurrentView('timeline');
  };

  const startPlanning = () => {
    setIsActive(true);
    setTimeLeft(600);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header & Timer */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-orange-900 flex items-center gap-2">
                <Coffee className="h-6 w-6" />
                Rituel de Planification
              </CardTitle>
              <CardDescription className="text-orange-700 mt-2">
                Prenez 10 bonnes minutes (600 secondes) pour organiser votre journée.
                Installez-vous dans un endroit calme.
              </CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-mono font-bold ${isActive ? 'text-orange-600' : 'text-orange-400'}`}>
                {formatTime(timeLeft)}
              </div>
              <Button 
                onClick={isActive ? () => setIsActive(false) : startPlanning}
                variant={isActive ? "outline" : "default"}
                className="mt-2 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isActive ? "Pause" : "Commencer les 10 min"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Backlog Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            Répertoire (1-6 semaines)
          </h3>
          <div className="space-y-2">
            {backlog.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Votre répertoire est vide. Ajoutez des tâches pour les prochaines semaines.</p>
            ) : (
              backlog.map((item) => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedForToday.has(item.id) ? 'ring-2 ring-orange-400 bg-orange-50' : ''
                  }`}
                  onClick={() => toggleSelection(item.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center ${
                        selectedForToday.has(item.id) ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300'
                      }`}>
                        {selectedForToday.has(item.id) && <CheckCircle className="h-3 w-3" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        {item.content && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.content}</p>}
                        <div className="flex gap-2 mt-2">
                          {item.priority === 'high' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Haute</span>}
                          {item.priority === 'medium' && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Moyenne</span>}
                          {item.priority === 'low' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Basse</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Today Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Liste du Jour ({todayTasks.length + selectedForToday.size} / 5)
          </h3>
          <div className="space-y-2">
            {todayTasks.map((item) => (
              <Card key={item.id} className="bg-blue-50 border-blue-100">
                <CardContent className="p-4">
                  <p className="font-medium text-blue-900">{item.title}</p>
                  <p className="text-xs text-blue-600 mt-1">Déjà planifié</p>
                </CardContent>
              </Card>
            ))}
            
            {Array.from(selectedForToday).map(id => {
              const item = backlog.find(i => i.id === id);
              return item ? (
                <Card key={id} className="bg-orange-50 border-orange-200 border-dashed">
                  <CardContent className="p-4">
                    <p className="font-medium text-orange-900">{item.title}</p>
                    <p className="text-xs text-orange-600 mt-1">Sélectionné pour aujourd'hui</p>
                  </CardContent>
                </Card>
              ) : null;
            })}
          </div>

          {selectedForToday.size > 0 && (
            <Button 
              onClick={commitToToday} 
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
            >
              Valider ma journée <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}