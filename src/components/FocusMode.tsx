import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Target, Lightbulb } from 'lucide-react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export default function FocusMode() {
  const { currentFocusItem, setCurrentFocusItem, updateItem, toggleComplete } = useNotesStore();
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 min Pomodoro
  const [showPlan, setShowPlan] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
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

  const handleComplete = () => {
    if (currentFocusItem) {
      toggleComplete(currentFocusItem.id);
      setCurrentFocusItem(null);
    }
  };

  if (!currentFocusItem) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Close Button */}
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCurrentFocusItem(null)}
            className="text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Main Task Display */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
            <Target className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            {currentFocusItem.title}
          </h1>
          
          <p className="text-slate-400 text-lg">
            Je suis le plan.
          </p>

          {/* Timer */}
          <div className="text-8xl font-mono font-bold text-orange-400 my-8">
            {formatTime(timeLeft)}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => setIsActive(!isActive)}
              className="bg-white text-slate-900 hover:bg-slate-200 h-14 px-8 text-lg"
            >
              {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
              {isActive ? "Pause" : "Commencer"}
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              onClick={() => setTimeLeft(25 * 60)}
              className="border-slate-600 text-white hover:bg-slate-800 h-14 px-6"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* If-Then Plan Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <button 
              onClick={() => setShowPlan(!showPlan)}
              className="flex items-center gap-2 text-orange-400 font-semibold mb-4 hover:text-orange-300"
            >
              <Lightbulb className="h-5 w-5" />
              Mon Plan Si-Alors
            </button>
            
            {showPlan ? (
              <div className="space-y-4">
                <p className="text-slate-300 text-sm">
                  Anticipez les distractions. Que ferez-vous si...
                </p>
                <textarea
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Ex: SI je reçois une notification, ALORS je jette un coup d'œil après la session."
                  value={currentFocusItem.ifThenRule || ''}
                  onChange={(e) => updateItem(currentFocusItem.id, { ifThenRule: e.target.value })}
                />
              </div>
            ) : (
              <p className="text-slate-500 italic">
                {currentFocusItem.ifThenRule || "Aucun plan défini. Cliquez pour en ajouter un."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Complete Button */}
        <Button 
          onClick={handleComplete}
          className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg"
        >
          Tâche Terminée
        </Button>
      </div>
    </div>
  );
}