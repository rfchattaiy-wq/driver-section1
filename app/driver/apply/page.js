'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function DriverApplyPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    licenseNumber: '',
    vehicleExperience: 'Both',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // ഡ്രൈവർ പ്രൊഫൈൽ മുൻപേ ഉണ്ടെങ്കിൽ സ്റ്റാറ്റസ് പേജിലേക്ക്
      const { data: existingProfile } = await supabase
        .from('driver_profiles')
        .select('status')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        router.push('/driver/status');
      }
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.fullName.trim().length < 3) {
      setErrorMsg('പൂർണ്ണ നാമം നൽകുക.');
      return;
    }

    if (!file) {
      setErrorMsg('ഡ്രൈവിംഗ് ലൈസൻസിന്റെ ഫോട്ടോ നിർബന്ധമാണ്.');
      return;
    }

    setLoading(true);

    try {
      // 1. ലൈസൻസ് ഫോട്ടോ Supabase Storage-ലേക്ക് അപ്‌ലോഡ് ചെയ്യുന്നു
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('licenses').upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('licenses').getPublicUrl(fileName);

      // 2. driver_profiles ടേബിളിലേക്ക് സേവ് ചെയ്യുന്നു
      const { error: dbError } = await supabase.from('driver_profiles').insert({
        id: user.id,
        phone: user.phone || formData.phone.trim(),
        full_name: formData.fullName.trim(),
        license_number: formData.licenseNumber.trim().toUpperCase(),
        vehicle_experience: formData.vehicleExperience,
        license_image_url: publicUrlData.publicUrl,
        status: 'pending',
      });

      if (dbError) throw dbError;

      router.push('/driver/status');
    } catch (err) {
      setErrorMsg(err.message || 'ഒരു പിശക് സംഭവിച്ചു');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px 16px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '440px', width: '100%', background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1467B8', margin: '0 0 6px' }}>ഡ്രൈവർ രജിസ്ട്രേഷൻ</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Easy Drive പാർട്ണർ ആകാൻ വിവരങ്ങൾ സമർപ്പിക്കുക</p>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>പൂർണ്ണ നാമം</label>
            <input required placeholder="Akash Prakash" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>ഡ്രൈവിംഗ് ലൈസൻസ് നമ്പർ</label>
            <input required placeholder="KL0720210001234" value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>പരിചയമുള്ള വാഹനങ്ങൾ</label>
            <select value={formData.vehicleExperience} onChange={e => setFormData({ ...formData, vehicleExperience: e.target.value })} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box', background: '#fff' }}>
              <option value="Both">Manual & Automatic (രണ്ടും)</option>
              <option value="Manual">Manual Only</option>
              <option value="Automatic">Automatic Only</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>ലൈസൻസ് ഫോട്ടോ (Image)</label>
            <input required type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
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
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            {loading ? 'രേഖകൾ സമർപ്പിക്കുന്നു...' : 'പരിശോധനക്കായി നൽകുക ➔'}
          </button>
        </form>

      </div>
    </div>
  );
}
