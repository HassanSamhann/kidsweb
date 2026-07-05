import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ── Static data sources (fetched once per cold start) ──────────────────────
// We cache the raw JSON in module scope to avoid re-fetching on every request.

let surahCache: { number: number; name: string; englishName: string; numberOfAyahs: number }[] | null = null;
let hadithCache: { hadithnumber: number; text: string }[] | null = null;

const SURAH_API = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/surah.json';
const HADITH_API = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/master/editions/ara-nawawi.min.json';

// Allah's names — hardcoded (fast, no API needed)
const ASMAA_ALLAH = [
  { name: 'الله', meaning: 'اسم الجلالة' },
  { name: 'الرحمن', meaning: 'البالغ الرحمة' },
  { name: 'الرحيم', meaning: 'الدائم الرحمة بالمؤمنين' },
  { name: 'الملك', meaning: 'المالك للأشياء' },
  { name: 'القدوس', meaning: 'المنزه عن كل نقص' },
  { name: 'السلام', meaning: 'ذو السلامة من كل نقص' },
  { name: 'المؤمن', meaning: 'الذي أمّن المؤمنين' },
  { name: 'المهيمن', meaning: 'الرقيب الحافظ' },
  { name: 'العزيز', meaning: 'الغالب الذي لا يُغلب' },
  { name: 'الجبار', meaning: 'القاهر فوق عباده' },
  { name: 'المتكبر', meaning: 'المتعظم عن كل سوء' },
  { name: 'الخالق', meaning: 'الذي خلق الأشياء' },
  { name: 'البارئ', meaning: 'الخالق المصوِّر' },
  { name: 'المصور', meaning: 'المعطي الصور' },
  { name: 'الغفار', meaning: 'كثير المغفرة' },
  { name: 'القهار', meaning: 'القاهر لكل شيء' },
  { name: 'الوهاب', meaning: 'كثير العطاء' },
  { name: 'الرزاق', meaning: 'المتكفل بالأرزاق' },
  { name: 'الفتاح', meaning: 'الحاكم بين عباده' },
  { name: 'العليم', meaning: 'الواسع العلم' },
  { name: 'القابض', meaning: 'القابض الأرزاق' },
  { name: 'الباسط', meaning: 'الباسط الأرزاق' },
  { name: 'الخافض', meaning: 'الخافض لمن يشاء' },
  { name: 'الرافع', meaning: 'الرافع لمن يشاء' },
  { name: 'المعز', meaning: 'المُعطي العزة' },
  { name: 'المذل', meaning: 'المُذل من يشاء' },
  { name: 'السميع', meaning: 'السامع لكل شيء' },
  { name: 'البصير', meaning: 'المبصر لكل شيء' },
  { name: 'الحكم', meaning: 'الحاكم العدل' },
  { name: 'العدل', meaning: 'الموصوف بالعدل' },
  { name: 'اللطيف', meaning: 'اللطيف بعباده' },
  { name: 'الخبير', meaning: 'العليم بالخفايا' },
  { name: 'الحليم', meaning: 'الصبور على العصاة' },
  { name: 'العظيم', meaning: 'البالغ العظمة' },
  { name: 'الغفور', meaning: 'الساتر الذنوب' },
  { name: 'الشكور', meaning: 'المثني على المطيع' },
  { name: 'العلي', meaning: 'المتعالي على خلقه' },
  { name: 'الكبير', meaning: 'ذو الكبرياء' },
  { name: 'الحفيظ', meaning: 'الحافظ لكل شيء' },
  { name: 'المقيت', meaning: 'الحافظ أرزاق الخلق' },
  { name: 'الحسيب', meaning: 'الكافي لكل ما يحتاجه الخلق' },
  { name: 'الجليل', meaning: 'ذو الجلال والعظمة' },
  { name: 'الكريم', meaning: 'الجواد المعطي' },
  { name: 'الرقيب', meaning: 'المطلع على كل شيء' },
  { name: 'المجيب', meaning: 'المجيب للدعاء' },
  { name: 'الواسع', meaning: 'الواسع الرحمة والعلم' },
  { name: 'الحكيم', meaning: 'الحاكم بالحكمة' },
  { name: 'الودود', meaning: 'المحب لأوليائه' },
  { name: 'المجيد', meaning: 'الواسع الفضل' },
  { name: 'الباعث', meaning: 'الباعث الخلق يوم القيامة' },
  { name: 'الشهيد', meaning: 'الشاهد على كل شيء' },
  { name: 'الحق', meaning: 'الثابت بذاته' },
  { name: 'الوكيل', meaning: 'الكافل للأرزاق' },
  { name: 'القوي', meaning: 'الشديد القوة' },
  { name: 'المتين', meaning: 'الشديد البطش' },
  { name: 'الولي', meaning: 'ناصر أوليائه' },
  { name: 'الحميد', meaning: 'المستحق للحمد' },
  { name: 'المحصي', meaning: 'العالم بعدد الأشياء' },
  { name: 'المبدئ', meaning: 'المبدئ الخلق' },
  { name: 'المعيد', meaning: 'المعيد الخلق بعد الفناء' },
  { name: 'المحيي', meaning: 'الواهب الحياة' },
  { name: 'المميت', meaning: 'المميت الأحياء' },
  { name: 'الحي', meaning: 'الحي الدائم' },
  { name: 'القيوم', meaning: 'القائم على كل شيء' },
  { name: 'الواجد', meaning: 'الغني عن كل شيء' },
  { name: 'الماجد', meaning: 'الكريم الواسع الفضل' },
  { name: 'الواحد', meaning: 'المنفرد بالأحدية' },
  { name: 'الأحد', meaning: 'المنفرد بالوحدانية' },
  { name: 'الصمد', meaning: 'الذي تصمد إليه الخلائق' },
  { name: 'القادر', meaning: 'القادر على كل شيء' },
  { name: 'المقتدر', meaning: 'البالغ القدرة' },
  { name: 'المقدم', meaning: 'المقدِّم من يشاء' },
  { name: 'المؤخر', meaning: 'المؤخِّر من يشاء' },
  { name: 'الأول', meaning: 'ليس قبله شيء' },
  { name: 'الآخر', meaning: 'ليس بعده شيء' },
  { name: 'الظاهر', meaning: 'الغالب على كل شيء' },
  { name: 'الباطن', meaning: 'العالم بالأسرار' },
  { name: 'الوالي', meaning: 'المتصرف في الأمور' },
  { name: 'المتعالي', meaning: 'المنزه عن صفات الخلق' },
  { name: 'البر', meaning: 'الكثير الإحسان' },
  { name: 'التواب', meaning: 'الراجع بالعبد إلى التوبة' },
  { name: 'المنتقم', meaning: 'المعاقب من يشاء' },
  { name: 'العفو', meaning: 'الماحي الذنوب' },
  { name: 'الرؤوف', meaning: 'ذو الرأفة الواسعة' },
  { name: 'مالك الملك', meaning: 'مالك الملك' },
  { name: 'ذو الجلال والإكرام', meaning: 'ذو العظمة والإكرام' },
  { name: 'المقسط', meaning: 'العادل في أحكامه' },
  { name: 'الجامع', meaning: 'الجامع الخلق يوم القيامة' },
  { name: 'الغني', meaning: 'الغني عن كل شيء' },
  { name: 'المغني', meaning: 'المغني من يشاء' },
  { name: 'المانع', meaning: 'المانع ما يشاء' },
  { name: 'الضار', meaning: 'المقدر للضر' },
  { name: 'النافع', meaning: 'خالق النفع' },
  { name: 'النور', meaning: 'منور السموات والأرض' },
  { name: 'الهادي', meaning: 'الهادي من يشاء' },
  { name: 'البديع', meaning: 'خالق الأشياء بلا مثال' },
  { name: 'الباقي', meaning: 'الدائم الوجود' },
  { name: 'الوارث', meaning: 'الباقي بعد فناء الخلق' },
  { name: 'الرشيد', meaning: 'الموصوف بالرشد' },
  { name: 'الصبور', meaning: 'الصبور على العصيان' },
];

