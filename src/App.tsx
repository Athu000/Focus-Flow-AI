import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  deleteDoc,
  handleFirestoreError,
  OperationType,
  getDocFromServer
} from './firebase';
import { UserProfile, Task, DailyStats } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';
import { TaskForm } from './components/TaskForm';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { NightReview } from './components/NightReview';
import { Chat } from './components/Chat';
import ErrorBoundary from './components/ErrorBoundary';
import { format, startOfToday, addDays, addWeeks, addMonths, parseISO } from 'date-fns';
import { generateSchedule } from './services/geminiService';
import { Moon, Bell } from 'lucide-react';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showNightReview, setShowNightReview] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notifications, setNotifications] = useState<{ id: string, title: string, time: string }[]>([]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log("User detected:", firebaseUser.uid);
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            console.log("Creating new user profile...");
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'User',
              photoURL: firebaseUser.photoURL,
              settings: {
                wakeUpTime: '07:00',
                sleepTime: '23:00',
                workPreference: 'morning',
              },
              streak: 0,
              lastActiveDate: format(new Date(), 'yyyy-MM-dd'),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth listener error:", error);
        // If we can't fetch the user doc, we might still want to show the auth screen
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!user) return;

    const tasksQuery = query(collection(db, 'tasks'), where('uid', '==', user.uid));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));

    const statsQuery = query(collection(db, 'stats'), where('uid', '==', user.uid));
    const unsubscribeStats = onSnapshot(statsQuery, (snapshot) => {
      const statsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyStats));
      setStats(statsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'stats'));

    return () => {
      unsubscribeTasks();
      unsubscribeStats();
    };
  }, [user]);

  // Reminder Logic
  useEffect(() => {
    if (tasks.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');
      const currentTime = format(now, 'HH:mm');
      
      const upcomingTask = tasks.find(t => 
        t.date === todayStr && 
        t.status === 'pending' && 
        t.scheduledTime === currentTime
      );

      if (upcomingTask) {
        const notificationId = `${upcomingTask.id}_${currentTime}`;
        if (!notifications.find(n => n.id === notificationId)) {
          setNotifications(prev => [{
            id: notificationId,
            title: `Time for: ${upcomingTask.title}`,
            time: currentTime
          }, ...prev].slice(0, 5));
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('FocusFlow Reminder', {
              body: `It's time to start: ${upcomingTask.title}`,
            });
          }
        }
      }
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [tasks, notifications]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Test Connection
  useEffect(() => {
    async function testConnection() {
      try {
        console.log("Testing Firestore connection...");
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore connection test successful.");
      } catch (error: any) {
        console.error("Connection test error detail:", error);
        if (error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        } else if (error.message.includes('permission') || error.message.includes('denied')) {
          console.error("Permission denied on connection test. Rules might not be deployed correctly.");
        }
      }
    }
    testConnection();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("This domain is not authorized in Firebase. Please add the current URL to 'Authorized Domains' in the Firebase Console.");
      } else {
        alert("Login failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email login failed:", error);
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      
      // The auth listener will handle document creation
      console.log("Signup successful, waiting for auth listener...");
    } catch (error: any) {
      console.error("Email signup failed:", error);
      alert("Signup failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status: newStatus });
      
      // Handle Recurring Tasks
      if (newStatus === 'completed' && task.recurrence && task.recurrence !== 'none') {
        let nextDate = parseISO(task.date);
        
        if (task.recurrence === 'daily') nextDate = addDays(nextDate, 1);
        else if (task.recurrence === 'weekly') nextDate = addWeeks(nextDate, 1);
        else if (task.recurrence === 'monthly') nextDate = addMonths(nextDate, 1);

        const nextDateStr = format(nextDate, 'yyyy-MM-dd');
        
        const alreadyExists = tasks.some(t => t.title === task.title && t.date === nextDateStr && t.uid === user?.uid);
        
        if (!alreadyExists) {
          const newTaskRef = doc(collection(db, 'tasks'));
          const { id, status, date, ...rest } = task;
          await setDoc(newTaskRef, {
            ...rest,
            id: newTaskRef.id,
            status: 'pending',
            date: nextDateStr,
            createdAt: Date.now()
          });
        }
      }

      // Update stats for the task's date
      const taskDate = task.date;
      const statsId = `${taskDate}_${user?.uid}`;
      const dayTasks = tasks.filter(t => t.date === taskDate);
      const completedCount = dayTasks.filter(t => t.id === taskId ? newStatus === 'completed' : t.status === 'completed').length;
      
      await setDoc(doc(db, 'stats', statsId), {
        uid: user?.uid,
        date: taskDate,
        completedTasks: completedCount,
        totalTasks: dayTasks.length,
        completionRate: Math.round((completedCount / dayTasks.length) * 100)
      }, { merge: true });

    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const handleAddTask = async (taskData: Partial<Task>) => {
    const newTaskRef = doc(collection(db, 'tasks'));
    const newTask = { 
      ...taskData, 
      id: newTaskRef.id, 
      uid: user?.uid,
      date: selectedDate // Use selected date as default
    } as Task;
    try {
      await setDoc(newTaskRef, newTask);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const handleGenerateSchedule = async () => {
    if (!user) return;
    const dayTasks = tasks.filter(t => t.date === selectedDate && t.status !== 'completed');
    
    if (dayTasks.length === 0) return;

    const scheduledTimes = await generateSchedule(dayTasks, user);
    
    for (const item of scheduledTimes) {
      try {
        await updateDoc(doc(db, 'tasks', item.taskId), { scheduledTime: item.scheduledTime });
      } catch (error) {
        console.error(`Failed to update task ${item.taskId}:`, error);
      }
    }
  };

  const handleSaveSettings = async (settings: UserProfile['settings']) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { settings });
      setUser({ ...user, settings });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleConfirmPlan = async () => {
    setShowNightReview(false);
    const tomorrowStr = format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
    const skippedTasks = tasks.filter(t => t.date === selectedDate && (t.status === 'skipped' || t.status === 'pending'));
    
    for (const task of skippedTasks) {
      try {
        await updateDoc(doc(db, 'tasks', task.id), { 
          date: tomorrowStr,
          status: 'rescheduled'
        });
      } catch (error) {
        console.error(`Failed to reschedule task ${task.id}:`, error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-energetic-bg">
        <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Auth 
        onGoogleLogin={handleGoogleLogin} 
        onEmailLogin={handleEmailLogin}
        onEmailSignUp={handleEmailSignUp}
        loading={loading} 
      />
    );
  }

  return (
    <ErrorBoundary>
      <Layout 
        user={user} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      >
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {notifications.length > 0 && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
                {notifications.map(n => (
                  <Card key={n.id} className="bg-blue-50 border-blue-100 flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-900">{n.title}</p>
                        <p className="text-xs text-blue-600">Scheduled for {n.time}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}>
                      Dismiss
                    </Button>
                  </Card>
                ))}
              </div>
            )}
            <Dashboard 
              tasks={tasks} 
              user={user} 
              onToggleTask={handleToggleTask}
              onAddTask={() => setShowTaskForm(true)}
              onGenerateSchedule={handleGenerateSchedule}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            <div className="flex justify-center pt-10">
              <Button variant="secondary" onClick={() => setShowNightReview(true)} className="gap-2 px-10 py-6 text-lg border-gray-200 shadow-sm">
                <Moon className="w-5 h-5" />
                Review Day
              </Button>
            </div>
          </div>
        )}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">All Tasks</h1>
              <Button size="sm" onClick={() => setShowTaskForm(true)}>Add Task</Button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {tasks.filter(t => t.date === selectedDate).map(task => (
                <Card 
                  key={task.id} 
                  className={`group flex items-center gap-4 transition-all hover:border-gray-300 ${
                    task.status === 'completed' ? 'opacity-60' : ''
                  }`}
                >
                  <button 
                    onClick={() => handleToggleTask(task.id)}
                    className="flex-shrink-0 transition-transform active:scale-90"
                  >
                    {task.status === 'completed' ? (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
                        <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-slate-200 rounded-full group-hover:border-primary/50" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{task.title}</h4>
                    <p className="text-xs text-gray-400">{task.scheduledTime || 'Not scheduled'}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'chat' && <Chat />}
        {activeTab === 'stats' && <Stats stats={stats} user={user} />}
        {activeTab === 'settings' && <Settings user={user} onSave={handleSaveSettings} />}

        {showTaskForm && (
          <TaskForm 
            onClose={() => setShowTaskForm(false)} 
            onSave={handleAddTask} 
          />
        )}

        {showNightReview && (
          <NightReview 
            tasks={tasks.filter(t => t.date === selectedDate)} 
            user={user} 
            onConfirm={handleConfirmPlan} 
          />
        )}
      </Layout>
    </ErrorBoundary>
  );
}
