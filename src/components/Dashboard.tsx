/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Session, PerformanceStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Target, TrendingUp, Zap, Award } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

interface DashboardProps {
  sessions: Session[];
  onViewSession: (id: string) => void;
}

export default function Dashboard({ sessions, onViewSession }: DashboardProps) {
  const { theme } = useTheme();
  const stats: PerformanceStats = {
    averageScore: sessions.length > 0 
      ? sessions.reduce((acc, s) => acc + (s.shots.reduce((sum, shot) => sum + shot.score, 0) / s.shots.length), 0) / sessions.length
      : 0,
    totalShots: sessions.reduce((acc, s) => acc + s.shots.length, 0),
    bestSession: sessions.length > 0 
      ? Math.max(...sessions.map(s => s.shots.reduce((sum, shot) => sum + shot.score, 0) / s.shots.length))
      : 0,
    consistencyScore: 0.85, // Mock for now
    progressTrend: 'up'
  };

  const chartData = sessions.slice(-10).map(s => ({
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    avg: s.shots.length > 0 ? (s.shots.reduce((sum, sh) => sum + sh.score, 0) / s.shots.length).toFixed(1) : 0,
    total: s.shots.reduce((sum, sh) => sum + sh.score, 0)
  }));

  const scannableData = [
    { label: 'Avg Score', value: stats.averageScore.toFixed(1), icon: Target, trend: '+2.4%' },
    { label: 'Total Arrows', value: stats.totalShots, icon: Zap, trend: '+12' },
    { label: 'Best Avgerage', value: stats.bestSession.toFixed(1), icon: Award, trend: 'Personal Best' },
    { label: 'Form Score', value: '88', icon: TrendingUp, trend: 'Stable' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Archer Intel</h2>
          <p className="text-[var(--muted)]">Analyzing performance across {sessions.length} sessions</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 rounded bg-[var(--line)] border border-[var(--line)] text-[var(--muted)] text-xs font-mono">ID: ARCH_9921</div>
          <div className="px-3 py-1 rounded bg-[var(--accent)] text-[var(--bg)] text-xs font-bold font-mono shadow-sm">STATUS: OPTIMAL</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {scannableData.map((item, idx) => (
          <div key={idx} className="bg-[var(--card-bg)] border border-[var(--line)] p-6 rounded-2xl relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-[var(--accent)] opacity-[0.02] rounded-full translate-x-12 -translate-y-12 group-hover:opacity-[0.05] transition-opacity`} />
            <item.icon className="w-5 h-5 text-[var(--accent)] mb-4" />
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-widest text-[var(--muted)]">{item.label}</p>
              <h3 className="text-2xl font-bold">{item.value}</h3>
              <p className="text-[10px] text-[var(--accent)] font-medium">{item.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card-bg)] border border-[var(--line)] p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Accuracy Trend</h3>
            <div className="flex gap-1">
              {['1W', '1M', '3M', 'ALL'].map(t => (
                <button key={t} className={`px-2 py-1 text-[10px] font-mono rounded ${t === '1M' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--muted)] hover:bg-[var(--line)]'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? '#dcfc44' : '#2c3e50'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme === 'dark' ? '#dcfc44' : '#2c3e50'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1a1b1e' : '#ffffff', 
                    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, 
                    borderRadius: '12px',
                    color: theme === 'dark' ? '#ffffff' : '#000000'
                  }}
                />
                <Area type="monotone" dataKey="avg" stroke={theme === 'dark' ? '#dcfc44' : '#2c3e50'} fillOpacity={1} fill="url(#colorAvg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--line)] p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold mb-8">Session Volume</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1a1b1e' : '#ffffff', 
                    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, 
                    borderRadius: '12px' 
                  }}
                />
                <Bar dataKey="total" fill={theme === 'dark' ? '#3b82f6' : '#2563eb'} radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Sessions List */}
      <div className="bg-[var(--card-bg)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[var(--line)]">
          <h3 className="text-lg font-bold">Recent Logs</h3>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {sessions.length === 0 ? (
            <div className="p-12 text-center text-[var(--muted)] font-mono text-xs uppercase tracking-widest">
              No tactical data detected
            </div>
          ) : (
            sessions.slice().reverse().map(session => (
              <button 
                key={session.id} 
                onClick={() => onViewSession(session.id)}
                className="w-full text-left p-4 hover:bg-[var(--line)] transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--line)] border border-[var(--line)] flex items-center justify-center font-mono text-xs group-hover:border-[var(--accent)] transition-colors">
                    {session.shots.length}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm group-hover:text-[var(--accent)] transition-colors">{session.name || 'Training Session'}</h4>
                    <p className="text-[10px] text-[var(--muted)] font-mono italic uppercase">{new Date(session.date).toDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-[var(--accent)]">
                    {(session.shots.reduce((a, b) => a + b.score, 0) / session.shots.length || 0).toFixed(1)} AVG
                  </p>
                  <p className="text-[10px] text-[var(--muted)]">{session.distance}m • {session.target_type.toUpperCase()}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
