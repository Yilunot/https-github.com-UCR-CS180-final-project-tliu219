import { useState } from 'react';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { motion } from 'motion/react';
import { Target, Mail, Lock, Chrome, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is not enabled in Firebase Console. Please use Google Login or enable it.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 technical-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#dcfc44]/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111113] border border-white/10 rounded-[32px] p-8 md:p-12 relative z-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#dcfc44] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(220,252,68,0.3)] mb-6">
            <Target className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">BULLSEYE AI</h1>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em]">Neural Archery Interface</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest ml-1">Universal ID (Email)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#dcfc44] transition-colors"
                placeholder="archer@neural.link"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest ml-1">Access Protocol (Password)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#dcfc44] transition-colors"
                placeholder="********"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-500 leading-relaxed font-mono uppercase italic">{error}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#dcfc44] text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Initialize Profile' : 'Authenticate')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
            <span className="bg-[#111113] px-4 text-gray-500">Sub-Protocol Integration</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-white/10"
        >
          <Chrome className="w-4 h-4" />
          Google Neural ID
        </button>

        <p className="mt-8 text-center text-xs text-gray-500">
          {isSignUp ? "Already identified? " : "New operative? "}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#dcfc44] font-bold hover:underline"
          >
            {isSignUp ? "Log In" : "Register Profile"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
