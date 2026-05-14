/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Target, Info, RefreshCw, Zap, ArrowDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { calculateArrowSpecs, calculateDrawLength, calculateArrowSpine, getIdealArrowLength } from '../lib/archerUtils';
import AIAssistant from './AIAssistant';

export default function ArrowGuider() {
  const [inputs, setInputs] = useState({
    bow_type: 'recurve' as 'recurve' | 'compound' | 'traditional',
    draw_weight: 30,
    draw_length: 28,
    arrow_length: 29.5,
    point_weight: 100,
  });

  const [syncLength, setSyncLength] = useState(true);

  const [spine, setSpine] = useState(
    calculateArrowSpine(inputs.arrow_length, inputs.draw_weight, inputs.bow_type, inputs.point_weight)
  );

  // Sync Draw Length -> Arrow Length
  useEffect(() => {
    if (syncLength) {
      setInputs(prev => ({
        ...prev,
        arrow_length: getIdealArrowLength(prev.draw_length)
      }));
    }
  }, [inputs.draw_length, syncLength]);

  useEffect(() => {
    setSpine(calculateArrowSpine(inputs.arrow_length, inputs.draw_weight, inputs.bow_type, inputs.point_weight));
  }, [inputs]);

  // Dynamic Analysis Metrics
  const getFOCStatus = () => {
    if (inputs.point_weight >= 175) return 'Extreme FOC';
    if (inputs.point_weight >= 125) return 'High FOC';
    if (inputs.point_weight <= 90) return 'Standard FOC';
    return 'Stable Selection';
  };

  const getSpeedStatus = () => {
    const powerFactor = inputs.draw_weight / (inputs.point_weight / 5);
    if (powerFactor > 2.5) return 'High Velocity';
    if (powerFactor < 1.2) return 'Heavy / Impact';
    return 'Optimal';
  };

  const getStabilityStatus = () => {
    const delta = inputs.arrow_length - inputs.draw_length;
    if (delta > 2.5) return 'Highly Forgiving';
    if (delta < 0.8) return 'Critical Node';
    return 'Stable Node Positioning';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Arrow Calculator</h1>
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Precision Spine & Performance Analysis</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-[#151619] border border-white/10 rounded-3xl p-8 space-y-10">
            {/* Bow Section */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-mono uppercase text-[#dcfc44] tracking-widest flex items-center gap-2">
                <Zap size={14} />
                1. Bow Configuration
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-mono text-gray-500">Bow Type</label>
                  <div className="flex gap-2">
                    {['recurve', 'compound', 'traditional'].map(type => (
                      <button
                        key={type}
                        onClick={() => setInputs({ ...inputs, bow_type: type as any })}
                        className={`flex-1 py-3 rounded-xl border text-[10px] font-mono uppercase transition-all ${
                          inputs.bow_type === type ? 'bg-[#dcfc44] border-[#dcfc44] text-black' : 'border-white/10 text-gray-400 hover:border-white/30'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-mono text-gray-500 flex justify-between">
                    <span>Actual Draw Weight</span>
                    <span className="text-[#dcfc44] font-bold">{inputs.draw_weight}#</span>
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="80"
                    value={inputs.draw_weight}
                    onChange={(e) => setInputs({ ...inputs, draw_weight: parseInt(e.target.value) })}
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#dcfc44]"
                  />
                </div>
              </div>
            </div>

            {/* Archer Section */}
            <div className="space-y-6 border-t border-white/5 pt-8">
              <h4 className="text-[10px] font-mono uppercase text-[#dcfc44] tracking-widest flex items-center gap-2">
                <RefreshCw size={14} />
                2. Draw Dynamics
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-mono text-gray-500 flex justify-between">
                    <span>Draw Length</span>
                    <span className="text-[#dcfc44] font-bold">{inputs.draw_length}"</span>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="34"
                    step="0.5"
                    value={inputs.draw_length}
                    onChange={(e) => setInputs({ ...inputs, draw_length: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#dcfc44]"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-mono text-gray-500">Shaft Length</label>
                    <button 
                      onClick={() => setSyncLength(!syncLength)}
                      className={`text-[8px] font-mono px-2 py-0.5 rounded-full border transition-colors ${syncLength ? 'bg-[#dcfc44] text-black border-[#dcfc44]' : 'bg-white/5 text-gray-500 border-white/10'}`}
                    >
                      {syncLength ? 'LOCKED TO DRAW' : 'MANUAL'}
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold font-mono text-[#dcfc44] min-w-[3rem] text-center">{inputs.arrow_length}"</span>
                    <input
                      type="range"
                      min="20"
                      max="38"
                      step="0.1"
                      disabled={syncLength}
                      value={inputs.arrow_length}
                      onChange={(e) => setInputs({ ...inputs, arrow_length: parseFloat(e.target.value) })}
                      className={`flex-1 h-1 rounded-lg appearance-none cursor-pointer accent-[#dcfc44] ${syncLength ? 'bg-white/20 opacity-50' : 'bg-white/5'}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Point weight */}
            <div className="space-y-6 border-t border-white/5 pt-8">
               <h4 className="text-[10px] font-mono uppercase text-[#dcfc44] tracking-widest flex items-center gap-2">
                <Target size={14} />
                3. Components
              </h4>
              <div className="space-y-4">
                <label className="text-[10px] uppercase font-mono text-gray-500">Point Weight (Grains)</label>
                <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
                  {[80, 100, 120, 125, 140, 150, 175, 200].map(weight => (
                    <button
                      key={weight}
                      onClick={() => setInputs({ ...inputs, point_weight: weight })}
                      className={`py-2 rounded-lg border text-[10px] font-mono transition-all ${
                        inputs.point_weight === weight ? 'bg-[#dcfc44] border-[#dcfc44] text-black' : 'border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {weight}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          <section className="bg-gradient-to-br from-[#1c1d21] to-[#151619] border border-[#dcfc44]/20 rounded-3xl p-8 sticky top-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-400 mb-8 border-b border-white/5 pb-4">Recommended Configuration</h3>
            
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-gray-500 uppercase">Recommended Spine</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-[#dcfc44]">{spine}</span>
                  <span className="text-xs text-gray-500 font-mono uppercase italic">Stat. def</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-mono text-gray-500 uppercase">Perfect Arrow Length</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-[#dcfc44]">{getIdealArrowLength(inputs.draw_length)}</span>
                  <span className="text-xs text-gray-500 font-mono uppercase">Inches</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-4">Configuration Analysis</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-xl">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Input Draw</span>
                    <span className="font-bold text-sm text-gray-300">{inputs.draw_length}"</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-xl">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Current Shaft</span>
                    <span className={`font-bold text-sm ${Math.abs(inputs.arrow_length - getIdealArrowLength(inputs.draw_length)) < 0.2 ? 'text-green-400' : 'text-orange-400'}`}>
                      {inputs.arrow_length}"
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-xl">
                    <span className="text-[10px] font-mono text-[#dcfc44]/60 uppercase">Calculated FOC</span>
                    <span className="font-bold text-xs text-[#dcfc44] uppercase tracking-tighter">{getFOCStatus()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-xl">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Point Speed</span>
                    <span className="font-bold text-[10px] uppercase tracking-widest text-[#dcfc44]">{getSpeedStatus()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <p className="text-[9px] font-mono text-gray-500 uppercase border-b border-white/5 pb-2 font-bold tracking-tighter">Flying Characteristics</p>
                <div className="flex items-center gap-3 text-xs text-green-400/80">
                  <CheckCircle2 size={14} />
                  <span className="font-mono text-[10px] uppercase">{getStabilityStatus()}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-green-400/80">
                  <CheckCircle2 size={14} />
                  <span className="font-mono text-[10px] uppercase">{inputs.point_weight >= 125 ? 'Enhanced Weight Forward' : 'Optimal Front-of-Center'}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* AI Assistant Section */}
      <footer className="mt-12">
        <div className="flex flex-col gap-4 mb-6 text-center">
          <h2 className="text-xl font-bold tracking-tight">Valkyrie Intelligence</h2>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">Consult your personal arrow architect for deep optimization</p>
        </div>
        <AIAssistant config={{ ...inputs, spine }} />
      </footer>
    </div>
  );
}
