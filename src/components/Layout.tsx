import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { Home, Library, Activity, LogOut, Loader2, Moon, Sun, User } from 'lucide-react';
import { useAuthStore, useThemeStore } from '../store';
import { logout } from '../lib/firebase';
import { useEffect } from 'react';

export default function Layout() {
  const user = useAuthStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user && location.pathname !== '/login') {
      navigate('/login');
    } else if (user && (!user.age || !user.gender)) {
      navigate('/onboarding');
    }
  }, [user, navigate, location]);

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center p-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-paper max-w-md mx-auto relative overflow-hidden border-x border-border">
      <header className="bg-surface border-b border-border p-4 sticky top-0 z-10 flex justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <h1 className="font-bold text-xl text-ink uppercase tracking-wider">NAFSI</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleTheme} className="p-2 text-ink2 hover:text-ink transition-colors" aria-label="Toggle Theme">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button onClick={() => logout()} className="p-2 text-ink2 hover:text-ink transition-colors" aria-label="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 p-5 scroll-smooth">
        <Outlet />
      </main>

      <nav className="bg-surface border-t border-border p-2 fixed bottom-0 w-full max-w-md flex justify-around items-center z-10 pb-safe">
        <NavLink to="/" icon={<Home />} label="الرئيسية" active={location.pathname === '/'} />
        {user?.role === 'psychologist' ? (
          <>
            <NavLink to="/appointments" icon={<Activity />} label="المواعيد" active={location.pathname.startsWith('/appointments')} />
            <NavLink to="/clinic-profile" icon={<Library />} label="العيادة" active={location.pathname.startsWith('/clinic-profile')} />
          </>
        ) : (
          <>
            <NavLink to="/tests" icon={<Library />} label="المكتبة" active={location.pathname.startsWith('/tests')} />
            <NavLink to="/history" icon={<Activity />} label="سجلي" active={location.pathname.startsWith('/history')} />
          </>
        )}
        <NavLink to="/profile" icon={<User />} label="حسابي" active={location.pathname.startsWith('/profile')} />
      </nav>
    </div>
  );
}

import { ReactNode } from 'react';

function NavLink({ to, icon, label, active }: { to: string, icon: ReactNode, label: string, active: boolean }) {
  return (
    <Link to={to} className={`flex flex-col items-center gap-1 p-2 min-w-[4rem] transition-colors ${active ? 'text-primary' : 'text-ink3 hover:text-ink2'}`}>
      <div className={`[&>svg]:w-6 [&>svg]:h-6 ${active ? 'fill-primary/20' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  );
}
