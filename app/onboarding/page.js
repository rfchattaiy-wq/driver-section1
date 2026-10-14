'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function OnboardingPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // മുൻപേ പേര് നൽകിയിട്ടുണ്ടെങ്കിൽ നേരിട്ട് ഡാഷ്‌ബോർഡിലേക്ക്
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profile && profile.full_name) {
        router.push('/dashboard');
      }
    }
    checkUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (fullName.trim().length < 3) {
      setErrorMsg('കുറഞ്ഞത് 3 അക്ഷരങ്ങളുള്ള പേര് നൽകുക.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('user_profiles').upsert({
      id: user.id,
      phone: user.phone,
      full_name: fullName.trim(),
    });

    if (error) {
      setErrorMsg('പ്രൊഫൈൽ അപ്‌ഡേറ്റ് ചെയ്യുന്നതിൽ തടസ്സം: ' + error.message);
      setLoading(false);
      return;
    }

    // പേര് സേവ് ചെയ്ത ശേഷം നേരെ ഡാഷ്‌ബോർഡിലേക്ക്
    router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'sans-serif' }}>
      
      {/* SVG Symbol */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="roadGrad" x1="0%" y1="70%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#1467B8" />
            <stop offset="55%" stopColor="#1B9AB0" />
            <stop offset="100%" stopColor="#2FC18E" />
          </linearGradient>
        </defs>
        <symbol id="easydrive-mark" viewBox="0 0 200 130">
          <path d="M 28 105 C 42 70, 72 45, 112 48 C 142 50, 150 18, 118 10 C 86 2, 74 38, 74 62 C 74 96, 115 108, 142 98 C 158 92, 172 78, 182 60" fill="none" stroke="url(#roadGrad)" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 28 105 C 42 70, 72 45, 112 48 C 142 50, 150 18, 118 10 C 86 2, 74 38, 74 62 C 74 96, 115 108, 142 98 C 158 92, 172 78, 182 60" fill="none" stroke="#FFFFFF" strokeWidth="2.3" strokeDasharray="6 7" strokeLinecap="round" opacity="0.95" />
          <polygon points="172,32 196,52 170,72 175,54 158,52" fill="#2FC18E" />
        </symbol>
      </svg>

      <div style={{ maxWidth: '400px', width: '100%', background: '#fff', padding: '36px 28px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <svg width="60" height="42" viewBox="0 0 200 130"><use href="#easydrive-mark" /></svg>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '10px 0 4px', color: '#0F172A' }}>
            സ്വാഗതം!
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>
            യാത്രകൾ ബുക്ക് ചെയ്യാൻ നിങ്ങളുടെ പേര് നൽകുക
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'left' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              പൂർണ്ണ നാമം
            </label>
            <input
              required
              placeholder="ഉദാ: രാഹുൽ കൃഷ്ണൻ"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
              padding: '13px',
              background: 'linear-gradient(90deg, #1467B8, #179469)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'സേവ് ചെയ്യുന്നു...' : 'തുടരുക ➔'}
          </button>
        </form>
      </div>
    </div>
  );
}
