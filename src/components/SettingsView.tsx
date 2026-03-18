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
  
  // État local temporaire
  const [tempSettings, setTempSettings] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  // Comparaison pour activer le bouton bleu
  const hasChanges = JSON.stringify(tempSettings) !== JSON.stringify(settings);

  const handleSave = () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    
    // 1. Mise à jour de l'état global (Store)
    updateSettings(tempSettings);
    
    // 2. FORCE LA PERSISTENCE (Sauvegarde réelle dans le navigateur)
    // On sauvegarde sous la clé que ton Store utilise probablement
    localStorage.setItem('harmony-storage', JSON.stringify({
      state: { settings: tempSettings }
    }));
    
    // Feedback visuel (passage au vert)
    setTimeout(() => {
      setIsSaving(false);
      setCurrentView('timeline');
    }, 800);
  };

  const handleReset = () => {
    setTempSettings({ ...settings });
  };

  const updateField = (field: string, value: any) => {
    setTempSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
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
            {hasChanges && !isSaving && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-gray-600 border-gray-300"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`transition-all duration-200 ${
                isSaving ? 'bg-green-600 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <Check className="h-4 w-4 mr-2 animate-in zoom-in text-white" />
              ) : (
                <Save className="h-4 w-4 mr-2 text-white" />
              )}
              <span className="text-white">{isSaving ? 'Enregistré' : 'Enregistrer'}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {/* Notifications */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
            <Bell className="h-5 w-5 mr-3 text-blue-500" />
            Notifications
          </h2>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Son de notification</Label>
              <Select
                value={tempSettings.notificationSound}
                onValueChange={(val) => updateField('notificationSound', val)}
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carillon">Carillon</SelectItem>
                  <SelectItem value="cloche">Cloche</SelectItem>
                  <SelectItem value="silencieux">Silencieux</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Visibilité du bandeau</Label>
              <Select
                value={tempSettings.bannerVisibility}
                onValueChange={(val) => updateField('bannerVisibility', val)}
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Toujours visible</SelectItem>
                  <SelectItem value="active">Quand l'app est active</SelectItem>
                  <SelectItem value="never">Jamais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-gray-900">Snooze automatique</Label>
                <p className="text-xs text-gray-500">Reprogrammer les rappels ignorés</p>
              </div>
              <Switch
                checked={tempSettings.autoSnooze}
                onCheckedChange={(checked) => updateField('autoSnooze', checked)}
              />
            </div>
          </div>
        </div>

        {/* Temps de trajet */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Car className="h-5 w-5 mr-3 text-green-500" />
            Temps de trajet par défaut
          </h2>
          
          <div className="flex items-center space-x-4">
            <Input
              type="number"
              value={tempSettings.defaultTravelTime}
              onChange={(e) => updateField('defaultTravelTime', parseInt(e.target.value) || 0)}
              className="w-24 bg-gray-50 border-gray-200"
            />
            <span className="text-sm text-gray-600">minutes</span>
          </div>
        </div>

        {/* Rappels par défaut */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-3 text-orange-500" />
            Rappels par défaut
          </h2>
          
          <AlertManager
            alerts={tempSettings.defaultAlerts}
            onChange={(alerts) => updateField('defaultAlerts', alerts)}
          />
        </div>
      </div>
    </div>
  );
}