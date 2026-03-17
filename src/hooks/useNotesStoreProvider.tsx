import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export type Priority = 'high' | 'medium' | 'low';

export interface Item {
  id: string;
  type: 'note' | 'event' | 'reminder' | 'backlog'; // Added 'backlog'
  title: string;
  content?: string;
  eventTime?: string;
  endTime?: string;
  reminderTime?: string;
  location?: string;
  attendees?: string;
  isFlagged: boolean;
  isCompleted: boolean;
  
  // CBT Specific Fields
  priority: Priority;
  isBacklog: boolean; // True if in Master List, False if in Today
  subtasks: string[]; // For task breakdown
  ifThenRule: string; // "Si X arrive, alors je ferai Y"
  
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
  planningTime: string; // HH:MM format for daily planning ritual
}

interface NotesStoreContextType {
  items: Item[];
  currentView: 'timeline' | 'calendar' | 'notes' | 'planning' | 'backlog' | 'focus'; // Added planning, backlog, focus
  selectedDate: Date;
  settings: Settings;
  currentFocusItem: Item | null;
  
  setCurrentView: (view: 'timeline' | 'calendar' | 'notes' | 'planning' | 'backlog' | 'focus') => void;
  setSelectedDate: (date: Date) => void;
  setCurrentFocusItem: (item: Item | null) => void;
  
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  toggleComplete: (id: string) => void;
  toggleFlag: (id: string) => void;
  
  // CBT Helpers
  moveToToday: (id: string) => void;
  moveToBacklog: (id: string) => void;
  getBacklogItems: () => Item[];
  getTodayTasks: () => Item[]; // Only non-backlog items for today
}

const NotesStoreContext = createContext<NotesStoreContextType | undefined>(undefined);

const defaultSettings: Settings = {
  defaultAlerts: [{ time: 15, unit: 'minutes' }],
  defaultTravelTime: 15,
  theme: 'light',
  planningTime: '08:00', // Default planning time
};

function NotesStoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [currentView, setCurrentView] = useState<'timeline' | 'calendar' | 'notes' | 'planning' | 'backlog' | 'focus'>('planning'); // Start at planning
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [currentFocusItem, setCurrentFocusItem] = useState<Item | null>(null);

  useEffect(() => {
    const savedItems = localStorage.getItem('harmony-notes-items');
    const savedSettings = localStorage.getItem('harmony-notes-settings');
    
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (e) {
        console.error('Failed to load items:', e);
      }
    }
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('harmony-notes-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('harmony-notes-settings', JSON.stringify(settings));
  }, [settings]);

  const addItem = (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: Item = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleComplete = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, isCompleted: !item.isCompleted, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const toggleFlag = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, isFlagged: !item.isFlagged, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  // CBT Actions
  const moveToToday = (id: string) => {
    updateItem(id, { isBacklog: false, reminderTime: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
  };

  const moveToBacklog = (id: string) => {
    updateItem(id, { isBacklog: true, reminderTime: undefined });
  };

  const getBacklogItems = () => {
    return items.filter(item => item.isBacklog && !item.isCompleted);
  };

  const getTodayTasks = () => {
    const today = new Date();
    return items.filter(item => {
      if (item.isBacklog || item.isCompleted || item.type === 'note') return false;
      const itemDate = parseISO(item.eventTime || item.reminderTime || '');
      return isSameDay(itemDate, today);
    });
  };

  const getTodayItems = () => {
    const today = new Date();
    return items.filter(item => {
      if (item.type === 'note') return false;
      const itemDate = parseISO(item.eventTime || item.reminderTime || '');
      return isSameDay(itemDate, today);
    });
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    return items
      .filter(item => {
        if (item.type === 'note' || item.isCompleted) return false;
        const reminderTime = item.reminderTime || item.eventTime;
        if (!reminderTime) return false;
        return parseISO(reminderTime) > now;
      })
      .sort((a, b) => {
        const timeA = parseISO(a.reminderTime || a.eventTime || '');
        const timeB = parseISO(b.reminderTime || b.eventTime || '');
        return timeA.getTime() - timeB.getTime();
      });
  };

  const getNotes = () => {
    return items.filter(item => item.type === 'note');
  };

  const getEventsForDate = (date: Date) => {
    return items.filter(item => {
      if (item.type === 'note') return false;
      const itemDate = parseISO(item.eventTime || item.reminderTime || '');
      return isSameDay(itemDate, date);
    });
  };

  const value: NotesStoreContextType = {
    items,
    currentView,
    selectedDate,
    settings,
    currentFocusItem,
    setCurrentView,
    setSelectedDate,
    setCurrentFocusItem,
    addItem,
    updateItem,
    deleteItem,
    toggleComplete,
    toggleFlag,
    moveToToday,
    moveToBacklog,
    getBacklogItems,
    getTodayTasks,
    getTodayItems,
    getUpcomingReminders,
    getNotes,
    getEventsForDate,
  };

  return (
    <NotesStoreContext.Provider value={value}>
      {children}
    </NotesStoreContext.Provider>
  );
}

function useNotesStore() {
  const context = useContext(NotesStoreContext);
  if (context === undefined) {
    throw new Error('useNotesStore must be used within a NotesStoreProvider');
  }
  return context;
}

export { NotesStoreProvider, useNotesStore };