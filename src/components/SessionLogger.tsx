/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { Target, Plus, Save, Trash2, X, ChevronRight } from 'lucide-react';
import { Session, Shot } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SessionLoggerProps {
  onSave: (session: Session) => void;
}

export default function SessionLogger({ onSave }: SessionLoggerProps) {
  const [shots, setShots] = useState<Shot[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [distance, setDistance] = useState(18);
  const [targetType, setTargetType] = useState<Session['target_type']>('wa_122');
  
  const handleManualScore = (score: number, is_x: boolean = false) => {
    if (shots.length >= 36) return;

    const newShot: Shot = {
      id: crypto.randomUUID(),
      score,
      is_x,
      distance,
      x: 50, // Default to center for manual entry
      y: 50,
      timestamp: Date.now()
    };

    setShots([...shots, newShot]);
  };

  const removeShot = (id: string) => {
    setShots(shots.filter(s => s.id !== id));
  };

  const undoLastShot = () => {
    setShots(prev => prev.slice(0, -1));
  };

  const handleSave = () => {
    if (shots.length === 0) return;
    onSave({
      id: crypto.randomUUID(),
      name: sessionName || `Session ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      archer_id: '', // To be filled by parent
      shots,
      distance,
      target_type: targetType
    });
  };

  // Group shots into ends of 6
  const ends = Array.from({ length: Math.ceil(shots.length / 6) || 1 }, (_, i) => 
    shots.slice(i * 6, (i + 1) * 6)
  );

  const currentEndIndex = Math.min(ends.length - 1, 5);
  const isSessionComplete = shots.length >= 36;

  const calculateEndTotal = (endShots: Shot[]) => endShots.reduce((sum, s) => sum + s.score, 0);
  const totalScore = shots.reduce((sum, s) => sum + s.score, 0);
  const xCount = shots.filter(s => s.is_x).length;
  const tenPlusXCount = shots.filter(s => s.score === 10).length;

  const scoreButtons = [
    { label: 'X', score: 10, is_x: true, color: 'bg-[#FFE500] text-black ring-4 ring-white/10' },
    { label: '10', score: 10, is_x: false, color: 'bg-[#FFE500] text-black' },
    { label: '9', score: 9, is_x: false, color: 'bg-[#FFE500] text-black' },
    { label: '8', score: 8, is_x: false, color: 'bg-[#EF3340] text-white' },
    { label: '7', score: 7, is_x: false, color: 'bg-[#EF3340] text-white' },
    { label: '6', score: 6, is_x: false, color: 'bg-[#0081C6] text-white' },
    { label: '5', score: 5, is_x: false, color: 'bg-[#0081C6] text-white' },
    { label: '4', score: 4, is_x: false, color: 'bg-[#111111] text-white' },
    { label: '3', score: 3, is_x: false, color: 'bg-[#111111] text-white' },
    { label: '2', score: 2, is_x: false, color: 'bg-[#FFFFFF] text-black border border-black/10' },
    { label: '1', score: 1, is_x: false, color: 'bg-[#FFFFFF] text-black border border-black/10' },
    { label: 'M', score: 0, is_x: false, color: 'bg-gray-500 text-white' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column: Entry & Controls */}
      <div className="flex-1 space-y-6">
        <div className="bg-[#1a1b1e] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#dcfc44]" />
                Manual Entry
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-400 font-mono">END {currentEndIndex + 1} OF 6</p>
                <div className="flex gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < currentEndIndex ? 'bg-[#dcfc44]' : 
                        i === currentEndIndex ? 'bg-[#dcfc44] animate-pulse' : 'bg-white/10'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4 items-end">
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Running Total</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-[#dcfc44] leading-none">{totalScore}</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-center">
                <p className="text-[8px] text-gray-500 uppercase font-mono">10+X / X</p>
                <p className="text-sm font-mono text-white">{tenPlusXCount} / {xCount}</p>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-[500px] mx-auto transition-opacity ${isSessionComplete ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
            {scoreButtons.map((btn) => (
              <motion.button
                key={`${btn.label}-${btn.score}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleManualScore(btn.score, btn.is_x)}
                className={`${btn.color} h-16 sm:h-20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-lg shadow-black/20 transition-all hover:brightness-110 active:brightness-90`}
              >
                {btn.label}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={undoLastShot}
              disabled={shots.length === 0}
              className="h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all disabled:opacity-30"
            >
              <Trash2 size={20} className="mb-1" />
              <span className="text-[10px] font-mono uppercase tracking-widest">Undo</span>
            </motion.button>
          </div>

          {isSessionComplete && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30"
            >
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-[#dcfc44] text-black rounded-full flex items-center justify-center mx-auto mb-4 font-black">
                  36
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Session Complete</h3>
                <p className="text-sm text-gray-400 font-mono mb-8">TOTAL SCORE: {totalScore}</p>
                <button 
                  onClick={handleSave}
                  className="px-12 py-4 bg-[#dcfc44] text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(220,252,68,0.3)]"
                >
                  Sync Official Scorecard
                </button>
              </div>
            </motion.div>
          )}

          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-2 block">Mission Parameters</label>
                <input 
                  type="text" 
                  placeholder="Session Name" 
                  value={sessionName}
                  onChange={e => setSessionName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#dcfc44] text-white text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-2 block">Distance (m)</label>
                <input 
                  type="number" 
                  value={distance}
                  onChange={e => setDistance(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#dcfc44] text-white text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-2 block">Target Configuration</label>
              <select 
                value={targetType}
                onChange={e => setTargetType(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#dcfc44] text-white text-sm [&_option]:bg-[#1a1b1e] [&_option]:text-white [&_optgroup]:bg-[#1a1b1e] [&_optgroup]:text-gray-400 [&_optgroup]:font-mono [&_optgroup]:text-[10px] [&_optgroup]:uppercase"
              >
                <optgroup label="Outdoor (WA)">
                  <option value="wa_122">WA 122cm</option>
                  <option value="wa_80">WA 80cm</option>
                </optgroup>
                <optgroup label="Indoor">
                  <option value="indoor_60">Indoor 60cm</option>
                  <option value="indoor_40">Indoor 40cm</option>
                </optgroup>
                <optgroup label="Field">
                  <option value="field_80">Field 80cm</option>
                  <option value="field_65">Field 65cm</option>
                  <option value="field_50">Field 50cm</option>
                  <option value="field_35">Field 35cm</option>
                  <option value="field_20">Field 20cm</option>
                </optgroup>
                <optgroup label="Practice & Other">
                  <option value="foam_40x48">Foam 40"x48"</option>
                  <option value="foam_25x32">Foam 25"x32"</option>
                  <option value="3d">3D Target</option>
                </optgroup>
              </select>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShots([])}
                className="flex-1 py-3 border border-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-xs font-mono uppercase tracking-widest"
              >
                Reset Session
              </button>
              <button 
                onClick={handleSave}
                disabled={shots.length === 0}
                className="flex-[2] py-3 bg-[#dcfc44] text-black rounded-xl font-extrabold text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Sync Final Score
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Scorecard */}
      <div className="w-full lg:w-96 space-y-4">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500 mb-4 px-2">Official Scorecard v1.2</h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {ends.length === 0 && (
              <p className="text-center py-16 text-gray-700 font-mono text-xs border-2 border-dashed border-white/5 rounded-3xl italic">Awaiting first tactical logging...</p>
            )}
            {ends.map((end, endIdx) => {
              const currentTotal = ends.slice(0, endIdx + 1).reduce((sum, e) => sum + calculateEndTotal(e), 0);
              return (
                <motion.div 
                  key={endIdx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#1a1b1e] border border-white/5 rounded-2xl overflow-hidden shadow-xl"
                >
                  <div className="bg-white/5 px-4 py-2 flex justify-between items-center border-b border-white/5">
                    <span className="text-[10px] font-mono text-[#dcfc44] font-bold tracking-widest">END {String(endIdx + 1).padStart(2, '0')}</span>
                    <span className="text-[10px] font-mono text-gray-500">CUMULATIVE: {currentTotal}</span>
                  </div>
                  <div className="p-4 bg-black/20">
                    <div className="grid grid-cols-6 gap-1.5 mb-4">
                      {Array.from({ length: 6 }).map((_, shotIdx) => {
                        const shot = end[shotIdx];
                        return (
                          <div 
                            key={shotIdx}
                            className={`aspect-[3/4] rounded flex flex-col items-center justify-center text-sm font-black border transition-colors ${
                              shot 
                                ? shot.score === 10 ? 'bg-[#dcfc44] text-black border-transparent' : 'bg-white/5 text-white border-white/10'
                                : 'bg-transparent border-white/5 text-gray-800'
                            }`}
                          >
                            <span className="text-xs leading-none">{shot ? (shot.is_x ? 'X' : (shot.score === 0 ? 'M' : shot.score)) : '-'}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-3">
                      <div className="flex gap-6">
                        <div>
                          <p className="text-[7px] uppercase font-mono text-gray-600 tracking-widest mb-1">Subtotal</p>
                          <p className="text-xl font-black text-white leading-none">{calculateEndTotal(end)}</p>
                        </div>
                        <div>
                          <p className="text-[7px] uppercase font-mono text-gray-600 tracking-widest mb-1">X/10s</p>
                          <p className="text-xl font-black text-white/30 leading-none">
                            {end.filter(s => s.score === 10).length}
                          </p>
                        </div>
                      </div>
                      {end.length < 6 && endIdx === ends.length - 1 && (
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#dcfc44] animate-pulse" />
                          <span className="text-[9px] text-[#dcfc44] font-mono font-bold tracking-widest">LOGGING</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {shots.length > 0 && (
          <div className="mt-8 p-6 bg-[#dcfc44] rounded-3xl text-black">
            <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] mb-1 opacity-60">Final Forecast</p>
            <div className="flex items-baseline justify-between">
              <p className="text-4xl font-black tracking-tighter">{totalScore}</p>
              <div className="text-right">
                <p className="text-xl font-black">{((totalScore / (shots.length * 10)) * 100).toFixed(1)}%</p>
                <p className="text-[8px] font-bold uppercase tracking-tighter opacity-70">Accuracy Rating</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
