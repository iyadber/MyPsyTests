import React, { useState } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '../store';
import { loginWithEmail, signupWithEmail } from '../lib/firebase';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const user = useAuthStore((state) => state.user);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('يرجى ملء الحقول المطلوبة');
      return;
    }

    if (isSignUp && !formData.username) {
      setError('يرجى إدخال اسم المستخدم');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (isSignUp) {
        await signupWithEmail(formData.email, formData.password, formData.username);
      } else {
        await loginWithEmail(formData.email, formData.password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('البريد الإلكتروني مستخدم بالفعل');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('تسجيل الدخول بالبريد الإلكتروني غير مفعل في إعدادات Firebase');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة جداً');
      } else {
        setError(err.message || 'حدث خطأ غير متوقع');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-gradient-to-br from-[#8ba1f4] via-[#c4aff2] to-[#a0e4d4]" dir="rtl">
      {/* Mesh/Gradient overlays to mimic the design */}
      <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-transparent to-white/10" />
      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-[#7caaf0] opacity-30 blur-[100px]" />
      <div className="absolute bottom-[20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-[#fdf5f5] opacity-40 blur-[120px]" />
      <div className="absolute top-[20%] right-[10%] w-[60%] h-[60%] rounded-full bg-[#a0e4d4] opacity-30 blur-[80px]" />

      <div className="relative z-10 flex flex-col h-full grow">
        {/* Top Header Area */}
        <div className="pt-6 px-5 pb-4 flex-shrink-0">
          <div className="mb-2">
            <h1 className="text-xl font-bold text-white tracking-wide">اختباراتي</h1>
          </div>

          <h2 className="text-[1.75rem] leading-tight font-semibold text-white mb-1.5">
            {isSignUp ? 'افتح مستقبلك' : 'ادخل مساحتك'}
          </h2>
          <p className="text-white/90 text-sm max-w-[280px] leading-relaxed font-light">
            {isSignUp 
              ? 'سجل اليوم لاستكشاف وترتيب وإحياء أفكارك الإبداعية هنا.'
              : 'سجل الدخول لاستكشاف وإحياء أفكارك الإبداعية حيث يلتقي الإلهام.'}
          </p>
        </div>

        {/* Bottom Card Form Area */}
        <div className="flex-grow bg-white rounded-t-[32px] px-5 pt-5 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex flex-col">
          {/* Segmented Control */}
          <div className="flex p-1 bg-[#f4f5f7] rounded-full mb-4">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                !isSignUp 
                  ? 'bg-gradient-to-r from-[#94aef1] to-[#bca6ed] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                isSignUp 
                  ? 'bg-gradient-to-r from-[#6edac4] to-[#4ab9a4] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              إنشاء حساب
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <div className="space-y-3">
              {error && (
                <div className="p-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center border border-red-100">
                  {error}
                </div>
              )}

              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-800 block">اسم المستخدم</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="block w-full pr-10 pl-3 py-2.5 bg-[#f8f9fb] border-none rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:bg-gray-100 focus:ring-0 font-sans"
                      placeholder="اسم المستخدم"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-800 block">البريد الإلكتروني</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pr-10 pl-3 py-2.5 bg-[#f8f9fb] border-none rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:bg-gray-100 focus:ring-0 font-sans"
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-800 block">كلمة المرور</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pr-10 pl-10 py-2.5 bg-[#f8f9fb] border-none rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:bg-gray-100 focus:ring-0 font-sans tracking-widest font-mono"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {!isSignUp && (
              <div className="mt-2 text-left">
                <button type="button" className="text-xs text-gray-500 hover:text-gray-800 font-medium">
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}

            <div className="mt-auto pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#111111] text-white font-semibold py-3 rounded-full text-sm transition-all hover:bg-black active:scale-[0.98] flex items-center justify-center gap-2 mb-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>{isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}</>
                )}
              </button>
              
              <div className="w-full flex justify-center pb-1 mt-3">
                 <div className="w-1/3 h-1 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

