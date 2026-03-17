import React from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Alert {
  time: number;
  unit: 'minutes' | 'hours' | 'days';
}

interface AlertManagerProps {
  alerts: Alert[];
  onChange: (alerts: Alert[]) => void;
}

export default function AlertManager({ alerts = [], onChange }: AlertManagerProps) {
  const addAlert = () => {
    onChange([...alerts, { time: 15, unit: 'minutes' }]);
  };

  const removeAlert = (index: number) => {
    onChange(alerts.filter((_, i) => i !== index));
  };

  const updateAlert = (index: number, field: keyof Alert, value: any) => {
    const newAlerts = [...alerts];
    newAlerts[index] = { ...newAlerts[index], [field]: value };
    onChange(newAlerts);
  };

  const getAlertLabel = (alert: Alert) => {
    if (alert.unit === 'minutes') {
      return `${alert.time} min avant`;
    } else if (alert.unit === 'hours') {
      return `${alert.time}h avant`;
    } else {
      return `${alert.time}j avant`;
    }
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => {
        // Ensure alert has default values
        const safeAlert = {
          time: alert?.time ?? 15,
          unit: alert?.unit ?? 'minutes'
        };

        return (
          <div key={index} className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
            
            <Select
              value={safeAlert.time.toString()}
              onValueChange={(value) => updateAlert(index, 'time', parseInt(value))}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">À l'heure</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="45">45</SelectItem>
                <SelectItem value="60">60</SelectItem>
                <SelectItem value="120">2 heures</SelectItem>
                <SelectItem value="180">3 heures</SelectItem>
                <SelectItem value="1440">1 jour</SelectItem>
                <SelectItem value="2880">2 jours</SelectItem>
                <SelectItem value="10080">1 semaine</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={safeAlert.unit}
              onValueChange={(value: any) => updateAlert(index, 'unit', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">minutes</SelectItem>
                <SelectItem value="hours">heures</SelectItem>
                <SelectItem value="days">jours</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeAlert(index)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addAlert}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un rappel
      </Button>
    </div>
  );
}