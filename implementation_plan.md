# 🌙 إسلامي乐园 — خطة التنفيذ الكاملة

تطبيق تعليمي تفاعلي للأطفال (4–10 سنوات) مبني على Next.js 15 + Supabase.

---

## قرارات التصميم والبنية

> [!IMPORTANT]
> **اسم التطبيق:** سيُستخدم "إسلامي" فقط في الكود (ASCII-compatible) مع عرض الاسم الكامل في UI
> **Supabase:** تحتاج إلى إنشاء مشروع Supabase وتوفير `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> [!WARNING]
> **Auth مبسط:** نظام المصادقة يعتمد على Username + PIN (4 أرقام) بدون email. هذا يعني:
> - لن نستخدم Supabase Auth المدمج (يتطلب email)
> - سنستخدم Supabase Database مباشرة مع تشفير PIN بـ bcrypt على Server
> - الجلسة تُحفظ في localStorage

> [!NOTE]
> **react-canvas-draw:** هذه المكتبة لا تدعم Next.js 15 بشكل كامل (SSR issues). سنستخدم Canvas API مباشرة مع `useRef` بدلاً منها.

---

## Open Questions

> [!IMPORTANT]
> **هل تملك مشروع Supabase جاهزاً؟** إذا لا، سنضع placeholder في `.env.local` وتقوم بتعبئته لاحقاً.
> **الـ ENV Variables لـ Vercel:** هل تريد خطوات Deployment مفصلة؟

---

## البنية الكاملة للمشروع

```
kidsweb/
├── app/
│   ├── layout.tsx              # Root layout (RTL, fonts)
│   ├── page.tsx                # Home page (redirect to stories)
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── stories/
│   │   ├── page.tsx            # Story list
│   │   └── [id]/page.tsx       # Single story
│   ├── games/
│   │   ├── page.tsx            # Games menu
│   │   ├── wudhu/page.tsx      # Game 1: ترتيب الوضوء
│   │   └── prayer/page.tsx     # Game 2: أركان الصلاة
│   ├── coloring/
│   │   └── page.tsx            # التلوين
│   └── profile/
│       └── page.tsx            # الملف الشخصي
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── StarBadge.tsx
│   │   ├── PageWrapper.tsx
│   │   └── LoadingSpinner.tsx
│   ├── layout/
│   │   ├── BottomNav.tsx
│   │   └── AppHeader.tsx
│   └── feedback/
│       └── RewardPopup.tsx
├── features/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── stories/
│   │   ├── StoryCard.tsx
│   │   ├── StoryList.tsx
│   │   ├── StoryReader.tsx
│   │   └── StoryQuestion.tsx
│   ├── games/
│   │   ├── wudhu/
│   │   │   ├── WudhuGame.tsx
│   │   │   └── DraggableStep.tsx
│   │   └── prayer/
│   │       ├── PrayerGame.tsx
│   │       └── MatchCard.tsx
│   └── coloring/
│       └── ColoringApp.tsx
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useRewards.ts
│   ├── useAuth.ts
│   └── useProgress.ts
├── lib/
│   ├── supabase.ts
│   ├── auth.ts                 # signUp, login, getUser
│   └── utils.ts
├── data/
│   └── stories.ts
├── types/
│   └── index.ts
├── .env.local.example
└── middleware.ts               # Route protection
```

---

## الملفات المطلوبة (بالترتيب)

### Phase 1: Project Setup
#### [NEW] `package.json` dependencies
- next@15, react@19, typescript
- @supabase/supabase-js
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- react-colorful
- clsx, lucide-react
- bcryptjs + @types/bcryptjs

#### [NEW] `.env.local.example`
#### [NEW] `tailwind.config.ts` — custom color palette
#### [NEW] `app/globals.css` — RTL + Arabic fonts + animations

---

### Phase 2: Types + Data Layer
#### [NEW] `types/index.ts` — User, Story, Game, Progress types
#### [NEW] `data/stories.ts` — 5 قصص إسلامية مع أسئلة
#### [NEW] `lib/supabase.ts` — Supabase client
#### [NEW] `lib/auth.ts` — Auth functions (signUp, login, getUser)
#### [NEW] `lib/utils.ts` — Helper functions + PIN hashing

---

### Phase 3: Hooks
#### [NEW] `hooks/useLocalStorage.ts`
#### [NEW] `hooks/useAuth.ts`
#### [NEW] `hooks/useRewards.ts`
#### [NEW] `hooks/useProgress.ts`

---

### Phase 4: UI Components
#### [NEW] `components/ui/Button.tsx`
#### [NEW] `components/ui/StarBadge.tsx`
#### [NEW] `components/ui/PageWrapper.tsx`
#### [NEW] `components/ui/LoadingSpinner.tsx`
#### [NEW] `components/layout/BottomNav.tsx`
#### [NEW] `components/layout/AppHeader.tsx`
#### [NEW] `components/feedback/RewardPopup.tsx`

---

### Phase 5: Feature — Auth
#### [NEW] `features/auth/LoginForm.tsx`
#### [NEW] `features/auth/RegisterForm.tsx`
#### [NEW] `app/(auth)/login/page.tsx`
#### [NEW] `app/(auth)/register/page.tsx`

---

### Phase 6: Feature — Stories
#### [NEW] `features/stories/StoryCard.tsx`
#### [NEW] `features/stories/StoryList.tsx`
#### [NEW] `features/stories/StoryReader.tsx`
#### [NEW] `features/stories/StoryQuestion.tsx`
#### [NEW] `app/stories/page.tsx`
#### [NEW] `app/stories/[id]/page.tsx`

---

### Phase 7: Feature — Games
#### [NEW] `features/games/wudhu/WudhuGame.tsx`
#### [NEW] `features/games/wudhu/DraggableStep.tsx`
#### [NEW] `features/games/prayer/PrayerGame.tsx`
#### [NEW] `features/games/prayer/MatchCard.tsx`
#### [NEW] `app/games/page.tsx`
#### [NEW] `app/games/wudhu/page.tsx`
#### [NEW] `app/games/prayer/page.tsx`

---

### Phase 8: Feature — Coloring
#### [NEW] `features/coloring/ColoringApp.tsx` — Canvas-based coloring

---

### Phase 9: Profile + Layout
#### [NEW] `app/profile/page.tsx`
#### [NEW] `app/layout.tsx`
#### [NEW] `app/page.tsx`
#### [NEW] `middleware.ts`

---

## Supabase Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL, -- bcrypt hashed
  stars INTEGER DEFAULT 0,
  completed_stories JSONB DEFAULT '[]'::jsonb,
  completed_games JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: users can read/update their own data
CREATE POLICY "users_own_data" ON users
  FOR ALL USING (true); -- مبسط للتطوير
```

---

## Design System (Tailwind)

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#4CAF82` | الأزرار الرئيسية |
| `sky` | `#5BC8F5` | الخلفيات |
| `gold` | `#FFD700` | النجوم والمكافآت |
| `cream` | `#FFFBF0` | خلفية الصفحات |
| `coral` | `#FF6B6B` | تنبيهات |

---

## Verification Plan

### Automated
- `npm run build` — بدون أخطاء TypeScript
- `npm run dev` — التطبيق يعمل محلياً

### Manual (Browser)
1. تسجيل مستخدم جديد (اسم + PIN)
2. تسجيل دخول
3. قراءة قصة + الإجابة على السؤال → نجمة ⭐
4. لعبة الوضوء: drag & drop → تحقق
5. لعبة الصلاة: matching
6. التلوين: رسم + حفظ
7. صفحة الملف الشخصي: عرض النجوم

### Deployment
- رفع على Vercel + إضافة ENV variables
