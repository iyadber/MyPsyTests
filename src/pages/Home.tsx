import { Link } from 'react-router';
import { useAuthStore } from '../store';
import { Play, Activity, Calendar, Store, Users, FileText } from 'lucide-react';

export default function Home() {
  const user = useAuthStore((state) => state.user);

  if (user?.role === 'psychologist') {
    return (
      <div className="flex flex-col gap-6 w-full fade-in">
        <div>
          <h2 className="text-2xl font-black text-ink">مرحباً، {user?.displayName?.split(' ')[0]} 👋</h2>
          <p className="text-ink3 mt-1">كيف حالك اليوم؟ إليك نظرة سريعة على عيادتك.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link to="/appointments" className="bg-surface rounded-2xl p-4 border border-border flex flex-col items-center justify-center text-center gap-3 hover:border-primary/50 transition-colors">
             <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
               <Calendar className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-sm text-ink w-full">إدارة المواعيد</h3>
          </Link>
          <Link to="/clinic-profile" className="bg-surface rounded-2xl p-4 border border-border flex flex-col items-center justify-center text-center gap-3 hover:border-emerald-500/50 transition-colors">
             <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
               <Store className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-sm text-ink w-full h-[20px] overflow-hidden whitespace-nowrap text-ellipsis px-1">
               ملف العيادة
             </h3>
          </Link>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
             <div className="text-[11px] uppercase tracking-widest font-bold text-ink3">روابط سريعة</div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Link to="/appointments" className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 hover:bg-surface-hover transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-ink">مواعيد المرضى</h4>
                <p className="text-xs text-ink3 mt-0.5">مراجعة المواعيد المؤكدة والجديدة</p>
              </div>
            </Link>

            <Link to="/tests" className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 hover:bg-surface-hover transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-ink">مكتبة الاختبارات</h4>
                <p className="text-xs text-ink3 mt-0.5">تصفح الاختبارات المتاحة للمرضى</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full fade-in">
      <div>
        <h2 className="text-2xl font-black text-ink">مرحباً، {user?.displayName?.split(' ')[0]} 👋</h2>
        <p className="text-ink3 mt-1">كيف تشعر اليوم؟ استكشف الميزات الجديدة.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/appointments" className="bg-surface rounded-2xl p-4 border border-border flex flex-col items-center justify-center text-center gap-3 hover:border-primary/50 transition-colors">
           <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
             <Calendar className="w-6 h-6" />
           </div>
           <h3 className="font-bold text-sm text-ink w-full">مواعيدي</h3>
        </Link>
        <Link to="/clinics" className="bg-surface rounded-2xl p-4 border border-border flex flex-col items-center justify-center text-center gap-3 hover:border-emerald-500/50 transition-colors">
           <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
             <Store className="w-6 h-6" />
           </div>
           <h3 className="font-bold text-sm text-ink w-full h-[20px] overflow-hidden whitespace-nowrap text-ellipsis px-1">
             احجز موعد
           </h3>
        </Link>
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
