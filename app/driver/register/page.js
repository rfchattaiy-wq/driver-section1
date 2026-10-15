'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function DriverRegisterPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    license_number: '',
    vehicle_experience: '',
    license_image_url: '',
  });

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        id: user.id, // Supabase Auth User ID
        full_name: formData.full_name.trim(), // പൂർണ്ണ നാമം
        phone: formData.phone.trim(),
        license_number: formData.license_number.trim(),
        vehicle_experience: formData.vehicle_experience.trim(),
        license_image_url: formData.license_image_url.trim() || 'https://placeholder.invalid/license.jpg',
        status: 'pending',
      };

      const { error } = await supabase
        .from('driver_profiles')
        .insert([payload]);

      if (error) throw error;

      router.push('/driver/status');
    } catch (err) {
      setErrorMsg(err.message || 'രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
        <p>പരിശോധിക്കുന്നു...</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '20px' }}>
      <div style={{ maxWidth: '450px', width: '100%', background: '#1e293b', padding: '30px', borderRadius: '12px', color: '#fff' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>ഡ്രൈവർ രജിസ്ട്രേഷൻ</h2>

        {errorMsg && (
          <div style={{ background: '#ef444422', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#cbd5e1' }}>പൂർണ്ണ നാമം (Full Name)</label>
            <input
              type="text"
              name="full_name"
              placeholder="നിങ്ങളുടെ പേര് നൽകുക"
              value={formData.full_name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', marginTop: '5px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#cbd5e1' }}>ഫോൺ നമ്പർ (Phone)</label>
            <input
              type="tel"
              name="phone"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', marginTop: '5px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#cbd5e1' }}>ഡ്രൈവിംഗ് ലൈസൻസ് നമ്പർ (License Number)</label>
            <input
              type="text"
              name="license_number"
              placeholder="KL-07-20220001234"
              value={formData.license_number}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', marginTop: '5px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#cbd5e1' }}>വാഹന പരിചയം (Vehicle Experience)</label>
            <input
              type="text"
              name="vehicle_experience"
              placeholder="ഉദാഹരണത്തിന്: 3 Years"
              value={formData.vehicle_experience}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', marginTop: '5px' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
          >
            {submitting ? 'രജിസ്റ്റർ ചെയ്യുന്നു...' : 'രജിസ്റ്റർ ചെയ്യുക'}
          </button>
        </form>
      </div>
    </main>
  );
}
