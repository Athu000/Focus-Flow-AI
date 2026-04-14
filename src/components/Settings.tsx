import React, { useState } from 'react';
import { User, Moon, Sun, Bell, Shield, Save } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { UserProfile } from '../types';

interface SettingsProps {
  user: UserProfile;
  onSave: (settings: UserProfile['settings']) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onSave }) => {
  const [wakeUpTime, setWakeUpTime] = useState(user.settings.wakeUpTime);
  const [sleepTime, setSleepTime] = useState(user.settings.sleepTime);
  const [workPreference, setWorkPreference] = useState(user.settings.workPreference);

  const handleSave = () => {
    onSave({
      wakeUpTime,
      sleepTime,
      workPreference,
    });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your preferences and account.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gray-50 rounded-xl text-gray-600">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Daily Routine</h3>
              <p className="text-sm text-gray-500">Set your active hours for better scheduling.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Wake Up Time</label>
              <Input 
                type="time" 
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Sleep Time</label>
              <Input 
                type="time" 
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Work Preference</label>
            <div className="flex gap-4">
              <button
                onClick={() => setWorkPreference('morning')}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  workPreference === 'morning' 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                }`}
              >
                <Sun className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-bold text-sm">Morning Person</p>
                  <p className="text-[10px] opacity-60">Best work before noon</p>
                </div>
              </button>
              <button
                onClick={() => setWorkPreference('night')}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  workPreference === 'night' 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                }`}
              >
                <Moon className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-bold text-sm">Night Owl</p>
                  <p className="text-[10px] opacity-60">Best work after 8pm</p>
                </div>
              </button>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gray-50 rounded-xl text-gray-600">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Notifications</h3>
              <p className="text-sm text-gray-500">Stay on track with timely alerts.</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Browser Notifications</p>
                <p className="text-xs text-gray-500">Enable to get task reminders</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">Enable</Button>
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="gap-2 px-8">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
