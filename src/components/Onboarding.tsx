/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Target, ArrowRight, User, Shield, Info } from 'lucide-react';
import { ArcherProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { calculateDrawLength, calculateBraceHeight, calculateArrowSpine, getIdealArrowLength } from '../lib/archerUtils';

interface OnboardingProps {
  onComplete: (profile: ArcherProfile) => void;
  initialData?: ArcherProfile;
}

export default function Onboarding({ onComplete, initialData }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ArcherProfile>>(initialData || {
    experience_level: 'beginner',
    bow_type: 'recurve',
    draw_weight: 30,
    height: 175,
    wingspan: 175,
    riser_length: 25,
    limb_size: 'medium',
    arrow_length: 29,
    brace_height: 8.7,
    anchor_point: 'Corner of mouth',
    arrow_spine: 500,
    point_weight: 100
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const [submitting, setSubmitting] = useState(false);

  const applyRecommendedArrow = () => {
    const drawLength = calculateDrawLength(formData.wingspan || 175);
    const idealLength = getIdealArrowLength(drawLength);
    const idealSpine = calculateArrowSpine(idealLength, formData.draw_weight || 30, formData.bow_type || 'recurve', formData.point_weight || 100);
    setFormData({
      ...formData,
      arrow_length: idealLength,
      arrow_spine: idealSpine
    });
  };

  const applyRecommendedBrace = () => {
    const brace = calculateBraceHeight(formData.riser_length || 25, formData.limb_size || 'medium');
    setFormData({
      ...formData,
      brace_height: brace
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const wingspan = formData.wingspan || 175;
    const drawWeight = formData.draw_weight || 30;
    const riser = formData.riser_length || 25;
    const limbs = formData.limb_size || 'medium';
    
    const drawLength = calculateDrawLength(wingspan);
    
    try {
      await onComplete({
        ...formData as ArcherProfile,
        draw_length: drawLength,
        joined_date: Date.now()
      } as ArcherProfile);
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] z-50 flex items-center justify-center p-4">
      {/* Step Indicator */}
      <div className="absolute top-0 inset-x-0 h-1 bg-white/5">
        <motion.div 
          className="bg-[#dcfc44]" 
          initial={{ width: '20%' }}
          animate={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="absolute inset-0 technical-grid opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#111113] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative z-10"
      >
        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#dcfc44]/10 flex items-center justify-center mb-4">
                    <User className="text-[#dcfc44] w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Identity Initialization</h2>
                  <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Segment 01: Identification</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-gray-500 mb-2 block tracking-widest">Callsign / Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter name..."
                      value={formData.name || ''}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-[#dcfc44] transition-colors"
                    />
                  </div>
                </div>

                <button 
                  onClick={nextStep}
                  disabled={!formData.name}
                  className="w-full flex items-center justify-center gap-2 bg-[#dcfc44] text-black py-4 rounded-2xl font-bold disabled:opacity-30 transition-all hover:scale-[1.02]"
                >
                  Confirm Identity <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#dcfc44]/10 flex items-center justify-center mb-4">
                    <Shield className="text-[#dcfc44] w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Biometric Scan</h2>
                  <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Segment 02: Physical Specs</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-[10px] uppercase font-mono text-gray-500 tracking-widest">Height (CM)</label>
                      <span className="text-[#dcfc44] font-bold">{formData.height} cm</span>
                    </div>
                    <input 
                      type="range" min="100" max="220"
                      value={formData.height}
                      onChange={e => setFormData({...formData, height: parseInt(e.target.value)})}
                      className="w-full accent-[#dcfc44]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-[10px] uppercase font-mono text-gray-500 tracking-widest">Wingspan (CM)</label>
                      <span className="text-[#dcfc44] font-bold">{formData.wingspan} cm</span>
                    </div>
                    <input 
                      type="range" min="100" max="220"
                      value={formData.wingspan}
                      onChange={e => setFormData({...formData, wingspan: parseInt(e.target.value)})}
                      className="w-full accent-[#dcfc44]"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center bg-[#dcfc44]/5 p-4 rounded-xl border border-[#dcfc44]/20">
                       <div className="flex items-center gap-2">
                          <Info className="w-3 h-3 text-[#dcfc44]" />
                          <span className="text-[10px] font-mono text-gray-400 uppercase">Estimated Draw Length</span>
                       </div>
                       <span className="text-xl font-bold font-mono text-[#dcfc44]">{calculateDrawLength(formData.wingspan || 175)}"</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 py-4 border border-white/10 rounded-2xl text-gray-400 font-bold">Back</button>
                  <button onClick={nextStep} className="flex-[2] bg-[#dcfc44] text-black py-4 rounded-2xl font-bold transition-all hover:scale-[1.02]">
                    {initialData ? 'Update Biometrics' : 'Confirm Biometrics'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#dcfc44]/10 flex items-center justify-center mb-4">
                    <Target className="text-[#dcfc44] w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Bow Configuration</h2>
                  <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Segment 03: Equipment Specs</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-mono text-gray-500 tracking-widest">Model</label>
                    <div className="space-y-2">
                      {['recurve', 'compound', 'traditional', 'barebow'].map(type => (
                        <button
                          key={type}
                          onClick={() => setFormData({...formData, bow_type: type as any})}
                          className={`w-full text-left px-4 py-2 rounded-lg border text-[10px] font-mono uppercase tracking-tighter transition-all ${
                            formData.bow_type === type ? 'bg-[#dcfc44] border-[#dcfc44] text-black' : 'border-white/10 text-gray-400'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-mono text-gray-500 tracking-widest">Experience</label>
                    <div className="space-y-2">
                      {['beginner', 'intermediate', 'advanced', 'pro'].map(level => (
                        <button
                          key={level}
                          onClick={() => setFormData({...formData, experience_level: level as any})}
                          className={`w-full text-left px-4 py-2 rounded-lg border text-[10px] font-mono uppercase tracking-tighter transition-all ${
                            formData.experience_level === level ? 'bg-[#dcfc44] border-[#dcfc44] text-black' : 'border-white/10 text-gray-400'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-[10px] uppercase font-mono text-gray-500 tracking-widest">Draw Weight (LBS)</label>
                    <span className="text-[#dcfc44] font-bold text-2xl">{formData.draw_weight}#</span>
                  </div>
                  <input 
                    type="range" min="10" max="80" step="1"
                    value={formData.draw_weight}
                    onChange={e => setFormData({...formData, draw_weight: parseInt(e.target.value)})}
                    className="w-full accent-[#dcfc44]"
                  />
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 py-4 border border-white/10 rounded-2xl text-gray-400 font-bold">Back</button>
                  <button onClick={nextStep} className="flex-[2] bg-[#dcfc44] text-black py-4 rounded-2xl font-bold transition-all hover:scale-[1.02]">
                    {initialData ? 'Update Tactics' : 'Confirm Tactics'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#dcfc44]/10 flex items-center justify-center mb-4">
                    <Info className="text-[#dcfc44] w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Technical Specs</h2>
                  <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Segment 04: Fine Tuning</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] uppercase font-mono text-gray-500 block">Arrow Length (")</label>
                      <button 
                        onClick={applyRecommendedArrow}
                        className="text-[8px] font-mono text-[#dcfc44] uppercase hover:underline"
                      >
                        Apply Rec
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" step="0.25"
                        value={formData.arrow_length}
                        onChange={e => setFormData({...formData, arrow_length: parseFloat(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#dcfc44] transition-colors font-mono text-sm"
                      />
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-[8px] font-mono text-gray-600 uppercase">Rec: {getIdealArrowLength(calculateDrawLength(formData.wingspan || 175))}"</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] uppercase font-mono text-gray-500 block">Arrow Spine</label>
                      <button 
                        onClick={applyRecommendedArrow}
                        className="text-[8px] font-mono text-[#dcfc44] uppercase hover:underline"
                      >
                        Apply Rec
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" step="10"
                        value={formData.arrow_spine}
                        onChange={e => setFormData({...formData, arrow_spine: parseInt(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#dcfc44] transition-colors font-mono text-sm"
                      />
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-[8px] font-mono text-gray-600 uppercase">Rec: {calculateArrowSpine(getIdealArrowLength(calculateDrawLength(formData.wingspan || 175)), formData.draw_weight || 30, formData.bow_type || 'recurve', formData.point_weight || 100)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-mono text-gray-500 block">Point Weight (GRAINS)</label>
                    <div className="relative">
                      <input 
                        type="number" step="5"
                        value={formData.point_weight}
                        onChange={e => setFormData({...formData, point_weight: parseInt(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#dcfc44] transition-colors font-mono text-sm"
                      />
                      <div className="mt-1 flex items-center gap-1">
                        {[80, 100, 125].map(w => (
                          <button 
                            key={w}
                            onClick={() => setFormData({...formData, point_weight: w})}
                            className={`text-[8px] font-mono px-2 py-0.5 rounded border ${formData.point_weight === w ? 'bg-[#dcfc44] text-black border-transparent' : 'bg-white/5 text-gray-500 border-white/10'}`}
                          >
                            {w}gr
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] uppercase font-mono text-gray-500 mb-2 block">Riser Length (")</label>
                    <div className="flex gap-2">
                      {[23, 25, 27].map(len => (
                        <button
                          key={len}
                          onClick={() => setFormData({...formData, riser_length: len})}
                          className={`flex-1 py-2 rounded-lg border text-[10px] font-mono transition-all ${
                            formData.riser_length === len ? 'bg-[#dcfc44] border-[#dcfc44] text-black' : 'border-white/10 text-gray-400 hover:border-white/30'
                          }`}
                        >
                          {len}"
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono text-gray-500 mb-2 block">Limb Size</label>
                    <div className="flex gap-2">
                      {['short', 'medium', 'long'].map(size => (
                        <button
                          key={size}
                          onClick={() => setFormData({...formData, limb_size: size as any})}
                          className={`flex-1 py-2 rounded-lg border text-[10px] font-mono uppercase transition-all ${
                            formData.limb_size === size ? 'bg-[#dcfc44] border-[#dcfc44] text-black' : 'border-white/10 text-gray-400 hover:border-white/30'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] uppercase font-mono text-gray-500 block">Brace Height (")</label>
                      <button 
                        onClick={applyRecommendedBrace}
                        className="text-[8px] font-mono text-[#dcfc44] uppercase hover:underline"
                      >
                        Apply Rec
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" step="0.1"
                        value={formData.brace_height}
                        onChange={e => setFormData({...formData, brace_height: parseFloat(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#dcfc44] transition-colors font-mono text-sm"
                      />
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-[8px] font-mono text-gray-600 uppercase">Rec: {calculateBraceHeight(formData.riser_length || 25, formData.limb_size || 'medium')}"</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-mono text-gray-500 mb-2 block tracking-widest">Anchor Point</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Corner of mouth', 'Under chin', 'Cheekbone', 'Jawline'].map(option => (
                        <button
                          key={option}
                          onClick={() => setFormData({...formData, anchor_point: option})}
                          className={`py-3 px-3 rounded-xl border text-[10px] font-mono transition-all text-left ${
                            formData.anchor_point === option ? 'bg-[#dcfc44] border-[#dcfc44] text-black' : 'border-white/10 text-gray-400 hover:border-white/30'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={prevStep} className="flex-1 py-4 border border-white/10 rounded-2xl text-gray-400 font-bold hover:bg-white/5 transition-colors">Back</button>
                  <button onClick={nextStep} className="flex-[2] bg-[#dcfc44] text-black py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(220,252,68,0.2)]">Final Review</button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#dcfc44]/10 flex items-center justify-center mb-4">
                    <Shield className="text-[#dcfc44] w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Initialization</h2>
                  <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Segment 05: Deployment</p>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">Archer</span>
                      <span className="text-xs font-bold">{formData.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">Estimated Draw</span>
                      <span className="text-xs font-bold text-[#dcfc44]">{calculateDrawLength(formData.wingspan || 175)}"</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">Bow Type</span>
                      <span className="text-xs font-bold uppercase">{formData.bow_type}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                       <span className="text-[10px] font-mono text-gray-500 uppercase">Riser / Limbs</span>
                       <span className="text-xs font-bold uppercase">{formData.riser_length}" / {formData.limb_size}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">Weight</span>
                      <span className="text-xs font-bold">{formData.draw_weight} LBS</span>
                    </div>
                    <div className="flex justify-between text-[#dcfc44]">
                      <span className="text-[10px] font-mono uppercase">System Check</span>
                      <span className="text-[10px] font-bold font-mono">READY</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 py-4 border border-white/10 rounded-2xl text-gray-400 font-bold">Back</button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={submitting}
                    className="flex-[2] bg-[#dcfc44] text-black py-4 rounded-2xl font-bold shadow-[0_0_30px_rgba(220,252,68,0.3)] transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    {submitting ? 'Initializing...' : 'Sync All Sensors'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
