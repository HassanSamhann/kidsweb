'use client';

import React from 'react';
import { Compass, MapPin, Loader2, AlertCircle, Smartphone, RotateCcw } from 'lucide-react';

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

const SMOOTHING = 0.2;

export default function QiblaPage() {
  const [position, setPosition] = React.useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = React.useState('');
  const [qiblaAngle, setQiblaAngle] = React.useState(0);
  const [heading, setHeading] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [orientationPermission, setOrientationPermission] = React.useState<'unknown' | 'granted' | 'denied'>('unknown');
  const headingRef = React.useRef<number | null>(null);

  const requestOrientationPermission = React.useCallback(async () => {
    const devOrientation = (DeviceOrientationEvent as any);
    if (typeof devOrientation.requestPermission === 'function') {
      try {
        const result = await devOrientation.requestPermission();
        setOrientationPermission(result === 'granted' ? 'granted' : 'denied');
        return result === 'granted';
      } catch {
        setOrientationPermission('denied');
        return false;
      }
    }
    setOrientationPermission('granted');
    return true;
  }, []);

  React.useEffect(() => {
    if (!navigator.geolocation) {
      setError('متصفحك لا يدعم تحديد الموقع');
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
      () => {
        setError('الرجاء السماح بالوصول إلى الموقع لتحديد اتجاه القبلة');
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );

    requestOrientationPermission().then((granted) => {
      if (granted) {
        const handler = (event: DeviceOrientationEvent) => {
          let raw: number | null = null;

          if ('webkitCompassHeading' in event && (event as any).webkitCompassHeading !== null) {
            raw = (event as any).webkitCompassHeading;
          } else if (event.alpha !== null) {
            raw = event.alpha;
          }

          if (raw !== null) {
            const prev = headingRef.current;
            if (prev === null) {
              headingRef.current = raw;
              setHeading(raw);
            } else {
              let diff = raw - prev;
              if (diff > 180) diff -= 360;
              if (diff < -180) diff += 360;
              const smoothed = prev + diff * SMOOTHING;
              headingRef.current = smoothed;
              setHeading(smoothed);
            }
          }
        };

        window.addEventListener('deviceorientation', handler);
        return () => window.removeEventListener('deviceorientation', handler);
      }
    });
  }, [requestOrientationPermission]);

  const compassRotation = heading !== null ? (qiblaAngle - heading) : -qiblaAngle;

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
          <Compass className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">اتجاه القبلة</h1>
          <p className="text-[var(--text-secondary)]">حدد اتجاه القبلة من موقعك</p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">جاري تحديد موقعك...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">{error}</p>
        </div>
      )}

      {!loading && !error && position && (
        <div className="text-center">
          {/* Compass */}
          <div className="relative w-72 h-72 mx-auto mb-8">
            {/* Compass ring */}
            <div className="absolute inset-0 rounded-full border-4 border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl" />
            
            {/* Direction labels */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-full h-full">
                <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-red-400">N</span>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-[var(--text-muted)]">S</span>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">W</span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">E</span>
              </div>
            </div>

            {/* Degree ticks */}
            {Array.from({ length: 72 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 left-1/2 -translate-x-1/2"
                style={{ transform: `rotate(${i * 5}deg)`, transformOrigin: 'bottom center' }}
              >
                <div className={`${i % 6 === 0 ? 'h-3 w-0.5 bg-gray-400' : 'h-1.5 w-px bg-gray-600'} mx-auto`} style={{ marginTop: '4px' }} />
              </div>
            ))}

            {/* Compass needle */}
            <div
              className="absolute inset-0"
              style={{
                transform: `rotate(${compassRotation}deg)`,
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[28px] border-l-transparent border-r-transparent border-b-emerald-500 drop-shadow-lg" />
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[16px] border-l-transparent border-r-transparent border-t-gray-400" />
              </div>
            </div>

            {/* Kaaba icon */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: `rotate(${compassRotation}deg)`,
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
                <div className="w-6 h-6 rounded-md bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center">
                  <span className="text-emerald-400 text-[10px] font-black">ﷲ</span>
                </div>
              </div>
            </div>

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-5 h-5 rounded-full bg-emerald-500 border-4 border-[var(--bg-card)] shadow-lg" />
            </div>
          </div>

          {/* Info */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">اتجاه القبلة</span>
              <span className="text-2xl font-black text-emerald-400">{qiblaAngle.toFixed(0)}°</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">الموقع</span>
              <span className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {position.lat.toFixed(4)}°, {position.lng.toFixed(4)}°
              </span>
            </div>
            {heading !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">اتجاه الجهاز</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">{Math.round(heading)}°</span>
              </div>
            )}
          </div>

          {heading === null && (
            <div className="mt-6 space-y-3">
              <p className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" />
                حرّك الجهاز على شكل رقم 8 لمعايرة البوصلة
              </p>
              {navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') ? (
                <button
                  onClick={requestOrientationPermission}
                  className="px-6 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-500/20 transition-colors"
                >
                  <Smartphone className="w-4 h-4 inline ml-2" />
                  السماح بحساس الحركة
                </button>
              ) : null}
            </div>
          )}

          {heading !== null && (
            <p className="text-xs text-[var(--text-muted)] mt-4">
              أمسك الجهاز بشكل مسطح ومستوي للحصول على أدق اتجاه
            </p>
          )}
        </div>
      )}
    </div>
  );
}
