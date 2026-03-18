import React, { useState, useEffect } from 'react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Check, Save, X, Trash2 } from 'lucide-react';

export default function SettingsView() {
  const { settings, updateSettings, setItems } = useNotesStore();
  
  // État local pour le formulaire
  const [formData, setFormData] = useState({ ...settings });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Vérifier si des changements ont été faits par rapport aux réglages originaux
  useEffect(() => {
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(settings);
    setIsDirty(hasChanged);
  }, [formData, settings]);

  const handleSave = () => {
    updateSettings(formData);
    setIsSaved(true);
    setIsDirty(false);
    setTimeout(() => setIsSaved(false), 2000);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const handleCancel = () => {
    setFormData({ ...settings }); // On réinitialise l'état local avec les valeurs du store
  };

  const handleClearData = () => {
    if (window.confirm("Voulez-vous vraiment supprimer toutes vos données ? Cette action est irréversible.")) {
      setItems([]);
      localStorage.removeItem('harmony-storage');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Configuration de l'Assistant</CardTitle>
          <p className="text-sm text-gray-500">Personnalisez votre expérience Harmony</p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Nom d'utilisateur */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <input 
              type="text" 
              className="w-full p-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              value={formData.userName || ''}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
            />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">Notifications</p>
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

          {/* Option : Réinitialisation (que nous gardons comme discuté) */}
          <div className="pt-4">
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-500 border-red-100 hover:bg-red-50"
              onClick={handleClearData}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Réinitialiser toutes les données
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* BARRE DE BOUTONS FLOTTANTE : Apparaît uniquement si modif (isDirty) */}
      {(isDirty || isSaved) && (
        <div className="fixed bottom-6 left-4 right-4 flex gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1 h-12 bg-white border-gray-200 text-gray-700 shadow-lg"
            disabled={isSaved}
          >
            <X className="mr-2 h-4 w-4" /> Annuler
          </Button>
          
          <Button 
            onClick={handleSave} 
            className={`flex-[2] h-12 font-bold shadow-lg transition-all ${
              isSaved ? 'bg-green-600 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isSaved ? (
              <span className="flex items-center justify-center"><Check className="mr-2 h-5 w-5" /> Enregistré !</span>
            ) : (
              <span className="flex items-center justify-center"><Save className="mr-2 h-5 w-5" /> Enregistrer</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}