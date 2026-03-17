import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { format, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

export type ItemType = 'note' | 'event' | 'reminder';
export type Priority = 'none' | 'low' | 'medium' | 'high';
export type RepeatType = 'never' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  content: string;
  folder?: string;
  list?: string;
  priority: Priority;
  isPinned: boolean;
  isFlagged: boolean;
  isLocked: boolean;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  reminderTime?: Date;
  allDay?: boolean;
  repeatType?: RepeatType;
  subtasks?: SubTask[];
  tags?: string[];
  color?: string;
}

interface NotesStoreContextType {
  items: Item[];
  folders: string[];
  lists: string[];
  currentView: 'month' | 'week' | 'day';
  selectedDate: Date;
  searchQuery: string;
  selectedFolder?: string;
  selectedList?: string;
  
  // Actions
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Item;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  toggleComplete: (id: string) => void;
  addSubTask: (itemId: string, title: string) => void;
  toggleSubTask: (itemId: string, subTaskId: string) => void;
  deleteSubTask: (itemId: string, subTaskId: string) => void;
  pinItem: (id: string) => void;
  flagItem: (id: string) => void;
  setCurrentView: (view: 'month' | 'week' | 'day') => void;
  setSelectedDate: (date: Date) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFolder: (folder?: string) => void;
  setSelectedList: (list?: string) => void;
  addFolder: (name: string) => void;
  addList: (name: string) => void;
  
  // Getters
  getItemsForDate: (date: Date) => Item[];
  getItemsForMonth: (date: Date) => Item[];
  getItemsForWeek: (date: Date) => Item[];
  getPinnedItems: () => Item[];
  getFlaggedItems: () => Item[];
  getCompletedItems: () => Item[];
  getItemsByFolder: (folder: string) => Item[];
  getItemsByList: (list: string) => Item[];
  searchItems: (query: string) => Item[];
}

const NotesStoreContext = createContext<NotesStoreContextType | null>(null);

interface NotesStoreProviderProps {
  children: ReactNode;
}

