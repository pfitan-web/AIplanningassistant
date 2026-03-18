import React, { useState, useEffect } from 'react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  User, Bell, Palette, Shield, Info, 
  Trash2, Save, X, Check, Moon, Sun, Monitor,
  ChevronRight, Download, Upload, Globe
} from 'lucide-react';

export default function SettingsView() {
  const { settings, updateSettings, setItems } = useNotesStore();
  
  // État local pour le formulaire
  const [formData, setFormData] = useState({ ...settings });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Couleurs d'accentuation (tirées de tes captures)
  const accentColors = [
    { name: 'Orange', class: 'bg-orange-500' },
    { name: 'Blue', class: 'bg-blue-500' },
    { name: 'Purple', class: 'bg-purple-500' },
    { name: 'Green', class: 'bg-green-500' },
    { name: 'Pink', class: 'bg-pink-500' },
  ];

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

  // --- Composants Internes pour le look iOS ---
  const SettingSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-2">
      <h3 className="text-[13px] font-semibold text-gray-500 uppercase ml-4 tracking-wider">{title}</h3>
      <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
        <CardContent className="p-0 divide-y divide-gray-50">
          {children}
        </CardContent>
      </Card>
    </div>
  );

  const SettingRow = ({ icon: Icon, color, title, children, onClick }: any) => (
    <div 
      className="flex items-center justify-between p-4 bg-white active:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color} text-white`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[15px] font-medium text-gray-800">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-32 p-4 animate-in fade-in duration-500">
      
      {/* SECTION : PROFIL */}
      <SettingSection title="Profil">
        <SettingRow icon={User} color="bg-blue-500" title="Nom d'utilisateur">
          <input 
            type="text" 
            className="text-right bg-transparent outline-none text-gray-500 font-normal"
            value={formData.userName || ''}
            onChange={(e) => setFormData({...formData, userName: e.target.value})}
          />
        </SettingRow>
        <SettingRow icon={Globe} color="bg-emerald-500" title="Langue">
          <select 
            className="bg-transparent text-gray-500 outline-none appearance-none cursor-pointer"
            value={formData.language || 'fr'}
            onChange={(e) => setFormData({...formData, language: e.target.value})}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </SettingRow>
      </SettingSection>

      {/* SECTION : APPARENCE */}
      <SettingSection title="Apparence">
        <SettingRow icon={Palette} color="bg-purple-500" title="Thème">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'light', icon: Sun },
              { id: 'dark', icon: Moon },
              { id: 'system', icon: Monitor }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFormData({...formData, theme: t.id as any})}
                className={`p-1.5 rounded-md transition-all ${formData.theme === t.id ? 'bg-white shadow-sm text-orange-500' : 'text-gray-400'}`}
              >
                <t.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </SettingRow>
        
        {/* Sélecteur de couleur (vu sur ton ancienne interface) */}
        <div className="p-4 bg-white">
          <p className="text-sm font-medium text-gray-800 mb-3">Couleur d'accentuation</p>
          <div className="flex justify-between items-center px-2">
            {accentColors.map((color) => (
              <button
                key={color.name}
                className={`h-8 w-8 rounded-full border-4 transition-transform active:scale-90 ${color.class} ${
                  formData.accentColor === color.name ? 'border-gray-200 scale-110 shadow-md' : 'border-transparent'
                }`}
                onClick={() => setFormData({...formData, accentColor: color.name})}
              />
            ))}
          </div>
        </div>
      </SettingSection>

      {/* SECTION : DONNÉES */}
      <SettingSection title="Données & Sécurité">
        <SettingRow icon={Download} color="bg-gray-400" title="Exporter les données" onClick={() => alert('Exportation...')} />
        <SettingRow icon={Trash2} color="bg-red-500" title="Tout réinitialiser" onClick={() => {
          if(confirm("Effacer définitivement toutes les données ?")) setItems([]);
        }} />
      </SettingSection>

      {/* SECTION : À PROPOS */}
      <SettingSection title="À propos">
        <SettingRow icon={Info} color="bg-blue-400" title="Version">
          <span className="text-gray-400 text-sm">2.4.0</span>
        </SettingRow>
      </SettingSection>

      {/* BARRE DE BOUTONS FLOTTANTE ( dirty state ) */}
      {(isDirty || isSaved) && (
        <div className="fixed bottom-8 left-4 right-4 flex gap-3 animate-in slide-in-from-bottom-8 duration-300 z-50">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1 h-12 bg-white/90 backdrop-blur shadow-2xl rounded-2xl border-gray-200 text-gray-700"
            disabled={isSaved}
          >
            <X className="mr-2 h-4 w-4" /> Annuler
          </Button>
          
          <Button 
            onClick={handleSave} 
            className={`flex-[2] h-12 font-bold shadow-2xl rounded-2xl transition-all ${
              isSaved ? 'bg-green-600' : 'bg-orange-500 text-white'
            }`}
          >
            {isSaved ? <><Check className="mr-2 h-5 w-5" /> Appliqué</> : <><Save className="mr-2 h-5 w-5" /> Enregistrer</>}
          </Button>
        </div>
      )}
    </div>
  );
}