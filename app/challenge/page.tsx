'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Swords, Loader2, CheckCircle2, XCircle, Trophy, Star, Timer, Users } from 'lucide-react';

interface Question {
  id: number;
  q: string;
  answers: { answer: string }[];
  correctIndex: number;
}

interface Session {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_username: string;
  player2_username: string;
  questions: Question[];
  player1_score: number;
  player2_score: number;
  player1_done: boolean;
  player2_done: boolean;
  winner_id: string | null;
  status: string;
}

type Stage = 'idle' | 'waiting' | 'playing' | 'submitted' | 'done';

export default function ChallengePage() {
  const { user } = useAuth();
  const [stage, setStage] = React.useState<Stage>('idle');
  const [session, setSession] = React.useState<Session | null>(null);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [myScore, setMyScore] = React.useState<number | null>(null);
  const [opponentScore, setOpponentScore] = React.useState<number | null>(null);
  const [opponentUsername, setOpponentUsername] = React.useState('');
  const [timer, setTimer] = React.useState(300);
  const [error, setError] = React.useState('');

  const pollingRef = React.useRef<ReturnType<typeof setInterval>>(undefined);
  const timerRef = React.useRef<ReturnType<typeof setInterval>>(undefined);

  React.useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const joinQueue = async () => {
    if (!user) return;
    setError('');
    const res = await fetch('/api/challenge/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, username: user.username }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); return; }
    if (data.matched) {
      startGame(data.session);
    } else {
      setStage('waiting');
      startPolling();
    }
  };

  const startPolling = () => {
    pollingRef.current = setInterval(async () => {
      if (!user) return;
      const res = await fetch(`/api/challenge/status?user_id=${user.id}`);
      const data = await res.json();
      if (data.session) {
        clearInterval(pollingRef.current);
        startGame(data.session);
      }
    }, 3000);
  };

  const startGame = (s: any) => {
    const isPlayer1 = s.player1_id === user?.id;
    setSession(s);
    setOpponentUsername(isPlayer1 ? s.player2_username : s.player1_username);
    setAnswers({});
    setTimer(300);
    setStage('playing');

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const selectAnswer = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitAnswers = async () => {
    if (!session || !user) return;
    setStage('submitted');
    if (timerRef.current) clearInterval(timerRef.current);

    const formatted = Object.entries(answers).map(([qId, selected]) => ({
      question_id: Number(qId), selected
    }));

    const res = await fetch('/api/challenge/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id, user_id: user.id, answers: formatted }),
    });
    const data = await res.json();
    setMyScore(data.score);

    const pollDone = setInterval(async () => {
      const r = await fetch(`/api/challenge/session/${session.id}`);
      const s: Session = await r.json();
      if (s.status === 'completed') {
        clearInterval(pollDone);
        const isP1 = s.player1_id === user.id;
        setOpponentScore(isP1 ? s.player2_score : s.player1_score);
        setStage('done');
      }
    }, 2000);
  };

  if (!user) {
    return (
      <div className="p-8 text-center py-20">
        <Swords className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">سجل الدخول أولاً</h2>
        <p className="text-[var(--text-muted)]">يجب تسجيل الدخول للمشاركة في التحديات</p>
      </div>
    );
  }

  const allAnswered = session && Object.keys(answers).length === session.questions.length;
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
          <Swords className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">التحدي</h1>
          <p className="text-[var(--text-secondary)]">تنافس مع الآخرين في الأسئلة الإسلامية</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl mb-6 text-center font-bold border border-red-500/20">
          {error}
        </div>
      )}

      {stage === 'idle' && (
        <div className="text-center py-12">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-6 border-4 border-amber-500/20">
            <Users className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">تحدٍ جديد</h2>
          <p className="text-[var(--text-muted)] mb-2">10 أسئلة إسلامية — الفائز يأخذ 10 نجوم</p>
          <p className="text-xs text-amber-400/70 mb-8">يجب أن يكون لديك 10 نجوم على الأقل للمشاركة</p>
          <button
            onClick={joinQueue}
            className="px-10 py-4 bg-amber-500 hover:bg-amber-600 text-black rounded-2xl font-black text-lg transition-all shadow-xl shadow-amber-500/20"
          >
            <Swords className="w-5 h-5 inline ml-2" />
            ابحث عن متحدٍ
          </button>
        </div>
      )}

      {stage === 'waiting' && (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">جاري البحث عن متحدٍ...</h2>
          <p className="text-[var(--text-muted)]">سيتم العثور على خصم قريباً</p>
          <button
            onClick={async () => {
              if (!user) return;
              await fetch('/api/challenge/leave', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id }),
              });
              if (pollingRef.current) clearInterval(pollingRef.current);
              setStage('idle');
            }}
            className="mt-8 px-6 py-3 bg-red-500/10 text-red-400 rounded-xl font-bold hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            إلغاء
          </button>
        </div>
      )}

      {stage === 'playing' && session && (
        <div>
          <div className="flex items-center justify-between mb-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-[var(--text-primary)]">مواجهة: {opponentUsername}</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <Timer className="w-5 h-5" />
              <span className="font-black text-lg font-sans">{minutes}:{seconds.toString().padStart(2, '0')}</span>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            {session.questions.map((q, idx) => (
              <div key={q.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                  <p className="font-bold text-[var(--text-primary)]">{q.q}</p>
                </div>
                <div className="space-y-2 pr-9">
                  {q.answers.map((a, ai) => (
                    <button
                      key={ai}
                      onClick={() => selectAnswer(q.id, ai)}
                      className={`w-full text-right p-3 rounded-xl border transition-all text-sm ${
                        answers[q.id] === ai
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                          : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-amber-500/20'
                      }`}
                    >
                      {a.answer}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={submitAnswers}
            disabled={!allAnswered}
            className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
              allAnswered
                ? 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-color)]'
            }`}
          >
            {allAnswered ? 'تأكيد الإجابات' : `أجب على جميع الأسئلة (${Object.keys(answers).length}/${session.questions.length})`}
          </button>
        </div>
      )}

      {stage === 'submitted' && (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">في انتظار نتيجة الخصم...</h2>
          <p className="text-[var(--text-muted)]">نقاطك: {myScore} / {session?.questions.length}</p>
        </div>
      )}

      {stage === 'done' && myScore !== null && opponentScore !== null && (
        <div className="text-center py-12">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border-4 border-amber-500/20">
            <Trophy className="w-12 h-12 text-amber-400" />
          </div>
          <h2 className="text-3xl font-black text-[var(--text-primary)] mb-4">
            {myScore > opponentScore ? 'فزت! 🎉' : myScore < opponentScore ? 'خسرت 😢' : 'تعادل!'}
          </h2>
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-4xl font-black text-emerald-400">{myScore}</p>
              <p className="text-sm text-[var(--text-muted)]">نقاطك</p>
            </div>
            <div className="text-3xl text-[var(--text-muted)]">:</div>
            <div className="text-center">
              <p className="text-4xl font-black text-blue-400">{opponentScore}</p>
              <p className="text-sm text-[var(--text-muted)]">{opponentUsername}</p>
            </div>
          </div>
          {myScore > opponentScore && (
            <div className="bg-amber-500/10 text-amber-400 px-6 py-3 rounded-2xl inline-flex items-center gap-2 font-bold border border-amber-500/20">
              <Star className="w-5 h-5 fill-amber-400" /> +10 نجوم!
            </div>
          )}
          <div className="mt-8">
            <button
              onClick={() => { setStage('idle'); setSession(null); setAnswers({}); setMyScore(null); setOpponentScore(null); }}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black rounded-2xl font-black text-lg transition-all shadow-xl shadow-amber-500/20"
            >
              تحدٍ جديد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
