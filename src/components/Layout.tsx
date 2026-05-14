/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, Target, Camera, History, Menu, X, ArrowRight, User, LogOut, Zap, Sun, Moon } from 'lucide-react';
import { ViewState } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { auth } from '../lib/firebase';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
  userName?: string;
}

export default function Layout({ children, activeView, onViewChange, userName }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Performance', icon: LayoutDashboard },
    { id: 'log_session', label: 'Log Session', icon: Target },
    { id: 'analyze_form', label: 'AI Coach', icon: Camera },
    { id: 'arrow_tool', label: 'Arrow Calculator', icon: Zap },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--card-bg)] border-r border-[var(--line)] p-6 z-20">
        <div 
          className="flex items-center gap-3 mb-12 cursor-pointer group"
          onClick={() => onViewChange('dashboard')}
        >
          <div className="w-10 h-10 rounded-full bg-[#dcfc44] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Target className="text-black w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter">BULLSEYE AI</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeView === item.id 
                  ? 'bg-[#dcfc44] text-black font-medium shadow-[0_0_20px_rgba(220,252,68,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-[var(--accent)] hover:bg-[var(--line)] transition-all font-mono text-xs uppercase tracking-widest"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-[#dcfc44]" /> : <Moon className="w-5 h-5 text-[#2c3e50]" />}
            <span>{theme === 'dark' ? 'Day Ops' : 'Night Ops'}</span>
          </button>

          <div className="bg-[var(--line)] rounded-xl p-4 border border-[var(--line)]">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">PRO STATUS</p>
            <p className="text-sm font-medium">Verified Operative</p>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all text-xs font-mono uppercase tracking-widest"
          >
            <LogOut className="w-3 h-3" />
            Terminate
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[var(--card-bg)] border-b border-[var(--line)] z-30">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onViewChange('dashboard')}
        >
          <Target className="text-[var(--accent)] w-6 h-6" />
          <span className="font-bold tracking-tight">BULLSEYE AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 text-gray-400 transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-[#dcfc44]" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-x-0 top-16 bg-[#111113] border-b border-white/10 p-6 z-20"
          >
            <nav className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id as ViewState);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                    activeView === item.id ? 'bg-[#dcfc44] text-black' : 'text-gray-400'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto technical-grid relative flex flex-col">
        {/* Top Header for Profile */}
        <header className="flex justify-end items-center gap-6 p-6 md:p-8 shrink-0">
          <button 
            onClick={() => onViewChange('profile')}
            className={`w-14 h-14 rounded-full border-2 transition-all flex items-center justify-center font-bold font-mono text-lg shrink-0 ${
              activeView === 'profile' 
                ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--bg)] shadow-[0_0_20px_rgba(var(--accent),0.4)]' 
                : 'border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)]'
            }`}
          >
            {userName ? userName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
          </button>
        </header>

        <div className="flex-1 p-4 md:p-12 md:pt-0 max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
