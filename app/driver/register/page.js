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
    vehicle_model: '',
    license_number: '',
  });

  // 1. Verify user session before rendering form
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Check if driver profile already exists
      const { data: existingProfile } = await supabase
        .from('driver_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existingProfile) {
        router.push('/driver/status');
        return;
      }

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
        user_id: user.id,
        email: user.email,
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        vehicle_model: formData.vehicle_model.trim(),
        license_number: formData.license_number.trim(),
        status: 'pending',
      };

      const { error } = await supabase
        .from('driver_profiles')
        .insert([payload]);

      if (error) throw error;

      router.push('/driver/status');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit driver registration.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main style={styles.container}>
        <p style={{ color: '#94a3b8' }}>Checking authentication...</p>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Driver Registration</h1>
        <p style={styles.subtitle}>Complete your profile to start accepting rides</p>

        {errorMsg && <div style={styles.errorBanner}>{errorMsg}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Registered Email</label>
            <input
              type="text"
              value={user?.email || ''}
              disabled
              style={{ ...styles.input, backgroundColor: '#1e293b', color: '#94a3b8' }}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="full_name"
              placeholder="e.g. Rahul Sharma"
              value={formData.full_name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Vehicle Model & Year</label>
            <input
              type="text"
              name="vehicle_model"
              placeholder="e.g. Maruti Swift 2022"
              value={formData.vehicle_model}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Driving License Number</label>
            <input
              type="text"
              name="license_number"
              placeholder="KL-07-20220001234"
              value={formData.license_number}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={submitting} style={styles.button}>
            {submitting ? 'Submitting Application...' : 'Register as Driver'}
          </button>
        </form>
      </div>
    </main>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    padding: '24px 16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '32px 28px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
    color: '#f8fafc',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#94a3b8',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#cbd5e1',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
  },
  errorBanner: {
    padding: '10px 14px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '13px',
    marginBottom: '16px',
  },
};
