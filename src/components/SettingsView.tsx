import React, { useState, useEffect } from 'react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  User, Bell, Palette, Globe, Shield, 
  ChevronRight, Save, X, Trash2, Check, Moon, Sun, Monitor
} from 'lucide-react';

export default function SettingsView() {
  const { settings, updateSettings, setItems } = useNotesStore();
  
  // État local pour le formulaire (copie des réglages actuels)
  const [formData, setFormData] = useState({ ...settings });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Détection des changements pour afficher la barre de boutons
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

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg">Général</TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg">Apparence</TabsTrigger>
          <TabsTrigger value="account" className="rounded-lg">Compte</TabsTrigger>
        </TabsList>

        {/* --- ONGLET GÉNÉRAL --- */}
        <TabsContent value="general" className="space-y-4">
          <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-500" /> Notifications
              </CardTitle>
              <p className="text-sm text-gray-500">Gérez vos alertes et rappels</p>
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
                <span className="text-sm font-medium">Langue de l'interface</span>
                <select 
                  className="bg-gray-50 border-none text-sm p-1 rounded"
                  value={formData.language || 'fr'}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ONGLET APPARENCE --- */}
        <TabsContent value="appearance" className="space-y-4">
          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-500" /> Thème
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'light', icon: Sun, label: 'Clair' },
                  { id: 'dark', icon: Moon, label: 'Sombre' },
                  { id: 'system', icon: Monitor, label: 'Système' }
                ].map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setFormData({...formData