// Azkar categories for search
const AZKAR_CATEGORIES = [
  { key: 'morning', label: 'أذكار الصباح', path: '/azkar' },
  { key: 'evening', label: 'أذكار المساء', path: '/azkar' },
  { key: 'after-salah', label: 'أذكار بعد الصلاة', path: '/azkar' },
  { key: 'sleep', label: 'أذكار النوم', path: '/azkar' },
  { key: 'wakeup', label: 'أذكار الاستيقاظ', path: '/azkar' },
  { key: 'tasabih', label: 'التسابيح', path: '/azkar' },
  { key: 'dua-quran', label: 'الأدعية القرآنية', path: '/azkar' },
  { key: 'dua-prophets', label: 'أدعية الأنبياء', path: '/azkar' },
];

// App pages for quick navigation
const APP_PAGES = [
  { label: 'القرآن الكريم', description: 'استماع تلاوات', path: '/quran', icon: 'quran' },
  { label: 'قراءة القرآن', description: 'القرآن مكتوباً بالرسم العثماني', path: '/quran-read', icon: 'book' },
  { label: 'التفسير', description: 'تفسير القرآن الكريم', path: '/tafseer', icon: 'book' },
  { label: 'الحديث النبوي', description: 'الأربعون النووية', path: '/hadith', icon: 'hadith' },
  { label: 'حصن المسلم', description: 'الأذكار والأدعية اليومية', path: '/azkar', icon: 'azkar' },
  { label: 'مواقيت الصلاة', description: 'أوقات الصلاة حسب موقعك', path: '/prayer', icon: 'prayer' },
  { label: 'اتجاه القبلة', description: 'البوصلة الإسلامية', path: '/qibla', icon: 'qibla' },
  { label: 'أسماء الله الحسنى', description: '99 اسماً لله تعالى', path: '/asmaa-allah', icon: 'allah' },
  { label: 'المحاسبة اليومية', description: 'متابعة الصلوات والأذكار', path: '/muhasabah', icon: 'check' },
  { label: 'التحدي الإسلامي', description: 'تنافس في الأسئلة الإسلامية', path: '/challenge', icon: 'challenge' },
  { label: 'إذاعة القرآن', description: 'بث مباشر لإذاعات القرآن', path: '/radio', icon: 'radio' },
  { label: 'المتصدرين', description: 'أفضل المتسابقين هذا الشهر', path: '/leaderboard', icon: 'trophy' },
  { label: 'ركن الأطفال', description: 'قصص وألعاب للأطفال', path: '/stories', icon: 'kids' },
  { label: 'لوحة الإنجازات', description: 'نجومك وإنجازاتك', path: '/dashboard', icon: 'trophy' },
];

