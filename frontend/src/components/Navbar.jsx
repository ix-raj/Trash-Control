import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { MapPin, LayoutDashboard, Trophy, BookOpen, LogOut, LogIn, Gift, Users, ShieldCheck, Plus, Recycle, Menu, X, PlusCircle, ClipboardList, BarChart3, Home } from 'lucide-react';

const citizenLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/map', label: 'Waste map', icon: MapPin },
  { to: '/report-waste', label: 'Report waste', icon: PlusCircle },
  { to: '/events', label: 'Cleanup campaigns', icon: Users },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/marketplace', label: 'Rewards', icon: Gift },
  { to: '/awareness', label: 'Learning hub', icon: BookOpen }
];

const adminLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/reports', label: 'Reports', icon: ClipboardList },
  { to: '/admin/map', label: 'Operations map', icon: MapPin },
  { to: '/admin/campaigns', label: 'Campaigns', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: ShieldCheck }
];

const Navbar = ({ onSidebarExpandedChange }) => {
  const { user, logout } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const setExpanded = (expanded) => {
    setCollapsed(!expanded);
    onSidebarExpandedChange?.(expanded);
  };
  
  const handleLogout = () => { logout(); navigate('/'); };
  
  const items = user?.role === 'admin'
    ? adminLinks
    : citizenLinks.filter((item) => user || !['/report-waste', '/events', '/marketplace'].includes(item.to));

  const nav = (
    <div className="flex flex-col gap-2">
      {items.map(({ to, label, icon: Icon }) => { 
        const active = location.pathname === to; 
        return (
          <Link 
            key={to} 
            to={to} 
            title={collapsed ? label : undefined} 
            className={`group flex items-center rounded-lg py-3 text-sm font-semibold transition-colors ${
              collapsed ? 'justify-center px-0' : 'gap-3 px-3'
            } ${
              active ? 'bg-[#e5f0e5] text-[#1f6e5f] shadow-[inset_3px_0_0_#1f6e5f]' : 'text-[#587065] hover:bg-[#f0f6ef] hover:text-[#1f6e5f]'
            }`}
          >
            <Icon className="h-[20px] w-[20px] shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ); 
      })}
    </div>
  );

  return (
    <div>
      {/* Top Header */}
      <header className="sticky top-0 z-[2000] flex h-[72px] items-center justify-between border-b border-dark-border bg-white/95 px-5 backdrop-blur-md sm:px-8">
        <Link to="/" onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)} className="flex items-center gap-3 text-[#173d32]">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f6e5f] text-white shadow-sm">
            <Recycle className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[15px] font-extrabold tracking-[.18em]">TRASH CONTROL</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[.16em] text-[#6b8475]">Civic operations platform</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <Link to="/profile" className="hidden rounded-lg border border-dark-border px-3 py-2 text-sm font-bold text-[#31594b] hover:bg-[#eef5ed] sm:block">
                {user.username}
              </Link>
              <button onClick={handleLogout} title="Log out" className="hidden rounded-lg p-2 text-[#6b8475] hover:bg-[#fff1eb] hover:text-[#a04d32] sm:block">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden items-center gap-1 px-3 py-2 text-sm font-semibold text-[#587065] sm:flex">
                <LogIn className="h-4 w-4" />Log in
              </Link>
              <Link to="/register" className="hidden items-center gap-2 rounded-lg bg-[#1f6e5f] px-4 py-2 text-sm font-bold text-white sm:flex">
                <Plus className="h-4 w-4" />Join the network
              </Link>
            </>
          )}
          <button onClick={() => { setMobileOpen(true); setExpanded(true); }} className="rounded-lg p-2 text-[#31594b] hover:bg-[#eef5ed] lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
        </div>
      </header>
      
      {/* Previous floating navigation treatment. The page shell still reserves layout space in App.jsx. */}
      <aside 
        onMouseEnter={() => setExpanded(true)} 
        onMouseLeave={() => setExpanded(false)} 
        className={`fixed left-2 top-1/2 z-[2100] -translate-y-1/2 rounded-2xl border border-[#d5e2d5] bg-white/95 px-2 py-4 shadow-[0_16px_38px_rgba(29,83,68,.14)] backdrop-blur-md transition-[width] duration-200 sm:left-5 ${mobileOpen ? 'block' : 'hidden'} lg:block ${collapsed ? 'w-[64px]' : 'w-[216px]'}`}
      >
        <button onClick={() => { setMobileOpen(false); setExpanded(false); }} aria-label="Close navigation" className="mb-2 ml-auto block rounded-md p-1 text-[#6b8475] hover:bg-[#eef5ed] lg:hidden"><X className="h-4 w-4" /></button>
        {nav}
      </aside>
    </div>
  );
};

export default Navbar;
