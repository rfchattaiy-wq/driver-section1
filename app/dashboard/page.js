'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState('rider');
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        setUser(session.user);

        // 1. Fetch user role from user_profiles
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, full_name')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.role) {
          setRole(profile.role);
        }

        // 2. Fetch driver profile status if it exists
        const { data: driver } = await supabase
          .from('driver_profiles')
          .select('id, status, license_number')
          .eq('id', session.user.id)
          .maybeSingle();

        setDriverProfile(driver || null);
      } catch (err) {
        console.error('Error loading dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
        <p>Loading your dashboard...</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', padding: '24px 16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Top Navbar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #334155', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#38bdf8' }}>EasyDrive</h1>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>
              Logged in as: <strong style={{ color: '#fff' }}>{user?.email}</strong>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
          >
            Sign Out
          </button>
        </header>

        {/* Admin Quick-Access Card (Visible only to admins) */}
        {role === 'admin' && (
          <div style={{ background: '#1e1b4b', border: '1px solid #4338ca', padding: '16px 20px', borderRadius: '10px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#c7d2fe' }}>Administrator Access</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#a5b4fc' }}>Manage driver approvals and platform settings</p>
            </div>
            <Link
              href="/admin/drivers"
              style={{ padding: '8px 16px', background: '#4f46e5', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}
            >
              Open Admin Portal
            </Link>
          </div>
        )}

        {/* Main Service Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Section 1: Driver Registration & Application Status */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '18px', margin: 0 }}>Driver Registration</h2>
                {driverProfile && (
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    background: driverProfile.status === 'approved' ? '#064e3b' : driverProfile.status === 'rejected' ? '#7f1d1d' : '#78350f',
                    color: driverProfile.status === 'approved' ? '#6ee7b7' : driverProfile.status === 'rejected' ? '#fca5a5' : '#fde047',
                  }}>
                    {driverProfile.status}
                  </span>
                )}
              </div>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                {driverProfile 
                  ? `Your license application (${driverProfile.license_number}) has been registered.` 
                  : 'Join our fleet as a certified driver. Submit your vehicle details and license for quick verification.'}
              </p>
            </div>

            {driverProfile ? (
              <Link
                href="/driver/status"
                style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#334155', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }}
              >
                View Registration Status
              </Link>
            ) : (
              <Link
                href="/driver/register"
                style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }}
              >
                Register as a Driver
              </Link>
            )}
          </div>

          {/* Section 2: Driver Booking & Ride Management */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '18px', margin: '0 0 12px 0' }}>Book a Driver</h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Need a personal or commercial driver for your journey? Schedule on-demand drivers instantly with fixed rates.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                href="/booking/new"
                style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#059669', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }}
              >
                Book Driver Now
              </Link>
              <Link
                href="/booking/status"
                style={{ display: 'block', textAlign: 'center', padding: '10px', background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', textDecoration: 'none', borderRadius: '8px', fontSize: '13px' }}
              >
                View Booking History
              </Link>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
