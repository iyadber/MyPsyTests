import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowRight, Loader2, Sparkles, CheckCircle2, Target, Download } from 'lucide-react';
import { getTest } from '../lib/tests';

export default function Results() {
  const { resultId } = useParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function loadResult() {
      if (!resultId) return;
      try {
        const docRef = doc(db, 'testResults', resultId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setResult({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'testResults');
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [resultId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!result) {
    return <div>النتيجة غير موجودة</div>;
  }

  const test = getTest(result.testId);
  const analysis = result.aiAnalysis || {};

  return (
    <div className="flex flex-col gap-5 fade-in">
      <div className="flex items-center justify-between mb-2">
        <Link to="/" className="flex items-center gap-2 text-ink3 text-sm hover:text-ink font-bold w-fit">
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>
        <button 
          onClick={async () => {
            setIsExporting(true);
            try {
              const { generatePDF } = await import('../components/ReportPDF');
              const { Capacitor } = await import('@capacitor/core');
              
              if (Capacitor.isNativePlatform()) {
                const { Toast } = await import('@capacitor/toast');
                await Toast.show({ text: 'جاري تحضير التقرير...' });
              }
              
              await generatePDF(test, result);
            } catch (err) {
              console.error(err);
              const { Capacitor } = await import('@capacitor/core');
              if (Capacitor.isNativePlatform()) {
                const { Toast } = await import('@capacitor/toast');
                await Toast.show({ text: 'حدث خطأ أثناء التصدير' });
              } else {
                alert('حدث خطأ أثناء التصدير');
              }
            } finally {
              setIsExporting(false);
            }
          }}
          disabled={isExporting}
          className="flex items-center gap-2 text-primary text-sm font-bold bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl transition-colors"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isExporting ? 'جاري التحضير...' : 'تصدير PDF'}
        </button>
      </div>

      <div id="report-content" className="flex flex-col gap-5 pb-5">
        <div className="bg-surface rounded-3xl p-8 border border-border text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-[11px] uppercase tracking-widest font-bold text-ink3 mb-2 relative z-10">نتيجة اختبار</h2>
        <h3 className="text-2xl font-black text-ink mb-6 relative z-10">{test?.nameAr || 'اختبار مجهول'}</h3>
        
        <div className="inline-flex flex-col items-center justify-center bg-paper w-32 h-32 rounded-full border border-border relative z-10">
          <span className="text-4xl font-black text-primary">{result.totalScore}</span>
        </div>
      </div>

      {analysis.summary && (
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/20">
          <h4 className="font-bold text-lg text-primary mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            تحليل المساعد الذكي
          </h4>
          <p className="text-ink md:text-ink2 text-sm leading-relaxed">{analysis.summary}</p>
        </div>
      )}

      {analysis.strengths?.length > 0 && (
        <div className="bg-surface rounded-3xl p-6 border border-border text-sm">
          <h4 className="font-bold text-ink mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
            نقاط القوة
          </h4>
          <ul className="flex flex-col gap-4">
            {analysis.strengths.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-ink2 leading-relaxed">
                <div className="w-2 h-2 rounded-full bg-[#22c55e] mt-1.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.recommendations?.length > 0 && (
        <div className="bg-surface rounded-3xl p-6 border border-border text-sm">
          <h4 className="font-bold text-ink mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#f97316]" />
            توصيات عملية
          </h4>
          <ul className="flex flex-col gap-4">
            {analysis.recommendations.map((r: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-ink2 leading-relaxed">
                <div className="w-2 h-2 rounded-full bg-[#f97316] mt-1.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {analysis.specialist_referral?.needed && (
        <div className="bg-[#ef4444]/10 text-[#f87171] rounded-3xl p-5 text-sm font-bold border border-[#ef4444]/20 text-center">
          {analysis.specialist_referral.reason}
        </div>
      )}
      </div>
    </div>
  );
}
