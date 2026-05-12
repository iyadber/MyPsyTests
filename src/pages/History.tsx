import { useEffect, useState, useMemo } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuthStore } from '../store';
import { Loader2, Calendar, ClipboardList, TrendingUp, ChevronLeft, Brain, Activity, Clock, FileQuestion, Sparkles } from 'lucide-react';
import { getTest } from '../lib/tests';
import { Link } from 'react-router';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'motion/react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border p-3 rounded-2xl shadow-xl">
        <p className="text-ink3 text-xs mb-1 font-medium">{label}</p>
        <p className="text-primary font-bold text-[1.1rem]">
          {payload[0].value} <span className="text-ink2 text-sm font-normal">نقطة</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function History() {
  const user = useAuthStore(state => state.user);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'testResults'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
        handleFirestoreError(err, OperationType.LIST, 'testResults');
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [user]);

  const testCounts = useMemo(() => results.reduce((acc, curr) => {
    acc[curr.testId] = (acc[curr.testId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>), [results]);

  const chartableTests = useMemo(() => Object.keys(testCounts).filter(testId => testCounts[testId] > 1), [testCounts]);
  const [selectedChartTestId, setSelectedChartTestId] = useState<string | null>(null);

  useEffect(() => {
    if (chartableTests.length > 0 && !selectedChartTestId) {
      setSelectedChartTestId(chartableTests[0]);
    }
  }, [chartableTests, selectedChartTestId]);

  const stats = useMemo(() => {
    if (!results.length) return null;
    const total = results.length;
    const latestDate = results[0]?.createdAt?.toDate().toLocaleDateString('ar-DZ', { month: 'short', day: 'numeric' }) || '';
    
    let favTestId = Object.keys(testCounts)[0];
    for (const key in testCounts) {
      if (testCounts[key] > testCounts[favTestId]) {
        favTestId = key;
      }
    }
    const favTest = getTest(favTestId)?.nameAr || 'غير معروف';

    return { total, latestDate, favTest };
  }, [results, testCounts]);

  const chartData = useMemo(() => {
    if (!selectedChartTestId) return [];
    return [...results].reverse().filter(r => r.testId === selectedChartTestId).map(r => ({
      date: r.createdAt?.toDate().toLocaleDateString('ar-DZ', { month: 'short', day: 'numeric' }) || '',
      score: r.totalScore,
      testId: r.testId,
    }));
  }, [results, selectedChartTestId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto py-6">
        <div className="h-8 w-40 bg-surface border border-border/50 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
           <div className="h-20 bg-surface border border-border/50 rounded-xl animate-pulse"></div>
           <div className="h-20 bg-surface border border-border/50 rounded-xl animate-pulse"></div>
           <div className="h-20 bg-surface border border-border/50 rounded-xl animate-pulse"></div>
        </div>
        <div className="h-48 bg-surface border border-border/50 rounded-xl animate-pulse mt-2"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-8"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-black text-ink tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            سجل الاختبارات
          </h2>
          <p className="text-ink3 mt-1.5 text-sm leading-relaxed max-w-2xl">تتبع تقدمك الصحي والنفسي بمرور الوقت من خلال التحليل البياني لنتائجك السابقة.</p>
        </div>
        {results.length > 0 && (
          <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            تستمر في التقدم!
          </div>
        )}
      </header>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface border border-border p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:border-primary/30 transition-colors shadow-sm">
             <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
               <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
             </div>
             <div>
               <p className="text-[10px] sm:text-xs font-medium text-ink3 mb-1 line-clamp-1">إجمالي الاختبارات</p>
               <p className="text-sm sm:text-xl font-black text-ink leading-none">{stats.total} <span className="text-[9px] sm:text-xs font-medium text-ink3">اختبار</span></p>
             </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface border border-border p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:border-blue-500/30 transition-colors shadow-sm">
             <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center shrink-0">
               <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
             </div>
             <div className="w-full">
               <p className="text-[10px] sm:text-xs font-medium text-ink3 mb-1 line-clamp-1">آخر نشاط</p>
               <p className="text-sm sm:text-xl font-black text-ink leading-none whitespace-nowrap overflow-hidden text-ellipsis w-full" dir="ltr">{stats.latestDate}</p>
             </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface border border-border p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:border-emerald-500/30 transition-colors shadow-sm">
             <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center shrink-0">
               <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
             </div>
             <div className="w-full">
               <p className="text-[10px] sm:text-xs font-medium text-ink3 mb-1 line-clamp-1">الأكثر إجراءً</p>
               <p className="text-xs sm:text-sm font-bold text-ink leading-tight line-clamp-1 w-full" title={stats.favTest}>{stats.favTest}</p>
             </div>
          </motion.div>
        </div>
      )}

      {/* Chart Section */}
      {chartableTests.length > 0 && selectedChartTestId && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-surface rounded-xl p-4 md:p-5 border border-border shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 text-primary rounded-lg"><TrendingUp className="w-4 h-4"/></div>
              <h3 className="text-lg font-bold text-ink tracking-tight">تحليل مسار التقدم</h3>
            </div>
            <select 
              value={selectedChartTestId} 
              onChange={(e) => setSelectedChartTestId(e.target.value)}
              className="bg-paper border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-ink outline-none cursor-pointer hover:border-primary/50 transition-colors appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2371717A%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'left 0.75rem top 50%', backgroundSize: '0.65rem auto', paddingLeft: '2rem' }}
            >
              {chartableTests.map(id => (
                 <option key={id} value={id}>{getTest(id)?.nameAr || id}</option>
              ))}
            </select>
          </div>
          <div dir="ltr" className="-ml-5 sm:ml-0 overflow-visible">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--theme-primary)" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="var(--theme-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--theme-ink3)', fontFamily: 'var(--font-sans)', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--theme-ink3)', fontFamily: 'var(--font-sans)', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--theme-border)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="score" stroke="var(--theme-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--theme-ink)', stroke: 'var(--theme-primary)' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* History List */}
      <div className="flex flex-col gap-3 mt-2">
        <h3 className="font-bold text-lg text-ink">جميع الاختبارات</h3>
        
        {results.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center bg-surface p-8 rounded-xl border border-border flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <FileQuestion className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-ink mb-2 tracking-tight">لم تقم بأي اختبارات بعد</h4>
            <p className="text-ink3 text-sm mb-6 max-w-md mx-auto leading-relaxed">قم بإجراء اختبارك الأول لتبدأ في تتبع حالتك النفسية والحصول على تقارير مخصصة ومفصلة.</p>
            <Link to="/" className="bg-primary hover:bg-primary-light hover:text-primary text-paper border border-transparent hover:border-primary px-6 py-2.5 rounded-lg font-bold text-sm transition-all">
              اكتشف الاختبارات
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map((r, index) => {
              const test = getTest(r.testId);
              const date = r.createdAt?.toDate().toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' }) || '';
              
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (Math.min(index, 10) * 0.05) }}
                >
                  <Link to={`/results/${r.id}`} className="group relative flex items-center justify-between bg-surface p-3 sm:px-4 rounded-xl border border-border hover:border-primary/40 hover:shadow-sm transition-all gap-3 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="flex items-center gap-3 z-10 min-w-0">
                      <div className="bg-paper border border-border text-primary p-2.5 rounded-lg shrink-0 group-hover:bg-primary/5 transition-colors shadow-sm">
                         <ClipboardList className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 truncate">
                        <h4 className="font-bold text-ink text-sm sm:text-base leading-tight truncate group-hover:text-primary transition-colors">
                          {test?.nameAr || 'اختبار مجهول'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-ink3 font-medium">
                          <span className="flex items-center gap-1 whitespace-nowrap"><Calendar className="w-3 h-3" /> {date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 z-10 pl-1 border-r border-border/50">
                      <div className="flex flex-col items-end pr-3">
                        <span className="text-[9px] text-ink3 font-semibold mb-0.5 tracking-wide uppercase">النتيجة</span>
                        <div className="flex items-baseline gap-0.5 text-primary font-black text-sm group-hover:text-primary-dark transition-colors">
                          {r.totalScore}
                          {test?.maxScore && <span className="opacity-60 font-semibold text-[10px]">/{test.maxScore}</span>}
                        </div>
                      </div>
                      <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-ink3 group-hover:text-primary transition-colors">
                        <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
