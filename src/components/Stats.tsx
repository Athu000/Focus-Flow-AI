import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { TrendingUp, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { DailyStats, UserProfile } from '../types';

interface StatsProps {
  stats: DailyStats[];
  user: UserProfile;
}

export const Stats: React.FC<StatsProps> = ({ stats, user }) => {
  // Mock some data if stats are empty for visualization
  const displayStats = stats.length > 0 ? stats : [
    { date: 'Mon', completionRate: 65 },
    { date: 'Tue', completionRate: 80 },
    { date: 'Wed', completionRate: 45 },
    { date: 'Thu', completionRate: 90 },
    { date: 'Fri', completionRate: 75 },
    { date: 'Sat', completionRate: 60 },
    { date: 'Sun', completionRate: 85 },
  ].map(s => ({ ...s, id: s.date, uid: user.uid, completedTasks: 0, totalTasks: 0 }));

  const averageCompletion = Math.round(
    displayStats.reduce((acc, curr) => acc + curr.completionRate, 0) / displayStats.length
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
        <p className="text-gray-500 mt-1">Track your consistency and growth over time.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 p-6">
          <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Streak</p>
            <p className="text-2xl font-bold">{user.streak} Days</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg. Completion</p>
            <p className="text-2xl font-bold">{averageCompletion}%</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Completed</p>
            <p className="text-2xl font-bold">{stats.reduce((acc, curr) => acc + curr.completedTasks, 0)} Tasks</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-lg">Weekly Performance</h3>
          <Badge variant="info" className="gap-1">
            <Calendar className="w-3 h-3" />
            Last 7 Days
          </Badge>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                unit="%"
              />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="completionRate" radius={[6, 6, 0, 0]} barSize={40}>
                {displayStats.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.completionRate > 75 ? '#000' : entry.completionRate > 50 ? '#4b5563' : '#9ca3af'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
