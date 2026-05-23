'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface NotificationSettings {
  morningAzkarEnabled: boolean;
  morningAzkarTime: string;
  eveningAzkarEnabled: boolean;
  eveningAzkarTime: string;
  wakingAzkarEnabled: boolean;
  wakingAzkarTime: string;
  sleepAzkarEnabled: boolean;
  sleepAzkarTime: string;
  surahReminderEnabled: boolean;
  surahReminderTime: string;
  surahId: number;
  surahName: string;
  prayerRemindersEnabled: boolean;
  prayerMinutesBefore: number;
  prayerCity: string;
  soundEnabled: boolean;
  nativeEnabled: boolean;
}

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type: 'azkar' | 'prayer' | 'surah' | 'system';
  timestamp: Date;
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  permissionStatus: NotificationPermission;
  requestNativePermission: () => Promise<boolean>;
  activeNotifications: InAppNotification[];
  dismissNotification: (id: string) => void;
  triggerTestNotification: () => void;
  prayerTimings: Record<string, string> | null;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  morningAzkarEnabled: true,
  morningAzkarTime: '07:00',
  eveningAzkarEnabled: true,
  eveningAzkarTime: '17:00',
  wakingAzkarEnabled: true,
  wakingAzkarTime: '06:00',
  sleepAzkarEnabled: true,
  sleepAzkarTime: '21:30',
  surahReminderEnabled: true,
  surahReminderTime: '15:00',
  surahId: 18,
  surahName: 'الكهف',
  prayerRemindersEnabled: true,
  prayerMinutesBefore: 15,
  prayerCity: 'Cairo',
  soundEnabled: true,
  nativeEnabled: true,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Web Audio API custom chime synthesizer
