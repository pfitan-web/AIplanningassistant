import React, { useState, useEffect } from 'react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  User, Bell, Clock, Eye, Palette, 
  Trash2, Save, X, Check, RefreshCcw, BellRing
} from 'lucide-react';

export default function SettingsView() {
  const { settings, updateSettings, setItems } = useNotesStore();
  
  // État local pour le formulaire
  const [formData, setFormData] = useState({ ...settings });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Couleurs d'accentuation (pour le sélecteur à ronds)
  const accentColors = [
    { id: 'orange', class: 'bg-orange-500' },
    { id: 'blue', class: 'bg-blue-500' },
    { id: 'purple', class: 'bg-purple-500' },
    { id: 'green', class: 'bg-green-500' },
    { id: 'red', class: 'bg-red-500' },
  ];

  // Détecter si une modification a été faite
  useEffect(() => {
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(settings);
    setIsDirty(hasChanged);
  }, [formData, settings]);

  const handleSave = () => {
    updateSettings(formData);
    setIsDirty(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const handleCancel = () => {
    setFormData({ ...settings });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-32 p-4">
      
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-white pb-2">
          <CardTitle className="text-xl font-bold">Configuration de l'Assistant</CardTitle>
          <p className="text-sm text-gray-500">Paramètres de l'interface et des rappels</p>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          
          {/* SECTION : UTILISATEUR */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" /> Nom d'utilisateur
            </label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              value={formData.userName || ''}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
            />
          </div>

          <hr className="border-gray-100" />

          {/* SECTION : RAPPELS PAR DÉFAUT */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" /> Rappels par défaut
            </h4>
            
            <div className="flex items-center justify-between py-1">
              <span className="text-sm">Activer les rappels</span>
              <input 
                type="checkbox" 
                className="h-6 w-6 accent-orange-500"
                checked={formData.notificationsEnabled}
                onChange={(e) => setFormData({...formData, notificationsEnabled: e.target.checked})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Temps de rappel (min)</label>
                <input 
                  type="number" 
                  className="w-full p-2 bg-gray-50 rounded-lg border-none outline-none"
                  value={formData.defaultReminderTime || 5}
                  onChange={(e) => setFormData({...formData, defaultReminderTime: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Nombre de rappels</label>
                <input 
                  type="number" 
                  className="w-full p-2 bg-gray-50 rounded-lg border-none outline-none"
                  value={formData.reminderCount || 3}
                  onChange={(e) => setFormData({...formData, reminderCount: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* SECTION : SNOOZE AUTOMATIQUE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4 text-green-500" /> Snooze automatique
                </label>
                <p className="text-xs text-gray-500">Reprogrammer les rappels ignorés</p>
              </div>
              <input 
                type="checkbox" 
                className="h-6 w-6 accent-orange-500"
                checked={formData.autoSnooze}
                onChange={(e) => setFormData({...formData, autoSnooze: e.target.checked})}
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* SECTION : NOTIFICATIONS */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <BellRing className="h-4 w-4 text-red-500" /> Notifications
            </label>
            <select 
              className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none appearance-none"
              value={formData.notificationSound || 'cloche'}
              onChange={(e) => setFormData({...formData, notificationSound: e.target.value})}
            >
              <option value="cloche">Carillon cloche</option>
              <option value="silencieux">Silencieux</option>
            </select>
          </div>

          <hr className="border-gray-100" />

          {/* SECTION : VISIBILITÉ DU BANDEAU */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" /> Visibilité du bandeau
            </label>
            <select 
              className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none appearance-none"
              value={formData.bannerVisibility || 'active'}
              onChange={(e) => setFormData({...formData, bannerVisibility: e.target.value})}
            >
              <option value="always">Toujours visible</option>
              <option value="active">Quand l'app est active</option>
              <option value="never">Jamais</option>
            </select>
          </div>

          <hr className="border-gray-100" />

          {/* SECTION : COULEUR D'ACCENTUATION */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Palette className="h-4 w-4 text-pink-500" /> Couleur d'accentuation
            </label>
            <div className="flex justify-between items-center px-2">
              {accentColors.map((color) => (
                <button
                  key={color.id}
                  className={`h-9 w-9 rounded-full border-4 transition-all ${color.class} ${
                    formData.accentColor === color.id ? 'border-gray-200 scale-110 shadow-md' : 'border-transparent opacity-70'
                  }`}
                  onClick={() => setFormData({...formData, accentColor: color.id})}
                />
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* SECTION : DONNÉES */}
          <div className="pt-2">
            <button 
              onClick={() => { if(confirm("Supprimer toutes les données ?")) setItems([]); }}
              className="w-full flex items-center justify-center gap-2 p-3 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors font-medium"
            >
              <Trash2 className="h-4 w-4" /> Réinitialiser les données
            </button>
          </div>
        </CardContent>
      </Card>

      {/* BARRE DE BOUTONS FLOTTANTE (Apparaît si modif ou succès) */}
      {(isDirty || isSaved) && (
        <div className="fixed bottom-6 left-4 right-4 flex gap-3 animate-in slide-in-from-bottom-full duration-300 z-50">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1 h-14 bg-white/90 backdrop-blur shadow-2xl rounded-2xl border-gray-200 text-gray-700"
            disabled={isSaved}
          >
            <X className="mr-2 h-4 w-4" /> Annuler
          </Button>
          
          <Button 
            onClick={handleSave} 
            className={`flex-[2] h-14 font-bold shadow-2xl rounded-2xl transition-all ${
              isSaved ? 'bg-green-600 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isSaved ? (
              <span className="flex items-center"><Check className="mr-2 h-5 w-5" /> Changements enregistrés</span>
            ) : (
              <span className="flex items-center"><Save className="mr-2 h-5 w-5" /> Enregistrer</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}