import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Clock, Car, Save, RotateCcw, Check } from 'lucide-react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import AlertManager from './AlertManager';

export default function SettingsView() {
  const { settings, updateSettings, setCurrentView } = useNotesStore();
  const [hasChanges, setHasChanges] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateSettings(tempSettings);
    setHasChanges(false);
    setIsSaved(true);
    
    // Petit délai pour confirmer visuellement l'enregistrement avant de quitter
    setTimeout(() => {
      setIsSaved(false);
      setCurrentView('timeline');
    }, 1500);
    
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const handleReset = () => {
    setTempSettings(settings);
    setHasChanges(false);
  };

  const updateTempSettings = (updates: Partial<typeof tempSettings>) => {
    setTempSettings(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('timeline')}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Paramètres</h1>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && !isSaved && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-gray-600"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaved}
              className={`transition-all ${isSaved ? 'bg-green-600 hover:bg-green-600 text-white' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isSaved ? (
                <><Check className="h-4 w-4 mr-2" /> Enregistré</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Enregistrer</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-6 space-y-6">
        {/* Notifications */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue-500" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="sound" className="text-sm font-medium text-gray-700">
                Son de notification
              </Label>
              <Select
                value={tempSettings.notificationSound}
                onValueChange={(value: any) => updateTempSettings({ notificationSound: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choisir un son" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chime">Carillon</SelectItem>
                  <SelectItem value="bell">Cloche</SelectItem>
                  <SelectItem value="none">Silencieux</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="banner" className="text-sm font-medium text-gray-700">
                Visibilité du bandeau
              </Label>
              <Select
                value={tempSettings.bannerVisibility}
                onValueChange={(value: any) => updateTempSettings({ bannerVisibility: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Toujours visible</SelectItem>
                  <SelectItem value="when-active">Quand l'app est active</SelectItem>
                  <SelectItem value="never">Jamais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Snooze automatique
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Reprogrammer automatiquement les rappels ignorés
                </p>
              </div>
              <Switch
                checked={tempSettings.autoSnooze}
                onCheckedChange={(checked) => updateTempSettings({ autoSnooze: checked })}
              />
            </div>
          </div>
        </div>

        {/* Temps de trajet */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Car className="h-5 w-5 mr-2 text-green-500" />
            Temps de trajet par défaut
          </h2>
          
          <div>
            <Label htmlFor="travel-time" className="text-sm font-medium text-gray-700">
              Durée par défaut (minutes)
            </Label>
            <Input
              id="travel-time"
              type="number"
              min="5"
              max="120"
              value={tempSettings.defaultTravelTime}
              onChange={(e) => updateTempSettings({ defaultTravelTime: parseInt(e.target.value) || 15 })}
              className="mt-1 w-32"
            />
          </div>
        </div>

        {/* Rappels par défaut */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-orange-500" />
            Rappels par défaut
          </h2>
          
          <AlertManager
            alerts={tempSettings.defaultAlerts}
            onChange={(alerts) => updateTempSettings({ defaultAlerts: alerts })}
          />
        </div>

        {/* À propos */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">À propos</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Harmony Notes</strong> v1.0.0</p>
            <p>Une expérience unifiée pour vos notes, rappels et calendrier</p>
          </div>
        </div>
      </div>
    </div>
  );
}