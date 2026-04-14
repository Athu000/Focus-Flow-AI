export type TaskType = 'study' | 'fitness' | 'habit';
export type TaskStatus = 'pending' | 'completed' | 'skipped' | 'rescheduled';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  uid: string;
  title: string;
  type: TaskType;
  duration: number; // in minutes
  status: TaskStatus;
  preferredTime?: string; // e.g., "morning", "afternoon", "evening"
  scheduledTime?: string; // ISO string or specific time
  date: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  recurrence?: RecurrenceType;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  settings: {
    wakeUpTime: string; // "07:00"
    sleepTime: string; // "23:00"
    workPreference: 'morning' | 'night';
  };
  streak: number;
  lastActiveDate: string;
}

export interface DailyStats {
  id: string; // date_uid
  uid: string;
  date: string;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
}
