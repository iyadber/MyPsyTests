import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

export default function Onboarding() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.age && user.gender) {
      navigate('/');
    }
  }, [user, navigate]);

  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [role, setRole] = useState<'user' | 'psychologist'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsedAge = parseInt(age);
    if (!parsedAge || parsedAge < 10 || parsedAge > 100) {
      setError('الرجاء إدخال عمر صحيح بين 10 و 100');
      return;
    }
    if (!gender) {
      setError('الرجاء تحديد الجنس');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        age: parsedAge,
        gender,
        role
      };

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updateData);

      // Update local state
      setUser({
        ...user,
        ...updateData
      });
      
      // Navigate to home after successful onboarding
      navigate('/');
    } catch (err: any) {
      if (err instanceof Error) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
      setError('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-paper border border-border shadow-2xl rounded-3xl overflow-hidden p-8"
        dir="rtl"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-ink">مرحباً بك في التطبيق</h2>
          <p className="text-ink3 mt-2 text-sm">نحتاج لبعض المعلومات الأساسية لتقديم أفضل تجربة لك.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-ink mb-1.5">العمر</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
              placeholder="مثال: 25"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-1.5">الجنس</label>
            <div className="grid grid-cols-2 gap-3">
              <label 
                className={`border rounded-xl py-3 px-4 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  gender === 'male' ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-surface border-border text-ink2 hover:bg-paper'
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
                ذكر
              </label>
              <label 
                className={`border rounded-xl py-3 px-4 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  gender === 'female' ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-surface border-border text-ink2 hover:bg-paper'
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
                أنثى
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-1.5">نوع الحساب</label>
            <div className="grid grid-cols-2 gap-3">
              <label 
                className={`border rounded-xl py-3 px-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-center ${
                  role === 'user' ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-surface border-border text-ink2 hover:bg-paper'
                }`}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value="user" 
                  checked={role === 'user'} 
                  onChange={(e) => setRole('user')}
                  className="hidden" 
                />
                <span className="text-sm">مريض</span>
                <span className="text-xs opacity-70 font-normal">أبحث عن اختبارات ومختصين</span>
              </label>
              <label 
                className={`border rounded-xl py-3 px-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-center ${
                  role === 'psychologist' ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-surface border-border text-ink2 hover:bg-paper'
                }`}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value="psychologist" 
                  checked={role === 'psychologist'} 
                  onChange={(e) => setRole('psychologist')}
                  className="hidden" 
                />
                <span className="text-sm">أخصائي نفسي</span>
                <span className="text-xs opacity-70 font-normal">أقدم استشارات وأدير عيادتي</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-light text-paper font-black py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:pointer-events-none mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                المتابعة
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
