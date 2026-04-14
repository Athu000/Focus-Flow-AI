import React, { useState, useEffect } from 'react';
import { format, isToday, parseISO, startOfToday, addDays, subDays, eachDayOfInterval } from 'date-fns';
import { CheckCircle2, Circle, Clock, Plus, Zap, AlertCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Task, UserProfile } from '../types';
import { getMotivationalMessage } from '../services/geminiService';

interface DashboardProps {
  tasks: Task[];
  user: UserProfile;
  onToggleTask: (taskId: string) => void;
  onAddTask: () => void;
  onGenerateSchedule: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  tasks, 
  user, 
  onToggleTask, 
  onAddTask, 
  onGenerateSchedule,
  selectedDate,
  onDateChange
}) => {
  const [motivationalMessage, setMotivationalMessage] = useState<string>('');
  const parsedSelectedDate = parseISO(selectedDate);
  const todayTasks = tasks.filter(t => t.date === selectedDate);
  const completedCount = todayTasks.filter(t => t.status === 'completed').length;
  const totalCount = todayTasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Generate 7 days for the calendar strip
  const dateRange = eachDayOfInterval({
    start: subDays(parsedSelectedDate, 3),
    end: addDays(parsedSelectedDate, 3),
  });

  useEffect(() => {
    if (totalCount > 0) {
      getMotivationalMessage(completionRate).then(setMotivationalMessage);
    }
  }, [completionRate, totalCount]);

  const sortedTasks = [...todayTasks].sort((a, b) => {
    if (a.scheduledTime && b.scheduledTime) {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    }
    return 0;
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{format(parsedSelectedDate, 'EEEE, MMMM do')}</p>
          <h1 className="text-3xl font-bold tracking-tight">
            {isToday(parsedSelectedDate) ? `Good morning, ${user.displayName?.split(' ')[0] || 'User'}!` : format(parsedSelectedDate, 'MMMM do')}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={onGenerateSchedule} className="gap-2">
            <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            Optimize Schedule
          </Button>
          <Button size="sm" onClick={onAddTask} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>
      </header>

      {/* Calendar Strip */}
      <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
        <Button variant="ghost" size="icon" onClick={() => onDateChange(format(subDays(parsedSelectedDate, 1), 'yyyy-MM-dd'))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 flex justify-around gap-1">
          {dateRange.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isSelected = dateStr === selectedDate;
            const isCurrentToday = isToday(date);
            
            return (
              <button
                key={dateStr}
                onClick={() => onDateChange(dateStr)}
                className={`flex flex-col items-center min-w-[3.5rem] py-3 rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-primary text-white shadow-lg scale-105' 
                    : 'hover:bg-slate-50 text-slate-500'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {format(date, 'EEE')}
                </span>
                <span className="text-lg font-bold leading-none">
                  {format(date, 'd')}
                </span>
                {isCurrentToday && !isSelected && (
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>

        <Button variant="ghost" size="icon" onClick={() => onDateChange(format(addDays(parsedSelectedDate, 1), 'yyyy-MM-dd'))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="bg-primary text-white p-6 relative overflow-hidden border-none shadow-xl shadow-indigo-200">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today's Progress</h2>
            <Badge variant="success" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {user.streak} Day Streak 🔥
            </Badge>
          </div>
          <div className="flex items-end gap-4 mb-4">
            <span className="text-5xl font-bold">{completionRate}%</span>
            <span className="text-indigo-100 mb-1.5 text-sm">{completedCount} of {totalCount} tasks completed</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-white transition-all duration-700 ease-out" 
              style={{ width: `${completionRate}%` }} 
            />
          </div>
          {motivationalMessage && (
            <p className="mt-4 text-sm text-indigo-50 italic font-medium">“{motivationalMessage}”</p>
          )}
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </Card>

      {/* Schedule View */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Daily Schedule</h3>
        
        {totalCount === 0 ? (
          <Card variant="outline" className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No tasks planned for today.</p>
            <p className="text-sm text-gray-400 mb-4">Add some tasks to get started!</p>
            <Button variant="secondary" size="sm" onClick={onAddTask}>Add First Task</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <Card 
                key={task.id} 
                className={`group flex items-center gap-4 transition-all hover:border-gray-300 ${
                  task.status === 'completed' ? 'opacity-60' : ''
                }`}
              >
                <button 
                  onClick={() => onToggleTask(task.id)}
                  className="flex-shrink-0 transition-transform active:scale-90"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-200 group-hover:text-primary/50" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className={`font-medium truncate ${task.status === 'completed' ? 'line-through' : ''}`}>
                      {task.title}
                    </h4>
                    <Badge variant={
                      task.type === 'study' ? 'info' : 
                      task.type === 'fitness' ? 'success' : 
                      'warning'
                    } className="capitalize py-0 px-1.5 h-4">
                      {task.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.scheduledTime || 'Not scheduled'}
                    </span>
                    <span>•</span>
                    <span>{task.duration} mins</span>
                  </div>
                </div>

                {task.priority === 'high' && task.status !== 'completed' && (
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
