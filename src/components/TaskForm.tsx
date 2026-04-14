import React, { useState } from 'react';
import { X, Plus, Clock, Tag, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { TaskType, Task, RecurrenceType } from '../types';
import { format } from 'date-fns';

interface TaskFormProps {
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('study');
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [preferredTime, setPreferredTime] = useState<string>('any');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onSave({
      title,
      type,
      duration,
      priority,
      preferredTime,
      recurrence,
      status: 'pending',
      date: format(new Date(), 'yyyy-MM-dd'),
      createdAt: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-1">Add New Task</h2>
            <p className="text-sm text-gray-500">What's on your mind for today?</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Task Title</label>
              <Input 
                autoFocus
                placeholder="e.g., Study for Math Exam" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Category</label>
                <select 
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                  value={type}
                  onChange={(e) => setType(e.target.value as TaskType)}
                >
                  <option value="study">Study</option>
                  <option value="fitness">Fitness</option>
                  <option value="habit">Habit</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Duration (mins)</label>
                <Input 
                  type="number" 
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min={5}
                  step={5}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Priority</label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p as any)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                      priority === p 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Preferred Time</label>
                <select 
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                >
                  <option value="any">Anytime</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Recurrence</label>
                <select 
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 gap-2">
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
