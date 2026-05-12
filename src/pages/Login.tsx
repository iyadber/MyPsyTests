import { Navigate } from 'react-router';
import { useAuthStore, useThemeStore } from '../store';
import { loginWithGoogle } from '../lib/firebase';
import { Sparkles, Moon, Sun } from 'lucide-react';

export default function Login() {
  const user = useAuthStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-paper max-w-md mx-auto items-center justify-center p-6 relative overflow-hidden border-x border-border">
      <div className="absolute top-4 left-4 z-20">
        <button onClick={toggleTheme} className="p-2 text-ink2 hover:text-ink transition-colors bg-surface border border-border rounded-full" aria-label="Toggle Theme">
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 border border-primary/20">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-ink mb-2">اختباراتي</h1>
        <p className="text-ink3 text-center mb-10 leading-relaxed max-w-[260px]">
          اكتشف المزيد عن نفسك عبر اختبارات نفسية ذكية وموثوقة
        </p>

        <button 
          onClick={loginWithGoogle}
          className="w-full bg-surface border border-border text-ink font-bold py-4 px-6 rounded-3xl flex items-center justify-center gap-3 hover:bg-surface-hover transition-all active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          تسجيل الدخول باستخدام جوجل
        </button>
      </div>
    </div>
  );
}
