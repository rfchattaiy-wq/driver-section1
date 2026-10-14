'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // 1. ഫോൺ നമ്പറിലേക്ക് OTP അയക്കുന്നു (Twilio വഴി)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const cleanPhone = phone.trim();
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg('സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.');
      return;
    }

    setLoading(true);
    const formattedPhone = `+91${cleanPhone}`;

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
      setErrorMsg('OTP അയക്കുന്നതിൽ തടസ്സം: ' + error.message);
    } else {
      setInfoMsg(`${cleanPhone} എന്ന നമ്പറിലേക്ക് OTP അയച്ചിട്ടുണ്ട്.`);
      setStep('otp');
    }
    setLoading(false);
  };

  // 2. OTP പരിശോധിച്ച് പ്രവേശിക്കുന്നു
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (otp.trim().length < 6) {
      setErrorMsg('6 അക്ക OTP കൃത്യമായി നൽകുക.');
      return;
    }

    setLoading(true);
    const formattedPhone = `+91${phone.trim()}`;

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp.trim(),
      type: 'sms',
    });

    if (error) {
      setErrorMsg('തെറ്റായ OTP അല്ലെങ്കിൽ കാലാവധി കഴിഞ്ഞു: ' + error.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      // പ്രൊഫൈൽ ഉണ്ടോ എന്ന് പരിശോധിക്കുന്നു
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', data.user.id)
        .single();

      if (!profile || !profile.full_name) {
        // ആദ്യമായി വരുന്ന യൂസർ ആണെങ്കിൽ പേര് ചോദിക്കാൻ onboarding ലേക്ക്
        router.push('/onboarding');
      } else {
        // മുൻപേ പ്രൊഫൈൽ ഉള്ള ആളാണെങ്കിൽ നേരിട്ട് ഡാഷ്‌ബോർഡിലേക്ക്
        router.push('/dashboard');
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'sans-serif' }}>
      
      {/* ഒറിജിനൽ ലോഗോ ചിഹ്നം */}
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

      {/* കാർഡ് കണ്ടെയ്നർ */}
      <div style={{ maxWidth: '400px', width: '100%', background: '#fff', padding: '36px 28px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
        
        {/* ലോഗോ പ്രദർശനം */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <svg width="60" height="42" viewBox="0 0 200 130"><use href="#easydrive-mark" /></svg>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '8px 0 0' }}>
            <span style={{ color: '#1467B8' }}>easy</span><span style={{ color: '#2FC18E' }}>drive</span>
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#64748B' }}>
            {step === 'phone' ? 'ഫോൺ നമ്പർ നൽകി OTP നേടുക' : 'SMS ആയി ലഭിച്ച 6 അക്ക കോഡ് നൽകുക'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'left' }}>
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div style={{ padding: '10px 14px', background: '#F0FDF4', color: '#15803D', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'left' }}>
            {infoMsg}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                മൊബൈൽ നമ്പർ
              </label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '10px', overflow: 'hidden' }}>
                <span style={{ padding: '12px 14px', background: '#F8FAFC', color: '#475569', fontSize: '0.9rem', fontWeight: 700, borderRight: '1px solid #CBD5E1' }}>
                  +91
                </span>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: 'none', outline: 'none', fontSize: '1rem', letterSpacing: '0.5px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '4px',
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
              {loading ? 'OTP അയക്കുന്നു...' : 'OTP ആവശ്യപ്പെടുക ➔'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                6 അക്ക OTP
              </label>
              <input
                required
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  letterSpacing: '6px',
                  fontWeight: 800,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '4px',
                padding: '13px',
                background: '#2FC18E',
                color: '#0F172A',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'പരിശോധിക്കുന്നു...' : 'പ്രവേശിക്കുക'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); setErrorMsg(''); }}
              style={{ background: 'transparent', border: 'none', color: '#1467B8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
            >
              ഫോൺ നമ്പർ തിരുത്തുക
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
