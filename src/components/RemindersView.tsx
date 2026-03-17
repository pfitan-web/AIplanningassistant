import React, { useState } from 'react';
import { Plus, Search, Clock, Calendar, CheckCircle, Circle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { useNotesStore, Item } from '../hooks/useNotesStoreProvider';
import RemindersModal from './RemindersModal';

export default function RemindersView() {
  const {
    items,
    searchQuery,
    setSearchQuery,
    toggleComplete,
    deleteItem,
    updateItem
  } = useNotesStore();

  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Item | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Filter for reminders (notes with reminder times)
  const reminders = items.filter(item => 
    item.type === 'note' && item.reminderTime && !item.isCompleted
  );

  // Group reminders by time period
  const todayReminders = reminders.filter(item => 
    item.reminderTime && isToday(parseISO(item.reminderTime))
  );

  const tomorrowReminders = reminders.filter(item => 
    item.reminderTime && isTomorrow(parseISO(item.reminderTime))
  );

  const upcomingReminders = reminders.filter(item => 
    item.reminderTime && 
    !isToday(parseISO(item.reminderTime)) && 
    !isTomorrow(parseISO(item.reminderTime)) &&
    !isPast(parseISO(item.reminderTime))
  );

  const overdueReminders = reminders.filter(item => 
    item.reminderTime && isPast(parseISO(item.reminderTime))
  );

  const filteredReminders = searchQuery
    ? reminders.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : reminders;

  const handleEditReminder = (reminder: Item) => {
    setEditingReminder(reminder);
    setShowRemindersModal(true);
  };

  const handleDeleteReminder = (reminderId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rappel ?')) {
      deleteItem(reminderId);
    }
  };

  const handleCreateReminder = () => {
    setEditingReminder(null);
    setShowRemindersModal(true);
  };

  const ReminderItem = ({ reminder }: { reminder: Item }) => {
    const isOverdue = reminder.reminderTime && isPast(parseISO(reminder.reminderTime));
    const isCompleted = reminder.isCompleted;

    return (
      <Card className={`mb-3 transition-all ${isCompleted ? 'opacity-50' : ''} ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 mt-1"
              onClick={() => toggleComplete(reminder.id)}
            >
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </Button>

            <div className="flex-1">
              <h3 className={`font-medium text-gray-900 ${isCompleted ? 'line-through' : ''}`}>
                {reminder.title}
              </h3>
              {reminder.content && (
                <p className="text-sm text-gray-600 mt-1">{reminder.content}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                  {reminder.reminderTime && format(parseISO(reminder.reminderTime), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
                {isOverdue && <span className="text-red-600 font-medium">(En retard)</span>}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowMenu(showMenu === reminder.id ? null : reminder.id)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Dropdown Menu */}
          {showMenu === reminder.id && (
            <div className="absolute right-4 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  handleEditReminder(reminder);
                  setShowMenu(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </button>
              <button
                onClick={() => {
                  handleDeleteReminder(reminder.id);
                  setShowMenu(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-semibold text-gray-900">Rappels</h1>
          <Button
            onClick={handleCreateReminder}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau rappel
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher des rappels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Reminders List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredReminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Clock className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Aucun rappel</p>
            <p className="text-sm text-gray-400 mb-4">
              {searchQuery ? 'Essayez une autre recherche' : 'Créez votre premier rappel'}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateReminder} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Créer un rappel
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overdue */}
            {overdueReminders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3">
                  En retard ({overdueReminders.length})
                </h3>
                {overdueReminders.map(reminder => (
                  <ReminderItem key={reminder.id} reminder={reminder} />
                ))}
              </div>
            )}

            {/* Today */}
            {todayReminders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Aujourd'hui ({todayReminders.length})
                </h3>
                {todayReminders.map(reminder => (
                  <ReminderItem key={reminder.id} reminder={reminder} />
                ))}
              </div>
            )}

            {/* Tomorrow */}
            {tomorrowReminders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Demain ({tomorrowReminders.length})
                </h3>
                {tomorrowReminders.map(reminder => (
                  <ReminderItem key={reminder.id} reminder={reminder} />
                ))}
              </div>
            )}

            {/* Upcoming */}
            {upcomingReminders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  À venir ({upcomingReminders.length})
                </h3>
                {upcomingReminders.map(reminder => (
                  <ReminderItem key={reminder.id} reminder={reminder} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reminders Modal */}
      {showRemindersModal && (
        <RemindersModal
          reminder={editingReminder}
          onClose={() => {
            setShowRemindersModal(false);
            setEditingReminder(null);
          }}
        />
      )}
    </div>
  );
}