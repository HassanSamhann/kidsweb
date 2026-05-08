'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Swords, Loader2, Trophy, Star, Timer, Users, CheckCircle2, XCircle, MinusCircle, Eye } from 'lucide-react';

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
  player1_answers: Record<string, number>;
  player2_answers: Record<string, number>;
  winner_id: string | null;
  status: string;
}

type Stage = 'idle' | 'waiting' | 'playing' | 'review';

const TIME_PER_QUESTION = 30;

export default function ChallengePage() {
  const { user } = useAuth();
  const [stage, setStage] = React.useState<Stage>('idle');
  const [session, setSession] = React.useState<Session | null>(null);
  const [currentQ, setCurrentQ] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(TIME_PER_QUESTION);
  const [myAnswers, setMyAnswers] = React.useState<Record<number, number>>({});
  const [waitingForOpponent, setWaitingForOpponent] = React.useState(false);
  const [opponentUsername, setOpponentUsername] = React.useState('');
  const [myScore, setMyScore] = React.useState<number | null>(null);
  const [opponentScore, setOpponentScore] = React.useState<number | null>(null);
  const [error, setError] = React.useState('');

  const pollingRef = React.useRef<ReturnType<typeof setInterval>>(undefined);
  const questionTimerRef = React.useRef<ReturnType<typeof setInterval>>(undefined);
  const waitPollRef = React.useRef<ReturnType<typeof setInterval>>(undefined);

  const sessionRef = React.useRef(session);
  sessionRef.current = session;
  const currentQRef = React.useRef(currentQ);
  currentQRef.current = currentQ;
  const userRef = React.useRef(user);
  userRef.current = user;

  React.useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      if (waitPollRef.current) clearInterval(waitPollRef.current);
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
      const u = userRef.current;
      if (!u) return;
      const res = await fetch(`/api/challenge/status?user_id=${u.id}`);
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
    setMyAnswers({});
    setCurrentQ(0);
    setTimeLeft(TIME_PER_QUESTION);
    setWaitingForOpponent(false);
    setOpponentUsername(isPlayer1 ? s.player2_username : s.player1_username);
    setStage('playing');
    startQuestionTimer();
  };

  const startQuestionTimer = () => {
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    setTimeLeft(TIME_PER_QUESTION);
    questionTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(questionTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = React.useCallback(() => {
    handleAnswerAction(-1);
  }, []);

  React.useEffect(() => {
    if (timeLeft === 0 && stage === 'playing' && !waitingForOpponent) {
      handleTimeout();
    }
  }, [timeLeft, stage, waitingForOpponent, handleTimeout]);

  const handleAnswerAction = async (selected: number) => {
    const s = sessionRef.current;
    const u = userRef.current;
    if (!s || !u) return;
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    const qIdx = currentQRef.current;
    const res = await fetch('/api/challenge/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: s.id, user_id: u.id, q_index: qIdx, selected }),
    });
    const data = await res.json();

    setMyAnswers(prev => ({ ...prev, [qIdx]: selected }));

    if (data.completed) {
      setMyScore(data.my_score);
      setOpponentScore(data.opponent_score);
      setStage('review');
      return;
    }

    if (data.opponent_answered_this) {
      advanceToNext();
    } else {
      setWaitingForOpponent(true);
      startWaitPolling();
    }
  };

  const startWaitPolling = () => {
    if (waitPollRef.current) clearInterval(waitPollRef.current);
    waitPollRef.current = setInterval(async () => {
      const s = sessionRef.current;
      const u = userRef.current;
      const qIdx = currentQRef.current;
      if (!s || !u) return;

      const res = await fetch(`/api/challenge/session/${s.id}`);
      const fresh: Session = await res.json();

      if (fresh.status === 'completed') {
        clearInterval(waitPollRef.current);
        const p1 = u.id === fresh.player1_id;
        setMyScore(p1 ? fresh.player1_score : fresh.player2_score);
        setOpponentScore(p1 ? fresh.player2_score : fresh.player1_score);
        setSession(fresh);
        setWaitingForOpponent(false);
        setStage('review');
        return;
      }

      const isPlayer1 = fresh.player1_id === u.id;
      const oppAnswers = isPlayer1 ? (fresh.player2_answers || {}) : (fresh.player1_answers || {});
      if (oppAnswers[qIdx] !== undefined) {
        clearInterval(waitPollRef.current);
        setWaitingForOpponent(false);
        advanceToNext();
      }
    }, 1500);
  };

  const advanceToNext = () => {
    const s = sessionRef.current;
    if (!s) return;
    const next = currentQRef.current + 1;
    if (next >= s.questions.length) {
      startWaitPolling();
    } else {
      setCurrentQ(next);
      setWaitingForOpponent(false);
      startQuestionTimer();
    }
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

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
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

      {stage === 'playing' && session && !waitingForOpponent && (
        <div>
          <div className="flex items-center justify-between mb-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-[var(--text-primary)]">مواجهة: {opponentUsername}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-muted)]">{currentQ + 1}/{session.questions.length}</span>
              <div className="flex items-center gap-1 text-amber-400" dir="ltr">
                <Timer className="w-4 h-4" />
                <span className={`font-black text-lg font-sans tabular-nums ${timeLeft <= 5 ? 'text-red-400' : ''}`}>
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>

          <div className="h-2 bg-[var(--bg-card)] rounded-full mb-6 overflow-hidden border border-[var(--border-color)]">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                timeLeft <= 5 ? 'bg-red-500' : 'bg-amber-400'
              }`}
              style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-6">
            {session.questions.map((q, i) => (
              <div
                key={q.id}
                className={`w-6 h-1.5 rounded-full transition-all ${
                  i === currentQ
                    ? 'bg-amber-400 w-8'
                    : myAnswers[i] !== undefined
                      ? 'bg-emerald-500'
                      : 'bg-[var(--border-color)]'
                }`}
              />
            ))}
          </div>

          {session.questions[currentQ] && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm font-bold shrink-0">
                  {currentQ + 1}
                </span>
                <p className="font-bold text-lg text-[var(--text-primary)]">{session.questions[currentQ].q}</p>
              </div>
              <div className="space-y-3 pr-10">
                {session.questions[currentQ].answers.map((a, ai) => {
                  const alreadyAnswered = myAnswers[currentQ] !== undefined;
                  const isSelected = myAnswers[currentQ] === ai;
                  const isCorrect = session.questions[currentQ].correctIndex === ai;
                  return (
                    <button
                      key={ai}
                      onClick={() => handleAnswerAction(ai)}
                      disabled={alreadyAnswered}
                      className={`w-full text-right p-4 rounded-xl border transition-all text-base ${
                        alreadyAnswered
                          ? isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                            : isSelected
                              ? 'bg-red-500/10 border-red-500/30 text-red-400 font-bold'
                              : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-muted)]'
                          : isSelected
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                            : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {a.answer}
                        {alreadyAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                        {alreadyAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 shrink-0" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {stage === 'playing' && waitingForOpponent && (
        <div className="text-center py-16">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">في انتظار الخصم...</h2>
          <p className="text-[var(--text-muted)]">{opponentUsername} لم يجب بعد على هذا السؤال</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
            <Eye className="w-4 h-4" />
            <span>سيتم نقلك للسؤال التالي تلقائياً</span>
          </div>
        </div>
      )}

      {stage === 'review' && session && myScore !== null && opponentScore !== null && (
        <div>
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4 border-4 border-amber-500/20">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2">
              {myScore > opponentScore ? 'فزت! 🎉' : myScore < opponentScore ? 'خسرت 😢' : 'تعادل!'}
            </h2>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-black text-emerald-400">{myScore}</p>
                <p className="text-sm text-[var(--text-muted)]">نقاطك</p>
              </div>
              <div className="text-2xl text-[var(--text-muted)]">:</div>
              <div className="text-center">
                <p className="text-3xl font-black text-blue-400">{opponentScore}</p>
                <p className="text-sm text-[var(--text-muted)]">{opponentUsername}</p>
              </div>
            </div>
            {myScore > opponentScore && (
              <div className="mt-4 bg-amber-500/10 text-amber-400 px-6 py-3 rounded-2xl inline-flex items-center gap-2 font-bold border border-amber-500/20">
                <Star className="w-5 h-5 fill-amber-400" /> +10 نجوم!
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">تفاصيل الأسئلة</h3>
            {session.questions.map((q, idx) => {
              const isPlayer1 = session.player1_username === user?.username;
              const myAnsActual = isPlayer1 ? session.player1_answers?.[idx] : session.player2_answers?.[idx];
              const oppAnsActual = isPlayer1 ? session.player2_answers?.[idx] : session.player1_answers?.[idx];
              const correct = q.correctIndex;
              const iGotItRight = myAnsActual === correct;
              const iAnswered = myAnsActual !== undefined && myAnsActual !== -1;

              return (
                <div key={q.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                    <p className="font-bold text-[var(--text-primary)]">{q.q}</p>
                    <span className={`mr-auto ${iGotItRight ? 'text-emerald-400' : iAnswered ? 'text-red-400' : 'text-gray-500'}`}>
                      {iGotItRight ? <CheckCircle2 className="w-5 h-5" /> : iAnswered ? <XCircle className="w-5 h-5" /> : <MinusCircle className="w-5 h-5" />}
                    </span>
                  </div>
                  <div className="space-y-1.5 pr-9">
                    {q.answers.map((a, ai) => {
                      const isCorrect = ai === correct;
                      const iSelected = iAnswered && myAnsActual === ai;
                      const oppSelected = oppAnsActual === ai;
                      let bgClass = 'bg-[var(--bg-input)]';
                      let textClass = 'text-[var(--text-muted)]';
                      let icon = null;

                      if (isCorrect) {
                        bgClass = 'bg-emerald-500/10';
                        textClass = 'text-emerald-400 font-bold';
                        icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
                      }
                      if (iSelected && !isCorrect) {
                        bgClass = 'bg-red-500/10';
                        textClass = 'text-red-400 font-bold';
                        icon = <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
                      }

                      return (
                        <div
                          key={ai}
                          className={`w-full text-right p-3 rounded-xl border text-sm flex items-center justify-between gap-2 ${bgClass} ${textClass} ${isCorrect ? 'border-emerald-500/30' : iSelected && !isCorrect ? 'border-red-500/30' : 'border-[var(--border-color)]'}`}
                        >
                          <span className="flex items-center gap-2">
                            {a.answer}
                            {icon}
                          </span>
                          <span className="flex items-center gap-1 text-xs">
                            {oppSelected && (
                              <span className={`flex items-center gap-1 ${ai === correct ? 'text-emerald-400' : 'text-red-400'}`}>
                                <Eye className="w-3 h-3" />
                                {opponentUsername}
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => { setStage('idle'); setSession(null); setMyAnswers({}); setMyScore(null); setOpponentScore(null); setCurrentQ(0); setWaitingForOpponent(false); }}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-black rounded-2xl font-black text-lg transition-all shadow-xl shadow-amber-500/20"
          >
            تحدٍ جديد
          </button>
        </div>
      )}
    </div>
  );
}
