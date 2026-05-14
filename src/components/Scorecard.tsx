/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Session, Shot } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Target, Trophy, Clock, Ruler } from 'lucide-react';

interface ScorecardProps {
  session: Session;
  onBack: () => void;
}

export default function Scorecard({ session, onBack }: ScorecardProps) {
  // Group shots into ends of 6
  const ends = Array.from({ length: Math.ceil(session.shots.length / 6) || 1 }, (_, i) => 
    session.shots.slice(i * 6, (i + 1) * 6)
  );

  const calculateEndTotal = (endShots: Shot[]) => endShots.reduce((sum, s) => sum + s.score, 0);
  const totalScore = session.shots.reduce((sum, s) => sum + s.score, 0);
  const xCount = session.shots.filter(s => s.is_x).length;
  const tenPlusXCount = session.shots.filter(s => s.score === 10).length;
  const accuracy = session.shots.length > 0 ? (totalScore / (session.shots.length * 10)) * 100 : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group"
        >
          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest">Back to Mission Logs</span>
        </button>
        <div className="text-right">
           <h2 className="text-2xl font-black tracking-tight text-white">{session.name}</h2>
           <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{new Date(session.date).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-[#1a1b1e] border border-white/5 rounded-3xl">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2">Total Score</p>
          <p className="text-4xl font-black text-[#dcfc44] leading-none">{totalScore}</p>
        </div>
        <div className="p-6 bg-[#1a1b1e] border border-white/5 rounded-3xl">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2">Accuracy</p>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-black text-white leading-none">{accuracy.toFixed(1)}</p>
            <span className="text-sm font-bold text-gray-500">%</span>
          </div>
        </div>
        <div className="p-6 bg-[#1a1b1e] border border-white/5 rounded-3xl">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2">10s + Xs</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-white leading-none">{tenPlusXCount}</p>
            <span className="text-xs font-mono text-gray-600">/ {xCount}X</span>
          </div>
        </div>
        <div className="p-6 bg-[#1a1b1e] border border-white/5 rounded-3xl">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2">Avg / Shot</p>
          <p className="text-4xl font-black text-white leading-none">
            {session.shots.length > 0 ? (totalScore / session.shots.length).toFixed(1) : '0.0'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500 px-2">End-by-End Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ends.map((end, endIdx) => {
              const currentTotal = ends.slice(0, endIdx + 1).reduce((sum, e) => sum + calculateEndTotal(e), 0);
              return (
                <div 
                  key={endIdx}
                  className="bg-[#1a1b1e] border border-white/5 rounded-3xl overflow-hidden shadow-xl"
                >
                  <div className="bg-white/5 px-6 py-3 flex justify-between items-center border-b border-white/5">
                    <span className="text-[10px] font-mono text-[#dcfc44] font-bold tracking-widest uppercase">End {endIdx + 1}</span>
                    <span className="text-[10px] font-mono text-gray-500">RUNNING: {currentTotal}</span>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {Array.from({ length: 6 }).map((_, shotIdx) => {
                        const shot = end[shotIdx];
                        return (
                          <div 
                            key={shotIdx}
                            className={`aspect-[3/4] rounded-lg flex items-center justify-center text-sm font-black border transition-colors ${
                              shot 
                                ? shot.score === 10 ? 'bg-[#dcfc44] text-black border-transparent' : 'bg-white/5 text-white border-white/10'
                                : 'bg-transparent border-white/5 text-gray-800'
                            }`}
                          >
                            {shot ? (shot.is_x ? 'X' : (shot.score === 0 ? 'M' : shot.score)) : '-'}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-end border-t border-white/5 pt-4">
                      <div>
                        <p className="text-[8px] uppercase font-mono text-gray-600 tracking-widest mb-1">Subtotal</p>
                        <p className="text-2xl font-black text-white leading-none">{calculateEndTotal(end)}</p>
                      </div>
                      <div className="bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                        <p className="text-[8px] uppercase font-mono text-gray-600 tracking-tighter">10s/Xs</p>
                        <p className="text-sm font-black text-white/40 text-center">
                          {end.filter(s => s.score === 10).length} / {end.filter(s => s.is_x).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-[#1a1b1e] border border-white/5 rounded-3xl">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 mb-6">Mission Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#dcfc44]">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-gray-500 uppercase">Distance</p>
                  <p className="text-sm font-bold text-white">{session.distance} METERS</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#dcfc44]">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-gray-500 uppercase">Target Face</p>
                  <p className="text-sm font-bold text-white uppercase">{session.target_type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#dcfc44]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-gray-500 uppercase">Timestamp</p>
                  <p className="text-sm font-bold text-white">{new Date(session.date).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#dcfc44] rounded-3xl text-black">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Performance Award</h4>
            </div>
            <p className="text-lg font-black leading-tight mb-2">Tactical Precision Expert</p>
            <p className="text-xs font-medium opacity-70">Consistent grouping maintainted across all 6 ends of session.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
