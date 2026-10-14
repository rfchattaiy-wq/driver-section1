'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function DriverStatusPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ഔദ്യോഗിക ഡ്രൈവർ WhatsApp ഗ്രൂപ്പ് ഇൻവൈറ്റ് ലിങ്ക്
  const DRIVER_GROUP_INVITE_LINK = 'https://chat.whatsapp.com/I1wksvnAN8tBCtRXP69uZo?s=cl&p=a&mlu=4&ilr=4';

  useEffect(() => {
    async function fetchStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        router.push('/driver/apply');
        return;
      }

      setProfile(data);
      setLoading(false);
    }

    fetchStatus();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F8FAFC', color: '#1467B8', fontFamily: 'sans-serif' }}>
        <h3>സ്റ്റാറ്റസ് പരിശോധിക്കുന്നു...</h3>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'sans-serif' }}>
      
      {/* Brand Logo Definition */}
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

      <div style={{ maxWidth: '440px', width: '100%', background: '#fff', padding: '36px 28px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <svg width="50" height="35" viewBox="0 0 200 130"><use href="#easydrive-mark" /></svg>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, marginTop: '4px' }}>
            <b style={{ color: '#1467B8' }}>easy</b><span style={{ color: '#2FC18E' }}>drive</span>
          </span>
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 8px', color: '#0F172A' }}>
          ഹലോ, {profile.full_name}
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '0.88rem', color: '#64748B' }}>
          ലൈസൻസ് നമ്പർ: <b>{profile.license_number}</b>
        </p>

        {/* Status Conditional Display */}
        {profile.status === 'pending' && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '16px', padding: '24px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⏳</div>
            <h3 style={{ margin: '0 0 8px', color: '#B45309', fontSize: '1.15rem', fontWeight: 800 }}>പരിശോധന പുരോഗമിക്കുന്നു</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#78350F', lineHeight: '1.5' }}>
              നിങ്ങൾ നൽകിയ രേഖകൾ അഡ്മിൻ പരിശോധിച്ചു വരികയാണ്. വെരിഫിക്കേഷൻ പൂർത്തിയായ ഉടൻ ഗ്രൂപ്പ് ലിങ്ക് ഇവിടെ ദൃശ്യമാകും[span_2](start_span)[span_2](end_span)[span_3](start_span)[span_3](end_span).
            </p>
          </div>
        )}

        {profile.status === 'approved' && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '16px', padding: '24px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎉</div>
            <h3 style={{ margin: '0 0 8px', color: '#15803D', fontSize: '1.2rem', fontWeight: 800 }}>അംഗീകാരം ലഭിച്ചു!</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#166534', lineHeight: '1.5' }}>
              നിങ്ങൾ ഇപ്പോൾ Easy Drive-ന്റെ വെരിഫൈഡ് ഡ്രൈവറാണ്[span_4](start_span)[span_4](end_span)[span_5](start_span)[span_5](end_span). യാത്രകളുടെ വിവരങ്ങൾ നേരിട്ട് ലഭിക്കാൻ താഴെ കാണുന്ന ബട്ടൺ വഴി ഒഫീഷ്യൽ WhatsApp ഗ്രൂപ്പിൽ ചേരുക[span_6](start_span)[span_6](end_span).
            </p>

            <a
              href={DRIVER_GROUP_INVITE_LINK}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '13px',
                background: '#25D366',
                color: '#fff',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            >
              💬 WhatsApp ഡ്രൈവർ ഗ്രൂപ്പിൽ ചേരുക
            </a>
          </div>
        )}

        {profile.status === 'rejected' && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '16px', padding: '24px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>❌</div>
            <h3 style={{ margin: '0 0 8px', color: '#DC2626', fontSize: '1.15rem', fontWeight: 800 }}>അപേക്ഷ നിരസിച്ചു</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#991B1B', lineHeight: '1.5' }}>
              നിങ്ങൾ നൽകിയ രേഖകളിൽ കൃത്യതയില്ലാത്തതിനാൽ അപേക്ഷ നിരസിക്കപ്പെട്ടു[span_7](start_span)[span_7](end_span)[span_8](start_span)[span_8](end_span). വിവരങ്ങൾ വ്യക്തമാക്കാൻ അഡ്മിനുമായി ബന്ധപ്പെടുക.
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            marginTop: '24px',
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 700
          }}
        >
          അക്കൗണ്ടിൽ നിന്ന് പുറത്തുകടക്കുക (Logout)
        </button>

      </div>
    </div>
  );
}
