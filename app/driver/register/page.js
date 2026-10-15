'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function DriverRegisterPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    license_number: '',
    vehicle_experience: '',
    license_image_url: '',
  });

  // Verify authentication on mount
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

  // Upload file to Supabase Storage ('licenses' bucket)
  const handleFileUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      setUploadingImage(true);
      setErrorMsg('');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Upload file directly to the licenses bucket
      const { data, error: uploadError } = await supabase.storage
        .from('licenses')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Retrieve public URL
      const { data: { publicUrl } } = supabase.storage
        .from('licenses')
        .getPublicUrl(fileName);

      setFormData((prev) => ({
        ...prev,
        license_image_url: publicUrl,
      }));
    } catch (err) {
      console.error('License upload error:', err);
      setErrorMsg('Failed to upload license image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit profile to driver_profiles table
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.license_image_url) {
      setErrorMsg('Please upload a valid copy of your driver license.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        id: user.id, // Primary key linked to auth.users
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        license_number: formData.license_number.trim(),
        vehicle_experience: formData.vehicle_experience.trim(),
        license_image_url: formData.license_image_url,
        status: 'pending',
      };

      const { error: insertError } = await supabase
        .from('driver_profiles')
        .insert([payload]);

      if (insertError) throw insertError;

      router.push('/driver/status');
    } catch (err) {
      console.error('Registration submission error:', err);
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
        <p>Loading verification session...</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '20px' }}>
      <div style={{ maxWidth: '480px', width: '100%', background: '#1e293b', padding: '32px', borderRadius: '12px', color: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 8px 0', fontSize: '24px' }}>Driver Portal Registration</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Submit your driver profile details for approval</p>

        {errorMsg && (
          <div style={{ background: '#450a0a', border: '1px solid #dc2626', color: '#fca5a5', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '18px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>Full Legal Name</label>
            <input
              type="text"
              name="full_name"
              placeholder="e.g. John Doe"
              value={formData.full_name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', marginTop: '6px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="e.g. +91 9876543210"
              value={formData.phone}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', marginTop: '6px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>Driver License Number</label>
            <input
              type="text"
              name="license_number"
              placeholder="e.g. KL-07-20220001234"
              value={formData.license_number}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', marginTop: '6px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>Driving Experience</label>
            <input
              type="text"
              name="vehicle_experience"
              placeholder="e.g. 4 years (Commercial & Passenger)"
              value={formData.vehicle_experience}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', marginTop: '6px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>Upload License Document (Photo / Scan)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              required={!formData.license_image_url}
              disabled={uploadingImage}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px dashed #475569', background: '#0f172a', color: '#cbd5e1', marginTop: '6px', boxSizing: 'border-box', cursor: 'pointer' }}
            />
            {uploadingImage && <p style={{ fontSize: '12px', color: '#38bdf8', marginTop: '4px' }}>Uploading to storage...</p>}
            {formData.license_image_url && !uploadingImage && (
              <p style={{ fontSize: '12px', color: '#4ade80', marginTop: '4px' }}>Image uploaded successfully.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || uploadingImage}
            style={{ padding: '12px', background: submitting ? '#1d4ed8' : '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: submitting || uploadingImage ? 'not-allowed' : 'pointer', marginTop: '8px', opacity: submitting || uploadingImage ? 0.7 : 1 }}
          >
            {submitting ? 'Registering Driver Profile...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </main>
  );
}
