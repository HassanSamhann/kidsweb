'use client';

import React from 'react';
import { Compass, MapPin, Construction } from 'lucide-react';

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
  const [position, setPosition] = React.useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = React.useState('');
  const [qiblaAngle, setQiblaAngle] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

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
  }, []);

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
          <div className="w-12 h-12 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">جاري تحديد موقعك...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-[var(--text-muted)]">{error}</p>
        </div>
      )}

      {!loading && !error && position && (
        <div className="text-center">
          {/* Compass preview — coming soon */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            {/* Compass ring */}
            <div className="absolute inset-0 rounded-full border-4 border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-full h-full">
                <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-red-400">N</span>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-[var(--text-muted)]">S</span>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">W</span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">E</span>
              </div>
            </div>

            {/* Blur overlay */}
            <div className="absolute inset-0 rounded-full backdrop-blur-sm bg-[var(--bg-card)]/60 flex flex-col items-center justify-center z-10">
              <Construction className="w-10 h-10 text-amber-400 mb-2" />
              <span className="text-2xl font-black text-amber-400">قريباً</span>
              <span className="text-xs text-[var(--text-muted)] mt-1">البوصلة قيد التطوير</span>
            </div>

            {/* Static Kaaba icon */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-0 pointer-events-none">
              <div className="w-6 h-6 rounded-md bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center">
                <span className="text-emerald-400 text-[10px] font-black">ﷲ</span>
              </div>
            </div>

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-4 h-4 rounded-full bg-emerald-500 border-4 border-[var(--bg-card)] shadow-lg" />
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
          </div>

          <p className="text-xs text-[var(--text-muted)] mt-6">
            سيتم إضافة البوصلة التفاعلية قريباً
          </p>
        </div>
      )}
    </div>
  );
}
