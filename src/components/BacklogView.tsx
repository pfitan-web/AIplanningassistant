import React, { useState } from 'react';
import { Plus, Inbox, ArrowRight, Trash2 } from 'lucide-react';
import { useNotesStore } from '../hooks/useNotesStoreProvider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export default function BacklogView() {
  const { getBacklogItems, addItem, moveToToday, deleteItem } = useNotesStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const backlog = getBacklogItems();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    addItem({
      type: 'backlog',
      title: newTaskTitle,
      content: '',
      isBacklog: true,
      priority: newTaskPriority,
      isFlagged: false,
      isCompleted: false,
      subtasks: [],
      ifThenRule: '',
    });
    
    setNewTaskTitle('');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <Inbox className="h-12 w-12 text-orange-400 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">Répertoire de Tâches</h2>
        <p className="text-gray-600">
          Un inventaire "fourre-tout" pour libérer votre esprit. Notez tout ici pour les 1 à 6 prochaines semaines.
        </p>
      </div>

      {/* Quick Add */}
      <Card className="border-orange-200">
        <CardContent className="p-4">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              placeholder="Utilisez un verbe d'action (ex: Appeler, Réserver, Acheter)..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1"
            />
            <Select value={newTaskPriority} onValueChange={(v: any) => setNewTaskPriority(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {backlog.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Votre répertoire est vide.</p>
            <p className="text-sm">Videz votre tête : ajoutez toutes vos obligations ici.</p>
          </div>
        ) : (
          backlog.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <div className="flex gap-2 mt-1">
                      {item.priority === 'high' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Haute</span>}
                      {item.priority === 'medium' && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Moyenne</span>}
                      {item.priority === 'low' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Basse</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteItem(item.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => moveToToday(item.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Pour aujourd'hui <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}