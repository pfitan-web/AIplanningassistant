import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, AlertCircle, Car, RefreshCw } from 'lucide-react';
import { format, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import AlertManager from './AlertManager';

interface EventModalProps {
  onClose: () => void;
  selectedDate?: Date;
}

export default function EventModal({ onClose, selectedDate }: EventModalProps) {
  const { addItem, settings } = useNotesStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [attendees, setAttendees] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [recurrenceEnd, setRecurrenceEnd] = useState('');
  
  // Initialize alerts with default values
  const [alerts, setAlerts] = useState<Array<{ time: number; unit: 'minutes' | 'hours' | 'days' }>>(
    settings?.defaultAlerts?.length > 0 ? settings.defaultAlerts : [{ time: 15, unit: 'minutes' }]
  );
  
  const [travelTime, setTravelTime] = useState({
    enabled: false,
    duration: settings?.defaultTravelTime ?? 15,
    mode: 'driving' as const,
  });

  useEffect(() => {
    const now = selectedDate || new Date();
    const startTime = setMinutes(setHours(now, now.getHours() + 1), 0);
    const end = setMinutes(startTime, 60);
    
    setEventTime(format(startTime, "yyyy-MM-dd'T'HH:mm"));
    setEndTime(format(end, "yyyy-MM-dd'T'HH:mm"));
  }, [selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addItem({
      type: 'event',
      title,
      content,
      eventTime,
      endTime,
      location,
      attendees,
      reminderTime: eventTime,
      isFlagged: false,
      isCompleted: false,
      recurrence: recurrence as any,
      recurrenceEnd: recurrenceEnd || undefined,
      alerts,
      travelTime: travelTime.enabled ? travelTime : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nouvel événement</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de l'événement"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="content">Description</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ajouter une description..."
              rows={3}
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Début</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">Fin</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Lieu</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ajouter un lieu"
                className="pl-10"
              />
            </div>
          </div>

          {/* Attendees */}
          <div>
            <Label htmlFor="attendees">Participants</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="attendees"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="Ajouter des participants"
                className="pl-10"
              />
            </div>
          </div>

          {/* Travel Time */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center">
                <Car className="h-4 w-4 mr-2" />
                Temps de trajet
              </Label>
              <Switch
                checked={travelTime.enabled}
                onCheckedChange={(enabled) => setTravelTime(prev => ({ ...prev, enabled }))}
              />
            </div>
            
            {travelTime.enabled && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <Label>Durée (minutes)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="120"
                    value={travelTime.duration}
                    onChange={(e) => setTravelTime(prev => ({ ...prev, duration: parseInt(e.target.value) || 15 }))}
                  />
                </div>
                <div>
                  <Label>Mode</Label>
                  <Select value={travelTime.mode} onValueChange={(mode: any) => setTravelTime(prev => ({ ...prev, mode }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driving">🚗 Voiture</SelectItem>
                      <SelectItem value="walking">🚶 À pied</SelectItem>
                      <SelectItem value="transit">🚇 Transports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Recurrence */}
          <div className="space-y-3">
            <Label className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              Répétition
            </Label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ne pas répéter</SelectItem>
                <SelectItem value="daily">Tous les jours</SelectItem>
                <SelectItem value="weekly">Toutes les semaines</SelectItem>
                <SelectItem value="monthly">Tous les mois</SelectItem>
                <SelectItem value="yearly">Tous les ans</SelectItem>
              </SelectContent>
            </Select>
            
            {recurrence !== 'none' && (
              <div>
                <Label htmlFor="recurrenceEnd">Jusqu'au</Label>
                <Input
                  id="recurrenceEnd"
                  type="date"
                  value={recurrenceEnd}
                  onChange={(e) => setRecurrenceEnd(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Alerts */}
          <div className="space-y-3">
            <Label className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Rappels
            </Label>
            <AlertManager alerts={alerts} onChange={setAlerts} />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              Créer l'événement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}