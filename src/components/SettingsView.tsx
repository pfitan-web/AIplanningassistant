import React, { useState, useEffect } from 'react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import { 
  User, Bell, Palette, Globe, Shield, HelpCircle, 
  ChevronRight, Save, X, Trash2, Info 
} from 'lucide-react';

export default function SettingsView() {
  const { settings, updateSettings, setItems } = useNotesStore();
  const [formData, setFormData] = useState({ ...settings });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(settings);
    setIsDirty(hasChanged);
  }, [formData, settings]);

  const handleSave = () => {
    updateSettings(formData);
    setIsDirty(false);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const handleCancel = () => setFormData({ ...settings });

  // Composant pour une ligne de menu style iOS
  const MenuRow = ({ icon: Icon, color, title, value, type = "chevron", onChange }: any) => (
    <div className="flex items-center justify-between py-3 px-4 active:bg-gray-100 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-md ${color} text-white`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[15px] font-medium text-gray-800">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {type === "toggle" ? (
          <input 
            type="checkbox" 
            className="h-5 w-5 accent-orange-500" 
            checked={value} 
            onChange={onChange}
          />
        ) : type === "input" ? (
          <input 
            type="text" 
            className="text-right bg-transparent outline-none text-gray-500 text-sm" 
            value={value} 
            onChange={onChange}
          />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-300" />
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7] -m-2 sm:-m-4"> {/* Fond gris clair iOS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* SECTION COMPTE */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <MenuRow 
            icon={User} color="bg-blue-500" title="Nom d'utilisateur" 
            type="input" value={formData.userName} 
            onChange={(e: any) => setFormData({...formData, userName: e.target.value})}
          />
        </div>

        {/* SECTION RÉGLAGES GÉNÉRAUX */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-50">
          <MenuRow 
            icon={Bell} color="bg-red-500" title="Notifications" 
            type="toggle" value={formData.notificationsEnabled}
            onChange={(e: any) => setFormData({...formData, notificationsEnabled: e.target.checked})}
          />
          <MenuRow icon={Palette} color="bg-purple-500" title="Apparence" />
          <MenuRow icon={Globe} color="bg-green-500" title="Langue" />
        </div>

        {/* SECTION SÉCURITÉ & AIDE */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-50">
          <MenuRow icon={Shield} color="bg-gray-400" title="Confidentialité" />
          <MenuRow icon={HelpCircle} color="bg-orange-400" title="Aide & Support" />
          <MenuRow icon={Info} color="bg-blue-400" title="À propos" />
        </div>

        {/* SECTION DANGER */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <button 
            onClick={() => { if(confirm("Tout effacer ?")) setItems([]); }}
            className="w-full flex items-center gap-3 py-3 px-4 text-red-500 active:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-[15px] font-medium">Réinitialiser les données</span>
          </button>
        </div>
      </div>

      {/* BARRE DE BOUTONS (Uniquement si modif) */}
      {isDirty && (
        <div className="p-4 bg-white/80 backdrop-blur-md border-t flex gap-3 animate-in slide-in-from-bottom-full">
          <Button variant="outline" onClick={handleCancel} className="flex-1 h-11 rounded-xl">
            <X className="mr-2 h-4 w-4" /> Annuler
          </Button>
          <Button onClick={handleSave} className="flex-[2] h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold">
            <Save className="mr-2 h-4 w-4" /> Enregistrer
          </Button>
        </div>
      )}
    </div>
  );
}