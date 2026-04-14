import React, { useState, useEffect } from 'react';
import { format, startOfToday } from 'date-fns';
import { Moon, Star, ArrowRight, RefreshCw } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Task, UserProfile } from '../types';
import { suggestAdjustments } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface NightReviewProps {
  tasks: Task[];
  user: UserProfile;
  onConfirm: () => void;
}

export const NightReview: React.FC<NightReviewProps> = ({ tasks, user, onConfirm }) => {
  const [suggestions, setSuggestions] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const todayStr = format(startOfToday(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const completedTasks = todayTasks.filter(t => t.status === 'completed');
  const skippedTasks = todayTasks.filter(t => t.status === 'skipped' || t.status === 'pending');
  const completionRate = todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0;

  useEffect(() => {
    if (skippedTasks.length > 0) {
      suggestAdjustments(skippedTasks, user).then(res => {
        setSuggestions(res);
        setLoading(false);
      });
    } else {
      setSuggestions("Amazing work today! You crushed all your goals. Get some rest!");
      setLoading(false);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
        <div className="bg-black p-8 text-white text-center relative">
          <Moon className="w-12 h-12 mx-auto mb-4 text-yellow-200 animate-pulse" />
          <h2 className="text-3xl font-bold mb-2">Nightly Review</h2>
          <p className="text-gray-400">Reflecting on your day and preparing for tomorrow.</p>
          
          <div className="absolute top-4 right-4">
            <Badge variant="success" className="bg-white/10 text-white border-white/20">
              {completionRate}% Done
            </Badge>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed</p>
              <p className="text-3xl font-bold">{completedTasks.length}</p>
              <div className="flex flex-wrap gap-1">
                {completedTasks.slice(0, 3).map(t => (
                  <Badge key={t.id} variant="success" className="text-[10px]">{t.title}</Badge>
                ))}
                {completedTasks.length > 3 && <span className="text-[10px] text-gray-400">+{completedTasks.length - 3} more</span>}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Missed</p>
              <p className="text-3xl font-bold">{skippedTasks.length}</p>
              <div className="flex flex-wrap gap-1">
                {skippedTasks.slice(0, 3).map(t => (
                  <Badge key={t.id} variant="danger" className="text-[10px]">{t.title}</Badge>
                ))}
                {skippedTasks.length > 3 && <span className="text-[10px] text-gray-400">+{skippedTasks.length - 3} more</span>}
              </div>
            </div>
          </div>

          <Card variant="outline" className="bg-gray-50 border-none p-6">
            <div className="flex items-center gap-2 mb-3 text-black">
              <Star className="w-4 h-4 fill-black" />
              <h3 className="font-bold text-sm uppercase tracking-tight">AI Coach Suggestions</h3>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm italic">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Thinking...
              </div>
            ) : (
              <div className="text-gray-700 text-sm leading-relaxed prose prose-sm">
                <ReactMarkdown>{suggestions}</ReactMarkdown>
              </div>
            )}
          </Card>

          <Button onClick={onConfirm} className="w-full py-6 text-lg gap-2">
            Confirm Plan for Tomorrow
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
