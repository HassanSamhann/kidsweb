'use client';

import React, { useEffect, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface NameData {
  number: number;
  translation: string;
  meaning: string;
  audio?: string;
}

interface ApiResponse {
  code: number;
  status: string;
  data: {
    names: NameData[];
    total: number;
    hadith: string;
  };
}

export default function AsmaaAllahPage() {
  const [names, setNames] = useState<NameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState('');
  const [hadith, setHadith] = useState('');

  useEffect(() => {
    async function fetchNames() {
      try {
        const res = await fetch('https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/Allah-99-names.json');
        const json: ApiResponse = await res.json();
        if (json.code === 200) {
          setNames(json.data.names);
          setHadith(json.data.hadith);
        }
      } catch (err) {
        console.error('Error fetching 99 Names:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNames();
  }, []);

  const filtered = search
    ? names.filter(n => n.translation.includes(search) || n.meaning.includes(search))
    : names;

  const toggleExpand = (num: number) => {
    setExpanded(prev => ({ ...prev, [num]: !prev[num] }));
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <div className="w-2 h-8 bg-rose-500 rounded-full"></div>
          أسماء الله الحسنى
        </h1>
        <p className="text-gray-400 font-medium">99 اسماً لله تعالى</p>
      </header>

      {/* Search */}
      <div className="relative max-w-md mb-8">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="ابحث عن اسم..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#1e2329] border border-[#2d3748] rounded-2xl py-3 pr-12 pl-6 text-gray-200 focus:outline-none focus:border-rose-500/50 transition-all text-right"
        />
      </div>

      {/* Hadith */}
      {hadith && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 mb-8 text-right">
          <p className="text-gray-300 leading-relaxed text-sm">{hadith}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><LoadingSpinner size={48} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((name) => {
            const isOpen = expanded[name.number];
            return (
              <div
                key={name.number}
                onClick={() => toggleExpand(name.number)}
                className="bg-[#1e2329] rounded-2xl border border-[#2d3748] hover:border-rose-500/40 transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center font-black shrink-0">
                    {name.number}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xl font-black text-white font-arabic">{name.translation}</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
                  <div className="px-5 pb-5 pt-0 border-t border-[#2d3748] mt-2">
                    <p className="text-gray-400 leading-relaxed text-sm pt-3">{name.meaning}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center p-12 text-gray-500">لا توجد نتائج للبحث</div>
      )}
    </div>
  );
}
