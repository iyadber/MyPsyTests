import { Link } from 'react-router';
import { TEST_LIBRARY } from '../lib/tests';
import { ChevronLeft, Clock } from 'lucide-react';

export default function TestLibrary() {
  return (
    <div className="flex flex-col gap-6 fade-in">
      <div>
        <h2 className="text-2xl font-black text-ink">المكتبة</h2>
        <p className="text-ink3 mt-1">اختر الاختبار الذي يناسبك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TEST_LIBRARY.map((test) => (
          <Link 
            key={test.id} 
            to={`/tests/${test.id}`}
            className="block bg-surface p-4 rounded-2xl border border-border hover:bg-surface-hover transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex justify-between items-start mb-1 relative z-10">
              <h3 className="font-bold text-base text-ink group-hover:text-primary transition-colors">{test.nameAr}</h3>
            </div>
            <p className="text-xs text-ink2 mb-3 leading-relaxed relative z-10 line-clamp-2">{test.description}</p>
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2 text-[10px] font-bold text-ink2">
                <div className="bg-primary/20 text-primary px-2 py-1 rounded-md">
                  {test.category === 'depression' ? 'اكتئاب' : 
                   test.category === 'anxiety' ? 'قلق' : 
                   test.category === 'stress' ? 'ضغط نفسي' : 
                   test.category === 'personality' ? 'شخصية' : 
                   test.category === 'cognitive' ? 'إدراكي' : 'عام'}
                </div>
                <div className="flex items-center gap-1 bg-border px-2 py-1 rounded-md text-ink">
                  <Clock className="w-3 h-3" />
                  <span>{test.duration} د</span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-ink3 group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