async function getSurahs() {
  if (surahCache) return surahCache;
  try {
    const res = await fetch(SURAH_API, { next: { revalidate: 86400 } }); // cache 24h
    const data = await res.json();
    surahCache = data;
    return data;
  } catch { return []; }
}

async function getHadiths() {
  if (hadithCache) return hadithCache;
  try {
    const res = await fetch(HADITH_API, { next: { revalidate: 86400 } });
    const data = await res.json();
    hadithCache = data?.hadiths || [];
    return hadithCache || [];
  } catch { return []; }
}

function normalize(text: string): string {
  return text
    .replace(/[\u064B-\u065F]/g, '') // strip diacritics
    .replace(/أ|إ|آ/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || '';

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const nq = normalize(q);
  const results: { type: string; label: string; description?: string; path: string }[] = [];

  // ── 1. App pages (instant) ──────────────────────────────
  for (const page of APP_PAGES) {
    if (normalize(page.label).includes(nq) || (page.description && normalize(page.description).includes(nq))) {
      results.push({ type: 'page', label: page.label, description: page.description, path: page.path });
      if (results.length >= 8) break;
    }
  }

  // ── 2. Azkar categories ─────────────────────────────────
  for (const cat of AZKAR_CATEGORIES) {
    if (normalize(cat.label).includes(nq)) {
      results.push({ type: 'azkar', label: cat.label, description: 'أذكار', path: cat.path });
    }
  }

  // ── 3. Surahs ───────────────────────────────────────────
  if (results.length < 12) {
    const surahs = await getSurahs();
    for (const s of surahs) {
      if (normalize(s.name || '').includes(nq)) {
        results.push({
          type: 'surah',
          label: `سورة ${s.name}`,
          description: `${s.numberOfAyahs} آية`,
          path: `/quran-read?surah=${s.number}`,
        });
        if (results.length >= 12) break;
      }
    }
  }

  // ── 4. Allah's names ────────────────────────────────────
  if (results.length < 12) {
    for (const n of ASMAA_ALLAH) {
      if (normalize(n.name).includes(nq) || normalize(n.meaning).includes(nq)) {
        results.push({
          type: 'allah',
          label: n.name,
          description: n.meaning,
          path: '/asmaa-allah',
        });
        if (results.length >= 12) break;
      }
    }
  }

  // ── 5. Hadiths (text search — only if short query) ──────
  if (results.length < 10 && q.length >= 3) {
    const hadiths = await getHadiths();
    let hadithCount = 0;
    for (const h of hadiths) {
      if (hadithCount >= 3) break;
      if (normalize(h.text || '').includes(nq)) {
        results.push({
          type: 'hadith',
          label: `حديث رقم ${h.hadithnumber}`,
          description: h.text.substring(0, 80) + '...',
          path: `/hadith?n=${h.hadithnumber}`,
        });
        hadithCount++;
      }
    }
  }

  return NextResponse.json({ results: results.slice(0, 12) });
}
