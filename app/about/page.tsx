import React from 'react';
import { Mail, Globe, Phone, MapPin, ExternalLink, Code2, Zap, Server, Brain, Link as LinkIcon } from 'lucide-react';
import { personalInfo } from '../../portfolio';

export default function AboutPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white mb-4">حول المنصة والمطور</h1>
        <p className="text-gray-400 text-lg">تعرف على الرؤية وراء مشروع "إسلامي" والمطور القائم عليه.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: About Me */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-[#1e2329] border border-[#2d3748] rounded-[2rem] p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-2 h-6 bg-cyan-500 rounded-full"></div>
              عن المطور
            </h2>
            <div className="space-y-6 text-gray-300 leading-relaxed text-lg font-arabic">
              <p>{personalInfo.bio.chapter1.text}</p>
              <p>{personalInfo.bio.chapter2.text}</p>
              <p>{personalInfo.bio.chapter3.text}</p>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalInfo.whatIBring.map((item, idx) => (
              <div key={idx} className="bg-[#1e2329] border border-[#2d3748] p-6 rounded-2xl">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <span className="text-cyan-400">{item.title}</span>
                </h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </section>
        </div>

        {/* Right Column: Contact & Stats */}
        <div className="space-y-6">
          <section className="bg-[#1e2329] border border-[#2d3748] rounded-[2rem] p-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-xl shadow-cyan-500/20 mb-4">
                {personalInfo.initials}
              </div>
              <h3 className="text-2xl font-black text-white">{personalInfo.shortName}</h3>
              <p className="text-cyan-400 text-sm font-medium">{personalInfo.title}</p>
            </div>

            <div className="space-y-4">
              <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-[#131619] border border-[#2d3748] text-gray-300 hover:text-white hover:border-cyan-500/50 transition-all">
                <Mail className="w-5 h-5 text-cyan-500" />
                <span className="text-sm truncate">{personalInfo.email}</span>
              </a>
              <a href={personalInfo.github} target="_blank" className="flex items-center gap-3 p-3 rounded-xl bg-[#131619] border border-[#2d3748] text-gray-300 hover:text-white hover:border-cyan-500/50 transition-all">
                <Globe className="w-5 h-5 text-gray-400" />
                <span className="text-sm">GitHub</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
              </a>
              <a href={personalInfo.linkedin} target="_blank" className="flex items-center gap-3 p-3 rounded-xl bg-[#131619] border border-[#2d3748] text-gray-300 hover:text-white hover:border-cyan-500/50 transition-all">
                <LinkIcon className="w-5 h-5 text-blue-500" />
                <span className="text-sm">LinkedIn</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
              </a>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#131619] border border-[#2d3748] text-gray-300">
                <MapPin className="w-5 h-5 text-red-500" />
                <span className="text-sm">{personalInfo.location}</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            {personalInfo.stats.map((stat, idx) => (
              <div key={idx} className="bg-[#1e2329] border border-[#2d3748] p-4 rounded-2xl text-center">
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
