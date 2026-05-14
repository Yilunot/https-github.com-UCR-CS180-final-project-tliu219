/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, AlertCircle, CheckCircle2, ChevronRight, Brain } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { FormAnalysis } from '../types';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface FormAnalyzerProps {
  onSave: (analysis: FormAnalysis) => void;
}

export default function FormAnalyzer({ onSave }: FormAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<Partial<FormAnalysis> | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeForm = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await geminiService.analyzeForm(image);
      setResult(analysis);
    } catch (err) {
      setError("AI analysis failed. Please check your signal and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase italic">AI Coach</h2>
          <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Biometric Form Analysis v4.2</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload/Preview Section */}
        <div className="space-y-6">
          <div className="relative aspect-[3/4] bg-[#151619] border border-white/10 rounded-3xl overflow-hidden group">
            {image ? (
              <>
                <img src={image} className="w-full h-full object-cover" alt="Archer form" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={reset} className="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold font-mono">DISCARD FRAME</button>
                </div>
              </>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] transition-colors gap-4"
              >
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-[#dcfc44] transition-colors">
                  <Upload className="w-8 h-8 text-white/40 group-hover:text-[#dcfc44]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">Upload The Archer Picture </p>
                  <p className="text-xs text-gray-500 font-mono">PNG, JPG up to 10MB</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <button
            onClick={analyzeForm}
            disabled={!image || isAnalyzing}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all ${
              !image || isAnalyzing 
                ? 'bg-white/5 text-gray-600' 
                : 'bg-[#dcfc44] text-black shadow-[0_0_30px_rgba(220,252,68,0.2)] hover:scale-[1.02]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                <span className="font-mono tracking-widest text-xs">PROCESSING ARCHER DATA...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span className="font-mono tracking-widest text-xs uppercase">Compute Analysis</span>
              </>
            )
            }
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center space-y-4 bg-[#151619] border border-white/10 rounded-2xl p-12"
              >
                <Sparkles className="w-12 h-12 text-[#dcfc44] animate-pulse" />
                <div className="text-center space-y-2">
                  <p className="font-bold">Neural Engine Active</p>
                  <p className="text-xs text-gray-500 font-mono max-w-[200px]">Extracting posture vectors and tension metrics...</p>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="space-y-6"
              >
                {/* Summary */}
                <div className="bg-[#151619] border border-white/10 p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-[#dcfc44]" />
                    <h3 className="text-sm font-mono uppercase tracking-widest text-gray-400">Tactical Summary</h3>
                  </div>
                  <div className="prose prose-invert prose-xs max-w-none text-gray-300 leading-relaxed font-mono text-xs">
                    <Markdown>{result.raw_analysis}</Markdown>
                  </div>
                </div>

                {/* Issues */}
                <div className="bg-[#151619] border border-white/10 p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm font-mono uppercase tracking-widest text-gray-400">Detected Faults</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.issues?.map((issue, i) => (
                      <li key={i} className="flex gap-3 text-xs">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-[#dcfc44]/5 border border-[#dcfc44]/20 p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-[#dcfc44]" />
                    <h3 className="text-sm font-mono uppercase tracking-widest text-[#dcfc44]">Corrective Actions</h3>
                  </div>
                  <ul className="space-y-4">
                    {result.recommendations?.map((rec, i) => (
                      <li key={i} className="flex items-start gap-4 group">
                        <div className="mt-1 w-5 h-5 rounded bg-[#dcfc44] text-black flex items-center justify-center text-[10px] font-bold shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-xs leading-relaxed group-hover:text-[#dcfc44] transition-colors">{rec}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => onSave(result as FormAnalysis)}
                  className="w-full py-3 border border-white/10 rounded-xl hover:bg-white/5 font-mono text-[10px] uppercase tracking-widest transition-all"
                >
                  Save to history
                </button>
              </motion.div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                <p className="text-sm">{error}</p>
                <button onClick={analyzeForm} className="text-xs font-bold underline">Retry Analysis</button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-6 text-center bg-[#151619] border border-white/10 rounded-2xl p-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white/20" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">Awaiting Input</h3>
                  <p className="text-xs text-gray-500 font-mono leading-relaxed max-w-[240px]">Upload a clear side-profile photo of your full draw to begin AI kinematic evaluation.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