export function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a lovely double-tone chime
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    playTone(523.25, now, 0.4); // C5
    playTone(659.25, now + 0.12, 0.5); // E5
    playTone(783.99, now + 0.24, 0.6); // G5
  } catch (e) {
    console.error('Failed to play custom synthesized chime:', e);
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [activeNotifications, setActiveNotifications] = useState<InAppNotification[]>([]);
  const [prayerTimings, setPrayerTimings] = useState<Record<string, string> | null>(null);
  
  const lastCheckedMinute = useRef<string>('');

  // Load settings and check native permission
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load saved settings
    const savedSettings = localStorage.getItem('kidsweb_notification_settings');
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      } catch (e) {
        console.error('Failed to parse notification settings', e);
      }
    }

    // Check permission status
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Update settings and save to localStorage
  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('kidsweb_notification_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Request native notification permission
  const requestNativePermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      return permission === 'granted';
    } catch (e) {
      console.error('Failed to request notification permission', e);
      return false;
    }
  };

  // Dismiss an in-app notification
  const dismissNotification = (id: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Fire notification (In-app and native)
  const fireNotification = (title: string, body: string, type: 'azkar' | 'prayer' | 'surah' | 'system') => {
    // 1. Play sound if enabled
    if (settings.soundEnabled) {
      playNotificationChime();
    }

    // 2. Show in-app notification toast
    const newInApp: InAppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      body,
      type,
      timestamp: new Date(),
    };
    setActiveNotifications(prev => [newInApp, ...prev].slice(0, 5)); // Keep last 5

    // 3. Show native browser notification if allowed
    if (settings.nativeEnabled && permissionStatus === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        new Notification(title, {
          body,
          icon: '/icon.png',
          dir: 'rtl',
        });
      } catch (e) {
        console.error('Failed to trigger native notification:', e);
      }
    }
  };

  // Trigger a test notification
  const triggerTestNotification = () => {
    fireNotification(
      'تنبيه تجريبي من منصة إسلامي للأطفال! 🌟',
      'تهانينا يا بطل! نظام التنبيهات يعمل بشكل ممتاز، وسيقوم بتذكيرك بأذكار اليوم ومواقيت الصلاة.',
      'system'
    );
  };

  // Fetch Prayer Times for Notifications
  useEffect(() => {
    const fetchPrayerTimesForNotifications = async () => {
      const city = settings.prayerCity || 'Cairo';
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Egypt&method=5`
        );
        const json = await res.json();
        if (json.code === 200 && json.data?.timings) {
          const timings: Record<string, string> = {
            Fajr: json.data.timings.Fajr,
            Dhuhr: json.data.timings.Dhuhr,
            Asr: json.data.timings.Asr,
            Maghrib: json.data.timings.Maghrib,
            Isha: json.data.timings.Isha,
          };
          setPrayerTimings(timings);
        }
      } catch (err) {
        console.error('Error fetching prayer times for notifications:', err);
      }
    };

    fetchPrayerTimesForNotifications();
    // Refresh prayer times every 6 hours
    const interval = setInterval(fetchPrayerTimesForNotifications, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.prayerCity]);

  // Main notification scheduling and checking loop
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkSchedule = () => {
      const now = new Date();
      const currentHourMin = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Prevent running multiple times in the same minute
      if (lastCheckedMinute.current === currentHourMin) return;
      lastCheckedMinute.current = currentHourMin;

      const currentDateStr = now.toISOString().split('T')[0];
      
      // Load or initialize fired history
      const savedHistory = localStorage.getItem('kidsweb_fired_notifications');
      let history: Record<string, Record<string, boolean>> = {};
      if (savedHistory) {
        try {
          history = JSON.parse(savedHistory);
        } catch (e) {
          history = {};
        }
      }

      // Cleanup history older than today
      if (!history[currentDateStr]) {
        history = { [currentDateStr]: {} };
      }

      const todayFired = history[currentDateStr];

      const markAsFired = (key: string) => {
        todayFired[key] = true;
        history[currentDateStr] = todayFired;
        localStorage.setItem('kidsweb_fired_notifications', JSON.stringify(history));
      };

      // 1. Morning Azkar Reminder
      if (settings.morningAzkarEnabled && settings.morningAzkarTime === currentHourMin && !todayFired['morningAzkar']) {
        fireNotification(
          'صباح الخير والبركة يا بطل! ☀️',
          'حان وقت أذكار الصباح الجميلة لتحفظك وترعاك طوال اليوم بنور الله ونشاطه!',
          'azkar'
        );
        markAsFired('morningAzkar');
      }

      // 2. Evening Azkar Reminder
      if (settings.eveningAzkarEnabled && settings.eveningAzkarTime === currentHourMin && !todayFired['eveningAzkar']) {
        fireNotification(
          'مساء الخير والهدوء يا بطل! 🌙',
          'حان وقت أذكار المساء الدافئة لتقرأها وتنال حفظ الله ورعايته حتى تصبح!',
          'azkar'
        );
        markAsFired('eveningAzkar');
      }

      // 3. Waking Azkar Reminder
      if (settings.wakingAzkarEnabled && settings.wakingAzkarTime === currentHourMin && !todayFired['wakingAzkar']) {
        fireNotification(
          'استيقاظ مبارك ويوم سعيد! 🌅',
          'الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور. هيا نردد أذكار الاستيقاظ يا ذكي!',
          'azkar'
        );
        markAsFired('wakingAzkar');
      }

      // 4. Sleep Azkar Reminder
      if (settings.sleepAzkarEnabled && settings.sleepAzkarTime === currentHourMin && !todayFired['sleepAzkar']) {
        fireNotification(
          'تصبح على خير وسعادة يا بطل! 🌌',
          'حان وقت أذكار النوم الهادئة وسورة الملك لتنام في حفظ الله والملائكة تحرسك!',
          'azkar'
        );
        markAsFired('sleepAzkar');
      }

      // 5. Surah Reminder
      if (settings.surahReminderEnabled && settings.surahReminderTime === currentHourMin && !todayFired['surahReminder']) {
        fireNotification(
          'وقت قراءة القرآن الكريم! 📖✨',
          `يا بطل، حان موعدك المفضل لقراءة أو الاستماع إلى سورة ${settings.surahName} لتنير قلبك وعقلك!`,
          'surah'
        );
        markAsFired('surahReminder');
      }

      // 6. Prayer Approaching Reminders
      if (settings.prayerRemindersEnabled && prayerTimings) {
        const PRAYER_AR_NAMES: Record<string, string> = {
          Fajr: 'الفجر',
          Dhuhr: 'الظهر',
          Asr: 'العصر',
          Maghrib: 'المغرب',
          Isha: 'العشاء',
        };

        Object.entries(prayerTimings).forEach(([prayerKey, timeStr]) => {
          if (!timeStr) return;
          
          const [pHour, pMin] = timeStr.split(':').map(Number);
          const prayerTime = new Date();
          prayerTime.setHours(pHour, pMin, 0);
          
          // Calculate reminder time (X minutes before prayer)
          const reminderTime = new Date(prayerTime.getTime() - settings.prayerMinutesBefore * 60 * 1000);
          const reminderHourMin = `${reminderTime.getHours().toString().padStart(2, '0')}:${reminderTime.getMinutes().toString().padStart(2, '0')}`;
          
          if (reminderHourMin === currentHourMin && !todayFired[`prayer_${prayerKey}`]) {
            fireNotification(
              `اقتراب موعد صلاة ${PRAYER_AR_NAMES[prayerKey]} 🕌`,
              `يا بطل، متبقي ${settings.prayerMinutesBefore} دقيقة على أذان ${PRAYER_AR_NAMES[prayerKey]}. استعد وتوضأ لتفوز بأجر الصلاة جماعة!`,
              'prayer'
            );
            markAsFired(`prayer_${prayerKey}`);
          }
        });
      }
    };

    // Run check immediately on mount, then every 30 seconds
    checkSchedule();
    const interval = setInterval(checkSchedule, 30 * 1000);
    return () => clearInterval(interval);
  }, [settings, prayerTimings, permissionStatus]);

  return (
    <NotificationContext.Provider value={{
      settings,
      updateSettings,
      permissionStatus,
      requestNativePermission,
      activeNotifications,
      dismissNotification,
      triggerTestNotification,
      prayerTimings,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
