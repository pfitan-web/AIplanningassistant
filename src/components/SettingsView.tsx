import React, { useState } from 'react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Check, Save } from 'lucide-react';

export default function SettingsView() {
  const { settings, updateSettings } = useNotesStore();
  
  // État local pour le formulaire
  const [formData, setFormData] = useState({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    // Mise à jour du store global
    updateSettings(formData);
    
    // Effet visuel
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    
    // Vibration sur mobile si disponible
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Configuration de l'Assistant</CardTitle>
          {/* Remplacement de CardDescription par une simple balise p */}
          <p className="text-sm text-gray-500">Personnalisez votre expérience Harmony</p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Champ Nom d'utilisateur */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom d'utilisateur</label>
            <input 
              type="text" 
              className="w-full p-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="Votre nom..."
              value={formData.userName || ''}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
            />
          </div>

          {/* Option Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="font-semibold text-gray-900">Notifications</p>
              <p className="text-xs text-gray-500">Activer les rappels système</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formData.notificationsEnabled}
                onChange={(e) => setFormData({...formData, notificationsEnabled: e.target.checked})}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {/* Bouton Enregistrer */}
          <Button 
            onClick={handleSave} 
            className={`w-full h-14 text-lg font-bold transition-all shadow-lg active:scale-95 ${
              isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {isSaved ? (
              <span className="flex items-center"><Check className="mr-2 h-6 w-6" /> Enregistré !</span>
            ) : (
              <span className="flex items-center"><Save className="mr-2 h-6 w-6" /> Enregistrer</span>
            )}
          </Button>

        </CardContent>
      </Card>

      <div className="text-center text-xs text-gray-400 mt-8">
        Harmony Notes v1.0.0 — PWA Mode
      </div>
    </div>
  );
}