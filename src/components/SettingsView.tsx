import React, { useState } from 'react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Check, Save } from 'lucide-react';

export default function SettingsView() {
  const { settings, updateSettings, setCurrentView } = useNotesStore();
  
  // État local pour le formulaire
  const [formData, setFormData] = useState({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    // 1. On met à jour le store global (qui sauvegarde dans le localStorage)
    updateSettings(formData);
    
    // 2. Petit effet visuel de succès
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);

    // 3. Optionnel : Rediriger vers l'agenda après enregistrement
    // setCurrentView('timeline'); 
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <Card>
        <CardHeader>
          <CardTitle>Configuration de l'Assistant</CardTitle>
          <CardDescription>Personnalisez votre expérience Harmony</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exemple : Nom de l'utilisateur */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom d'utilisateur</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md"
              value={formData.userName || ''}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
            />
          </div>

          {/* Exemple : Thème ou autre réglage */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-xs text-gray-500">Activer les rappels système</p>
            </div>
            <input 
              type="checkbox" 
              className="h-5 w-5"
              checked={formData.notificationsEnabled}
              onChange={(e) => setFormData({...formData, notificationsEnabled: e.target.checked})}
            />
          </div>

          {/* LE BOUTON ENREGISTRER */}
          <Button 
            onClick={handleSave} 
            className={`w-full h-12 transition-all ${isSaved ? 'bg-green-600' : 'bg-orange-500'}`}
          >
            {isSaved ? (
              <><Check className="mr-2 h-5 w-5" /> Configuration enregistrée !</>
            ) : (
              <><Save className="mr-2 h-5 w-5" /> Enregistrer les modifications</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}