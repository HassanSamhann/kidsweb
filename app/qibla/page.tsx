'use client';

import React, { useState, useEffect } from 'react';
import { Compass, MapPin, RotateCcw, AlertCircle, Smartphone } from 'lucide-react';

const MECCA = { lat: 21.4225, lng: 39.8262 };

function toRad(deg: number) { return deg * Math.PI / 180; }
function toDeg(rad: number) { return rad * 180 / Math.PI; }

function calcQibla(lat: number, lng: number): number {
  const φ1 = toRad(lat), φ2 = toRad(MECCA.lat);
  const Δλ = toRad(MECCA.lng - lng);
  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export default function QiblaPage() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [loading, setLoading] = useState(true);

  // Device orientation states
  const [heading, setHeading] = useState<number | null>(null);
  const [sensorPermission, setSensorPermission] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');

  const fetchLocation = () => {
    setLoading(true);
    setError('');
    if (!navigator.geolocation) {
      setError('متصفحك لا يدعم تحديد الموقع الجغرافي');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setQiblaAngle(calcQibla(latitude, longitude));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError('الرجاء السماح بالوصول إلى الموقع لتحديد اتجاه القبلة بدقة');
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  // Handle device orientation events
  const handleOrientation = (e: any) => {
    let currentHeading = null;
    
    // iOS Safari
    if (e.webkitCompassHeading !== undefined) {
      currentHeading = e.webkitCompassHeading;
    } 
    // Android / standards (absolute orientation)
    else if (e.alpha !== undefined) {
      currentHeading = 360 - e.alpha;
    }

    if (currentHeading !== null) {
      setHeading(Math.round(currentHeading));
    }
  };

  // Request compass sensor permission (needed for iOS Safari)
  const startCompass = async () => {
    if (typeof window === 'undefined') return;

    const DeviceOrientationEventClass = (window as any).DeviceOrientationEvent;
    
    // Check if permission request is needed (iOS Safari 13+)
    if (DeviceOrientationEventClass && typeof DeviceOrientationEventClass.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientationEventClass.requestPermission();
        setSensorPermission(permissionState);
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
        }
      } catch (err) {
        console.error('Error requesting orientation permission:', err);
        setSensorPermission('denied');
      }
    } else {
      // Android / Desktop - listen directly
      setSensorPermission('granted');
      if ('ondeviceorientationabsolute' in (window as any)) {
        (window as any).addEventListener('deviceorientationabsolute', handleOrientation, true);
      } else {
        (window as any).addEventListener('deviceorientation', handleOrientation, true);
      }
    }
  };

  // Auto-detect and listen for orientation if permission is not required (Android / standard)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const DeviceOrientationEventClass = (window as any).DeviceOrientationEvent;
      const requiresPermission = DeviceOrientationEventClass && typeof DeviceOrientationEventClass.requestPermission === 'function';

      if (!requiresPermission) {
        setSensorPermission('granted');
        if ('ondeviceorientationabsolute' in (window as any)) {
          (window as any).addEventListener('deviceorientationabsolute', handleOrientation, true);
        } else {
          (window as any).addEventListener('deviceorientation', handleOrientation, true);
        }
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation, true);
        window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      }
    };
  }, []);

  // Calculate rotation angles
  // The compass card face rotates counter-clockwise by `heading` to align North to real North.
  const compassRotation = heading !== null ? -heading : 0;
  // The relative angle of Qibla relative to the top of the phone
  const qiblaRelativeAngle = heading !== null ? (qiblaAngle - heading + 360) % 360 : qiblaAngle;
  
  // Check if phone is aligned with Qibla (±5 degrees)
  const isAligned = heading !== null && Math.abs(((qiblaRelativeAngle + 180) % 360) - 180) < 5;

  // Trigger brief vibration on alignment
  useEffect(() => {
    if (isAligned && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, [isAligned]);

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">اتجاه القبلة</h1>
            <p className="text-[var(--text-secondary)]">حدد اتجاه القبلة بدقة من موقعك الحالي</p>
          </div>
        </div>
        <button
          onClick={fetchLocation}
          className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-gray-400 hover:text-white transition"
          title="تحديث الموقع"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {loading && (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">جاري تحديد موقعك الجغرافي...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] p-8">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-[var(--text-primary)] font-bold mb-4">{error}</p>
          <button 
            onClick={fetchLocation}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {!loading && !error && position && (
        <div className="text-center space-y-6">
          
          {/* Compass Display */}
          <div className="relative w-72 h-72 mx-auto mt-4">
            {/* Glow Ring when Aligned */}
            <div className={`absolute inset-0 rounded-full transition-all duration-500 -z-10 ${
              isAligned 
                ? 'bg-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.4)] scale-105' 
                : 'bg-transparent'
            }`} />

            {/* Compass Card Face */}
            <div 
              style={{ transform: `rotate(${compassRotation}deg)` }}
              className="absolute inset-0 rounded-full border-4 border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl transition-transform duration-200 ease-out flex items-center justify-center"
            >
              {/* Compass Card markings */}
              <div className="absolute inset-2 rounded-full border border-gray-800/20 pointer-events-none" />
              
              {/* Card Directions */}
              <span className="absolute top-4 text-sm font-black text-red-500">N</span>
              <span className="absolute bottom-4 text-sm font-bold text-gray-500">S</span>
              <span className="absolute left-4 text-sm font-bold text-gray-500">W</span>
              <span className="absolute right-4 text-sm font-bold text-gray-500">E</span>

              {/* Degrees markers */}
              <div className="absolute inset-0 rotate-45 pointer-events-none text-[8px] text-gray-700">
                <span className="absolute top-4 left-1/2 -translate-x-1/2">NE</span>
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2">SW</span>
              </div>
              <div className="absolute inset-0 -rotate-45 pointer-events-none text-[8px] text-gray-700">
                <span className="absolute top-4 left-1/2 -translate-x-1/2">NW</span>
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2">SE</span>
              </div>
            </div>

            {/* Qibla Needle (points to Mecca relative to the device orientation) */}
            <div 
              style={{ transform: `rotate(${qiblaRelativeAngle}deg)` }}
              className="absolute inset-0 transition-transform duration-200 ease-out pointer-events-none z-10"
            >
              {/* Mecca Icon / Indicator at the Qibla Angle */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border shadow-lg ${
                  isAligned 
                    ? 'bg-emerald-500 border-emerald-400 text-white scale-125' 
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                }`}>
                  <span className="text-sm font-black font-arabic">🕋</span>
                </div>
                {/* Arrow pointing to Mecca */}
                <div className={`w-1 h-32 mt-1 transition-colors duration-300 bg-gradient-to-b ${
                  isAligned ? 'from-emerald-400 to-emerald-500/20' : 'from-amber-400 to-amber-500/10'
                }`} />
              </div>
            </div>

            {/* Center Cap */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className={`w-5 h-5 rounded-full border-4 border-[var(--bg-card)] shadow-lg transition-colors duration-300 ${
                isAligned ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
            </div>
          </div>

          {/* Heading state banner */}
          {heading !== null ? (
            <div className={`p-4 rounded-2xl border transition-all ${
              isAligned 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-bounce-slow' 
                : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)]'
            }`}>
              {isAligned ? (
                <p className="font-extrabold text-lg flex items-center justify-center gap-2">
                  <span>🕋 أنت تواجه اتجاه القبلة الآن</span>
                </p>
              ) : (
                <p className="font-bold text-sm">
                  أدر الهاتف باتجاه علامة الكعبة {qiblaRelativeAngle.toFixed(0)}°
                </p>
              )}
            </div>
          ) : (
            sensorPermission === 'default' && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 text-center">
                <Smartphone className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-pulse" />
                <h3 className="font-bold text-white mb-2">تفعيل البوصلة التفاعلية</h3>
                <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                  الرجاء تفعيل حساس الحركة والاتجاه لكي تدور البوصلة تلقائياً مع دوران هاتفك.
                </p>
                <button
                  onClick={startCompass}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition w-full shadow-lg shadow-emerald-600/10"
                >
                  تشغيل الحساس 🧭
                </button>
              </div>
            )
          )}

          {/* Position details */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <span className="text-sm text-[var(--text-muted)]">زاوية القبلة من الشمال</span>
              <span className="text-lg font-black text-emerald-400">{qiblaAngle.toFixed(0)}°</span>
            </div>
            
            {heading !== null && (
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <span className="text-sm text-[var(--text-muted)]">اتجاه الهاتف الحالي</span>
                <span className="text-lg font-black text-amber-400">{heading}°</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">إحداثيات موقعك</span>
              <span className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {position.lat.toFixed(4)}°, {position.lng.toFixed(4)}°
              </span>
            </div>
          </div>

          {heading === null && sensorPermission !== 'default' && (
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              شاشتك لا تدعم الحساس التفاعلي (كمبيوتر مكتبي). يمكنك الاستعانة بالزاوية {qiblaAngle.toFixed(0)}° من الشمال لتحديد القبلة.
            </p>
          )}

        </div>
      )}
    </div>
  );
}
