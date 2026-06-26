'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Zap, LayoutDashboard, Users, LogOut, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/leads', icon: Users, label: 'Leads' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/login');
  };

  const userStr = typeof window !== 'undefined' ? Cookies.get('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <aside className="w-60 bg-indigo-950 text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-indigo-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/30">
            <Zap className="w-4.5 h-4.5 text-white w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">Mini AI SDR</div>
            <div className="text-xs text-indigo-400">Sales Intelligence</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-indigo-300 hover:bg-indigo-900 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
            {(pathname === href || pathname.startsWith(href + '/')) && (
              <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
            )}
          </Link>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-indigo-900">
        {user && (
          <div className="px-3 py-2 mb-2">
            <div className="text-xs font-medium text-white truncate">{user.full_name || user.username}</div>
            <div className="text-xs text-indigo-400 truncate">{user.email}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-300 hover:bg-red-900/30 hover:text-red-300 transition-all duration-150 w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
