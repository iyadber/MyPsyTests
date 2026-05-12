import React, { useState } from 'react';
import { useAuthStore } from '../store';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Loader2, Save, User as UserIcon, Calendar, ShieldCheck, UserCircle, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [age, setAge] = useState<string>(user?.age?.toString() || '');
  const [gender, setGender] = useState<'male' | 'female' | ''>(user?.gender || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);
    
    try {
      const parsedAge = age ? parseInt(age, 10) : null;
      if (parsedAge && (parsedAge < 10 || parsedAge > 120)) {
         throw new Error("الرجاء إدخال عمر صحيح بين 10 و 120 سنة");
      }

      const updateData: any = {};
      if (parsedAge) updateData.age = parsedAge;
      if (gender) updateData.gender = gender;

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updateData);
      
      setUser({ ...user, ...updateData });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      if (err instanceof Error) {
        if (err.message.includes('10')) {
          setError(err.message);
        } else {
          handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const roleText = {
    user: 'مريض',
    psychologist: 'أخصائي نفسي',
    specialist: 'أخصائي',
    admin: 'مدير النظام'
  };

  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير معروف';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-black text-ink tracking-tight flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-primary" />
            الملف الشخصي
          </h2>
          <p className="text-ink3 mt-1.5 text-sm leading-relaxed max-w-2xl">إدارة بياناتك الشخصية لتحليل أدق من الذكاء الاصطناعي وتقارير مخصصة.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* User Info Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <motion.div 
             initial={{ opacity: 0, y: 15 }} 
             animate={{ opacity: 1, y: 0 }} 
             transition={{ delay: 0.1 }}
             className="bg-surface border border-border p-5 rounded-xl shadow-sm text-center flex flex-col items-center"
          >
             <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 border-4 border-paper shadow-sm">
               <UserIcon className="w-10 h-10" />
             </div>
             <h3 className="text-xl font-bold text-ink w-full truncate px-2" title={user.displayName}>{user.displayName}</h3>
             <p className="text-sm font-medium text-ink3 mt-1 w-full truncate px-2" dir="ltr" title={user.email || ''}>{user.email}</p>
             
             <div className="inline-flex items-center gap-1.5 bg-paper border border-border px-3 py-1.5 rounded-lg text-xs font-bold text-ink mt-4 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                {roleText[user.role] || 'مستخدم'}
             </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 15 }} 
             animate={{ opacity: 1, y: 0 }} 
             transition={{ delay: 0.2 }}
             className="bg-surface border border-border p-4 rounded-xl shadow-sm space-y-3 hidden md:block"
          >
             <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-paper border border-border flex items-center justify-center text-ink3 shrink-0 shadow-sm">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-ink3 font-semibold mb-0.5">تاريخ الانضمام</p>
                  <p className="text-sm font-bold text-ink">{joinDate}</p>
                </div>
             </div>
             
             <hr className="border-border" />
             
             <Link to="/history" className="flex items-center justify-between text-sm group hover:bg-paper -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink group-hover:text-primary transition-colors">سجل الاختبارات</p>
                  </div>
                </div>
             </Link>

             {user.role === 'psychologist' && (
               <Link to="/clinic-profile" className="flex items-center justify-between text-sm group hover:bg-paper -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink group-hover:text-emerald-500 transition-colors">إدارة العيادة</p>
                    </div>
                  </div>
               </Link>
             )}
          </motion.div>
        </div>

        {/* Edit Form */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="md:col-span-2 bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col"
        >
          <div className="p-4 sm:p-5 border-b border-border bg-paper/50">
             <h3 className="text-base font-bold text-ink items-center gap-2 flex">
               البيانات الحيوية
             </h3>
             <p className="text-[11px] sm:text-xs text-ink3 mt-1">تساعد هذه البيانات الذكاء الاصطناعي في تقديم تحليلات دقيقة وتقارير مخصصة تناسب فئتك العمرية.</p>
          </div>
          
          <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-5 flex-1 flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">العمر</label>
                <div className="relative">
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-paper border border-border rounded-lg py-2.5 px-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-bold placeholder:font-normal placeholder:text-ink3 shadow-sm"
                    placeholder="عمرك بالسنوات (مثال: 25)"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink3 text-[10px] font-bold">
                    سنة
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">الجنس</label>
                <div className="grid grid-cols-2 gap-2">
                  <label 
                    className={`border rounded-lg py-2.5 px-3 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm ${
                      gender === 'male' ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-paper border-border text-ink2 hover:bg-surface'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="gender" 
                      value="male" 
                      checked={gender === 'male'} 
                      onChange={(e) => setGender('male')}
                      className="hidden" 
                    />
                    <span className="text-sm">ذكر</span>
                  </label>
                  <label 
                    className={`border rounded-lg py-2.5 px-3 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm ${
                      gender === 'female' ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-paper border-border text-ink2 hover:bg-surface'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="gender" 
                      value="female" 
                      checked={gender === 'female'} 
                      onChange={(e) => setGender('female')}
                      className="hidden" 
                    />
                    <span className="text-sm">أنثى</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex-1"></div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold border border-red-500/20">
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold border border-emerald-500/20">
                تم حفظ البيانات بنجاح!
              </motion.div>
            )}

            <div className="pt-2 flex justify-end mt-auto">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-light hover:text-primary text-paper border border-transparent hover:border-primary font-bold py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none text-sm w-full sm:w-auto shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                حفظ التغييرات
              </button>
            </div>
          </form>
        </motion.div>
        
        {/* Mobile quick links */}
        <div className="md:hidden mt-2 flex gap-2">
            <Link to="/history" className="flex-1 bg-surface border border-border p-3 rounded-xl flex items-center gap-3 hover:border-primary/30 transition-colors shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">سجل الاختبارات</p>
                </div>
            </Link>
            <div className="flex-1 bg-surface border border-border p-3 rounded-xl flex items-center gap-3 shadow-sm">
               <div className="w-8 h-8 rounded-lg bg-paper border border-border flex items-center justify-center text-ink3 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-ink3 font-semibold mb-0.5">تاريخ الانضمام</p>
                  <p className="text-xs font-bold text-ink leading-none">{joinDate}</p>
                </div>
            </div>
        </div>
        {user.role === 'psychologist' && (
          <div className="md:hidden mt-2 flex gap-2">
            <Link to="/clinic-profile" className="flex-1 bg-surface border border-border p-3 rounded-xl flex items-center gap-3 hover:border-emerald-500/30 transition-colors shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">إدارة العيادة</p>
                </div>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
