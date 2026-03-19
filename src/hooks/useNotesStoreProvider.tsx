import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';

export type Priority = 'high' | 'medium' | 'low';

export interface Item {
  id: string;
  type: 'note' | 'event' | 'reminder' | 'backlog';
  title: string;
  content?: string;
  eventTime?: string;
  endTime?: string;
  reminderTime?: string;
  location?: string;
  attendees?: string;
  isFlagged: boolean;
  isCompleted: boolean;
  priority: Priority;
  isBacklog: boolean;
  subtasks: string[];
  ifThenRule: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceEnd?: string;
  alerts?: Array<{ time: number; unit: 'minutes' | 'hours' | 'days' }>;
  travelTime?: {
    enabled: boolean;
    duration: number;
    mode: 'driving' | 'walking' | 'transit';
  };
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  defaultAlerts: Array<{ time: number; unit: 'minutes' | 'hours' | 'days' }>;
  defaultTravelTime: number;
  theme: 'light' | 'dark';
  planningTime: string;
  notificationSound: 'carillon' | 'cloche' | 'silencieux';
  bannerVisibility: 'always' | 'active' | 'never';
  autoSnooze: boolean;
}

interface NotesStoreContextType {
  items: Item[];
  currentView: string;
  selectedDate: Date;
  settings: Settings;
  currentFocusItem: Item | null;
  setCurrentView: (view: any) => void;
  setSelectedDate: (date: Date) => void;
  setCurrentFocusItem: (item: Item | null) => void;
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  toggleComplete: (id: string) => void;
  toggleFlag: (id: string) => void;
  updateSettings: (newSettings: Settings) => void;
  moveToToday: (id: string) => void;
  moveToBacklog: (id: string) => void;
  getBacklogItems: () => Item[];
  getTodayTasks: () => Item[];
  getTodayItems: () => Item[];
}

const NotesStoreContext = createContext<NotesStoreContextType | undefined>(undefined);

const defaultSettings: Settings = {
  defaultAlerts: [{ time: 15, unit: 'minutes' }],
  defaultTravelTime: 15,
  theme: 'light',
  planningTime: '08:00',
  notificationSound: 'carillon',
  bannerVisibility: 'active',
  autoSnooze: false,
};

export function NotesStoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [currentView, setCurrentView] = useState('planning');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [currentFocusItem, setCurrentFocusItem] = useState<Item | null>(null);

  useEffect(() => {
    const savedItems = localStorage.getItem('harmony-notes-items');
    const savedSettings = localStorage.getItem('harmony-notes-settings');
    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedSettings) setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
  }, []);

  useEffect(() => {
    localStorage.setItem('harmony-notes-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('harmony-notes-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Settings) => setSettings(newSettings);

  const addItem = (item: any) => {
    const newItem = { ...item, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, updates: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));
  };

  const deleteItem = (id: string) => setItems(prev => prev.filter(item => item.id !== id));

  const toggleComplete = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, isCompleted: !item.isCompleted } : item));
  };

  const toggleFlag = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, isFlagged: !item.isFlagged } : item));
  };

  const moveToToday = (id: string) => updateItem(id, { isBacklog: false, reminderTime: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
  const moveToBacklog = (id: string) => updateItem(id, { isBacklog: true, reminderTime: undefined });
  const getBacklogItems = () => items.filter(item => item.isBacklog && !item.isCompleted);
  
  const getTodayTasks = () => {
    return items.filter(item => {
      if (item.isBacklog || item.isCompleted || item.type === 'note') return false;
      const dateStr = item.eventTime || item.reminderTime || '';
      return dateStr && isSameDay(parseISO(dateStr), new Date());
    });
  };

  const getTodayItems = () => {
    return items.filter(item => {
      const dateStr = item.eventTime || item.reminderTime || '';
      return item.type !== 'note' && dateStr && isSameDay(parseISO(dateStr), new Date());
    });
  };

  return (
    <NotesStoreContext.Provider value={{
      items, currentView, selectedDate, settings, currentFocusItem,
      setCurrentView, setSelectedDate, setCurrentFocusItem,
      addItem, updateItem, deleteItem, toggleComplete, toggleFlag,
      updateSettings, moveToToday, moveToBacklog, getBacklogItems, getTodayTasks, getTodayItems
    }}>
      {children}
    </NotesStoreContext.Provider>
  );
}

export function useNotesStore() {
  const context = useContext(NotesStoreContext);
  if (!context) throw new Error('useNotesStore must be used within a NotesStoreProvider');
  return context;
}