export function NotesStoreProvider({ children }: NotesStoreProviderProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [folders, setFolders] = useState<string[]>(['Notes', 'Toutes les notes', 'Récemment modifiées']);
  const [lists, setLists] = useState<string[]>(['Aujourd\'hui', 'Planifié', 'Important', 'Tout']);
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>();
  const [selectedList, setSelectedList] = useState<string | undefined>();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('harmony-notes-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.state) {
          setItems(parsed.state.items?.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
            reminderTime: item.reminderTime ? new Date(item.reminderTime) : undefined
          })) || []);
          setFolders(parsed.state.folders || folders);
          setLists(parsed.state.lists || lists);
          setCurrentView(parsed.state.currentView || currentView);
          setSelectedDate(parsed.state.selectedDate ? new Date(parsed.state.selectedDate) : selectedDate);
          setSearchQuery(parsed.state.searchQuery || '');
          setSelectedFolder(parsed.state.selectedFolder);
          setSelectedList(parsed.state.selectedList);
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      const stateToSave = {
        state: {
          items,
          folders,
          lists,
          currentView,
          selectedDate,
          searchQuery,
          selectedFolder,
          selectedList
        }
      };
      localStorage.setItem('harmony-notes-storage', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [items, folders, lists, currentView, selectedDate, searchQuery, selectedFolder, selectedList]);

  const addItem = (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Item => {
    const newItem: Item = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setItems(prev => [...prev, newItem]);
    return newItem;
  };

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems(prev => prev.map((item) =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date() }
        : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter((item) => item.id !== id));
  };

  const toggleComplete = (id: string) => {
    setItems(prev => prev.map((item) =>
      item.id === id
        ? { ...item, isCompleted: !item.isCompleted, updatedAt: new Date() }
        : item
    ));
  };

  const addSubTask = (itemId: string, title: string) => {
    const newSubTask: SubTask = {
      id: Date.now().toString(),
      title,
      completed: false,
    };
    
    setItems(prev => prev.map((item) =>
      item.id === itemId
        ? {
            ...item,
            subtasks: [...(item.subtasks || []), newSubTask],
            updatedAt: new Date(),
          }
        : item
    ));
  };

  const toggleSubTask = (itemId: string, subTaskId: string) => {
    setItems(prev => prev.map((item) =>
      item.id === itemId
        ? {
            ...item,
            subtasks: item.subtasks?.map((subtask) =>
              subtask.id === subTaskId
                ? { ...subtask, completed: !subtask.completed }
                : subtask
            ),
            updatedAt: new Date(),
          }
        : item
    ));
  };

  const deleteSubTask = (itemId: string, subTaskId: string) => {
    setItems(prev => prev.map((item) =>
      item.id === itemId
        ? {
            ...item,
            subtasks: item.subtasks?.filter((subtask) => subtask.id !== subTaskId),
            updatedAt: new Date(),
          }
        : item
    ));
  };

  const pinItem = (id: string) => {
    setItems(prev => prev.map((item) =>
      item.id === id
        ? { ...item, isPinned: !item.isPinned, updatedAt: new Date() }
        : item
    ));
  };

  const flagItem = (id: string) => {
    setItems(prev => prev.map((item) =>
      item.id === id
        ? { ...item, isFlagged: !item.isFlagged, updatedAt: new Date() }
        : item
    ));
  };

  const addFolder = (name: string) => {
    setFolders(prev => [...prev, name]);
  };

  const addList = (name: string) => {
    setLists(prev => [...prev, name]);
  };

  const getItemsForDate = (date: Date): Item[] => {
    return items.filter((item) => {
      if (!item.reminderTime) return false;
      return isSameDay(new Date(item.reminderTime), date);
    });
  };

  const getItemsForMonth = (date: Date): Item[] => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    return items.filter((item) => {
      if (!item.reminderTime) return false;
      const itemDate = new Date(item.reminderTime);
      return itemDate >= monthStart && itemDate <= monthEnd;
    });
  };

  const getItemsForWeek = (date: Date): Item[] => {
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);
    
    return items.filter((item) => {
      if (!item.reminderTime) return false;
      const itemDate = new Date(item.reminderTime);
      return itemDate >= weekStart && itemDate <= weekEnd;
    });
  };

  const getPinnedItems = (): Item[] => {
    return items.filter((item) => item.isPinned).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  const getFlaggedItems = (): Item[] => {
    return items.filter((item) => item.isFlagged);
  };

  const getCompletedItems = (): Item[] => {
    return items.filter((item) => item.isCompleted);
  };

  const getItemsByFolder = (folder: string): Item[] => {
    return items.filter((item) => item.folder === folder);
  };

  const getItemsByList = (list: string): Item[] => {
    return items.filter((item) => item.list === list);
  };

  const searchItems = (query: string): Item[] => {
    if (!query.trim()) return items;
    
    const lowercaseQuery = query.toLowerCase();
    return items.filter((item) =>
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.content.toLowerCase().includes(lowercaseQuery) ||
      item.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const value: NotesStoreContextType = {
    items,
    folders,
    lists,
    currentView,
    selectedDate,
    searchQuery,
    selectedFolder,
    selectedList,
    addItem,
    updateItem,
    deleteItem,
    toggleComplete,
    addSubTask,
    toggleSubTask,
    deleteSubTask,
    pinItem,
    flagItem,
    setCurrentView,
    setSelectedDate,
    setSearchQuery,
    setSelectedFolder,
    setSelectedList,
    addFolder,
    addList,
    getItemsForDate,
    getItemsForMonth,
    getItemsForWeek,
    getPinnedItems,
    getFlaggedItems,
    getCompletedItems,
    getItemsByFolder,
    getItemsByList,
    searchItems,
  };

  return (
    <NotesStoreContext.Provider value={value}>
      {children}
    </NotesStoreContext.Provider>
  );
}

export function useNotesStore(): NotesStoreContextType {
  const context = useContext(NotesStoreContext);
  if (!context) {
    throw new Error('useNotesStore must be used within a NotesStoreProvider');
  }
  return context;
}