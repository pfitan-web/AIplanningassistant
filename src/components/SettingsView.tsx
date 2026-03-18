import React, { useState, useEffect } from 'react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  User, Bell, Palette, Globe, Shield, 
  ChevronRight, Save, X, Trash2, Check, Moon, Sun, Monitor
} from 'lucide-react';

export default function SettingsView() {
  const { settings, updateSettings, setItems } = useNotesStore();
  
  const [formData, setFormData] = useState({ ...settings });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

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

  const handleCancel = () => setFormData({ ...settings });

  const handleClearData = () => {
    if (window.confirm("Voulez-vous vraiment supprimer toutes vos données ?")) {
      setItems([]);
      localStorage.removeItem('harmony-storage');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 p-2 sm:p-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
      </div>

      {/* SYSTÈME D'ONGLETS PERSONNALISÉ (Remplace shadcn/ui tabs) */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        {['general', 'appearance', 'account'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* CONTENU : GÉNÉRAL */}
      {activeTab === 'general' && (
        <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-500" /> Notifications
            </CardTitle>
            <p className="text-sm text-gray-500 text-wrap">Gérez vos alertes et rappels système</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">Activer les rappels</span>
              <input 
                type="checkbox" 
                className="h-6 w-6 accent-orange-500"
                checked={formData.notificationsEnabled}
                onChange={(e) => setFormData({...formData, notificationsEnabled: e.target.checked})}
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t">
              <span className="text-sm font-medium">Langue</span>
              <select 
                className="bg-gray-100 border-none text-sm p-2 rounded-lg outline-none"
                value={formData.language || 'fr'}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CONTENU : APPARENCE */}
      {activeTab === 'appearance' && (
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" /> Thème
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', icon: Sun, label: 'Clair' },
                { id: 'dark', icon: Moon, label: 'Sombre' },
                { id: 'system', icon: Monitor, label: 'Auto' }
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setFormData({...formData, theme: theme.id as any})}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    formData.theme === theme.id ? 'border-orange-500 bg-orange-50' : 'border-gray-50 bg-white'
                  }`}
                >
                  <theme.icon className={`h-5 w-5 mb-2 ${formData.theme === theme.id ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className="text-[10px] font-bold">{theme.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CONTENU : COMPTE */}
      {activeTab === 'account' && (
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" /> Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Nom d'utilisateur</label>
              <input 
                type="text" 
                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.userName || ''}
                onChange={(e) => setFormData({...formData, userName: e.target.value})}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleClearData}
              className="w-full text-red-500 border-red-100 hover:bg-red-50 rounded-xl h-12"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Réinitialiser les données
            </Button>
          </CardContent>
        </Card>
      )}

      {/* BARRE DE BOUTONS FLOTTANTE */}
      {(isDirty || isSaved) && (
        <div className="fixed bottom-6 left-4 right-4 flex gap-3 animate-in slide-in-from-bottom-full duration-300 z-50">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1 h-12 bg-white/90 backdrop-blur shadow-xl rounded-2xl border-gray-200"
            disabled={isSaved}
          >
            <X className="mr-2 h-4 w-4" /> Annuler
          </Button>
          
          <Button 
            onClick={handleSave} 
            className={`flex-[2] h-12 font-bold shadow-xl rounded-2xl transition-all ${
              isSaved ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'
            }`}
          >
            {isSaved ? (
              <span className="flex items-center"><Check className="mr-2 h-5 w-5" /> Enregistré</span>
            ) : (
              <span className="flex items-center"><Save className="mr-2 h-5 w-5" /> Enregistrer</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}