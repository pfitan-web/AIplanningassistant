import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isSameDay, parseISO } from 'date-fns';

export type ItemType = 'note' | 'reminder' | 'event';

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  content?: string;
  eventTime?: string; 
  endTime?: string;
  isCompleted: boolean;
  createdAt: string;
  location?: string;
  attendees?: string;
}

interface NotesState {
  items: Item[];
  selectedDate: Date;
  currentFocusItem: string | null;
  
  setSelectedDate: (date: Date) => void;
  setCurrentFocusItem: (id: string | null) => void;
  
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  toggleComplete: (id: string) => void;
  
  getTodayItems: () => Item[];
  getTodayTasks: () => Item[];
  getAllNotes: () => Item[];
}

const localStorageAdapter = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    return JSON.parse(str);
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  }
};

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedDate: new Date(),
      currentFocusItem: null,

      setSelectedDate: (date) => set({ selectedDate: date }),
      setCurrentFocusItem: (id) => set({ currentFocusItem: id }),

      addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),

      updateItem: (id, updates) => set((state) => ({
        items: state.items.map(item => item.id === id ? { ...item, ...updates } : item)
      })),

      deleteItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),

      toggleComplete: (id) => set((state) => ({
        items: state.items.map(item => item.id === id ? { ...item, isCompleted: !item.isCompleted } : item)
      })),

      getTodayItems: () => {
        const { items, selectedDate } = get();
        return items.filter(item => {
          if (!item.eventTime) return false;
          return isSameDay(parseISO(item.eventTime), selectedDate);
        }).sort((a, b) => (a.eventTime || '').localeCompare(b.eventTime || ''));
      },

      getTodayTasks: () => {
        const { items, selectedDate } = get();
        return items.filter(item => {
           if (item.type === 'note') return false;
           if (!item.eventTime) return false; 
           return isSameDay(parseISO(item.eventTime), selectedDate);
        });
      },

      getAllNotes: () => {
        return get().items.filter(item => item.type === 'note');
      }
    }),
    {
      name: 'harmony-storage',
      storage: localStorageAdapter,
    }
  )
);