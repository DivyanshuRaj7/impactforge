import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (signUpError) throw signUpError;
        setSuccessMsg('Account created! Check your email for the confirmation link, or sign in directly.');
      } else {
        const { error: signInError } = await signIn({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background Hero from Index.html */}
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover" 
          alt="Cinematic library"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIzfSXAy_MBIxP8QaajjTN1WpvjxpiLBBDVTifPPDpQ1txc5Ls11mzFsslP5gbpChX2Y770Fju7mMfPZq9yh16P-CtiMJC4i5QC2FIrIVh0f34_O4ThpPp8tjuaw-nSVyZBLKmb2dI53FzlqWutVxTTpoqoUZzEkWqHxCWHZqIEzKXneBsNRfaL4zQlXdonQ0L33H2o1_JEKFtfY1LT7Ii2jlX_xf9I3jC5TnqokdwDnNeT08VarDeQ7RHvMiB0ztfNvP8YLe9qow"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-container/80 to-primary-container/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg mb-12">
        {/* Brand */}
        <div className="text-center mb-10 text-white">
          <h1 className="text-5xl font-serif italic tracking-tighter mb-2">IMPACTFORGE</h1>
          <p className="font-body text-white/80 uppercase tracking-widest text-xs">Forging a Better World.</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-lg border border-white/20 p-8 space-y-8 shadow-2xl">
          <div className="flex border-b border-white/20 mb-6">
            <button
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-colors ${!isSignUp ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/70'}`}
              onClick={() => { setIsSignUp(false); setError(''); setSuccessMsg(''); }}
            >
              Sign In
            </button>
            <button
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-colors ${isSignUp ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/70'}`}
              onClick={() => { setIsSignUp(true); setError(''); setSuccessMsg(''); }}
            >
              Apply
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                  className="w-full bg-white/5 border border-white/10 text-white font-body px-10 py-3 focus:outline-none focus:border-white transition-colors placeholder:text-white/30 rounded-sm"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 text-white font-body px-10 py-3 focus:outline-none focus:border-white transition-colors placeholder:text-white/30 rounded-sm"
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-white/5 border border-white/10 text-white font-body px-10 py-3 focus:outline-none focus:border-white transition-colors placeholder:text-white/30 rounded-sm"
              />
            </div>

            {error && (
              <p className="text-xs text-[#ffdad6] bg-[#93000a]/50 p-3 rounded-sm border border-[#ffdad6]/20">{error}</p>
            )}
            {successMsg && (
              <p className="text-xs text-[#adedd3] bg-[#002117]/50 p-3 rounded-sm border border-[#adedd3]/20">{successMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-white text-primary w-full py-4 rounded-sm font-bold tracking-widest text-xs uppercase hover:bg-white/90 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Submit Application' : 'Enter Portal'} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
