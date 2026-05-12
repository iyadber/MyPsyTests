import { Link } from 'react-router';
import { useAuthStore } from '../store';
import { Play, Activity } from 'lucide-react';

export default function Home() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex flex-col gap-6 w-full fade-in">
      <div>
        <h2 className="text-2xl font-black text-ink">مرحباً، {user?.displayName?.split(' ')[0]} 👋</h2>
        <p className="text-ink3 mt-1">كيف تشعر اليوم؟ استكشف الميزات الجديدة.</p>
      </div>

      <div className="bg-surface rounded-3xl p-6 border border-border flex items-center justify-between">
         <div>
           <div className="text-[11px] uppercase tracking-widest font-bold text-ink3 mb-2">الرصيد المعرفي</div>
           <div className="text-4xl font-black text-primary">0</div>
         </div>
         <div className="bg-primary/10 border border-primary/20 p-4 rounded-3xl">
           <Activity className="w-8 h-8 text-primary" />
         </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
           <div className="text-[11px] uppercase tracking-widest font-bold text-ink3">اختبار مقترح</div>
           <Link to="/tests" className="text-xs font-bold text-primary hover:underline">عرض المكتبة</Link>
        </div>
        
        <Link to="/tests/depression-phq9" className="block bg-surface border border-border rounded-3xl p-6 relative overflow-hidden group hover:bg-surface-hover transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <h4 className="font-bold text-2xl mb-2 relative z-10 text-ink">مقياس الاكتئاب PHQ-9</h4>
          <p className="text-ink2 text-sm mb-6 max-w-[220px] relative z-10 leading-relaxed">
            أداة موثوقة لقياس مستوى الاكتئاب والمزاج العام.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold bg-primary text-black w-fit px-4 py-2.5 rounded-full relative z-10">
            <Play className="w-3.5 h-3.5 fill-black" />
            بدء الاختبار
          </div>
        </Link>
      </div>
    </div>
  );
}
