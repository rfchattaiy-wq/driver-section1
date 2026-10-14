'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function RiderDashboard() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [rides, setRides] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', color: '' });

  // ബുക്കിംഗ് ഫോം സ്റ്റേറ്റ്
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
    serviceType: 'Hourly',
    vehicleType: 'Manual',
  });

  const todayDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // യൂസർ പ്രൊഫൈൽ എടുക്കുന്നു
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.full_name) {
        router.push('/onboarding');
        return;
      }

      setUserProfile(profile);
      await fetchRides(user.id);
      setPageLoading(false);
    }

    loadDashboard();
  }, [router]);

  const fetchRides = async (userId) => {
    const { data } = await supabase
      .from('rides')
      .select('*')
      .eq('rider_id', userId)
      .order('created_at', { ascending: false });

    if (data) setRides(data);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setStatusMsg({ text: '', color: '' });

    if (formData.pickup.trim().length < 3 || formData.dropoff.trim().length < 3) {
      setStatusMsg({ text: 'കൃത്യമായ പിക്കപ്പ്, ഡ്രോപ്പ് സ്ഥലങ്ങൾ നൽകുക.', color: '#EF4444' });
      setSubmitLoading(false);
      return;
    }

    const bookingRef = 'ED-' + Math.floor(1000 + Math.random() * 9000);
    const scheduledDateTime = new Date(`${formData.date}T${formData.time}`).toISOString();

    // 1. Supabase Rides ടേബിളിലേക്ക് സേവ് ചെയ്യുന്നു
    const { error: insertError } = await supabase.from('rides').insert({
      booking_reference: bookingRef,
      rider_id: userProfile.id,
      rider_name: userProfile.full_name,
      rider_phone: userProfile.phone,
      pickup_location: formData.pickup.trim(),
      dropoff_location: formData.dropoff.trim(),
      scheduled_time: scheduledDateTime,
      service_type: formData.serviceType,
      vehicle_type: formData.vehicleType,
      status: 'requested',
    });

    if (insertError) {
      setStatusMsg({ text: 'ബുക്കിംഗ് പരാജയപ്പെട്ടു: ' + insertError.message, color: '#EF4444' });
      setSubmitLoading(false);
      return;
    }

    // 2. ബാക്ക്‌എൻഡ് WhatsApp API നോട്ടിഫിക്കേഷൻ ട്രിഗർ ചെയ്യുന്നു
    try {
      await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingReference: bookingRef,
          riderName: userProfile.full_name,
          riderPhone: userProfile.phone,
          pickup: formData.pickup.trim(),
          dropoff: formData.dropoff.trim(),
          scheduledTime: `${formData.date} ${formData.time}`,
          serviceType: formData.serviceType,
          vehicleType: formData.vehicleType,
        }),
      });
    } catch (apiErr) {
      console.error('Notification API Error:', apiErr);
    }

    setStatusMsg({
      text: `✅ ബുക്കിംഗ് #${bookingRef} രേഖപ്പെടുത്തി! അഡ്മിന് തനിയെ നോട്ടിഫിക്കേഷൻ ലഭിച്ചു.`,
      color: '#15803D'
    });

    setFormData({
      pickup: '',
      dropoff: '',
      date: '',
      time: '',
      serviceType: 'Hourly',
      vehicleType: 'Manual',
    });

    await fetchRides(userProfile.id);
    setSubmitLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (pageLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F8FAFC', color: '#1467B8', fontFamily: 'sans-serif' }}>
        <h3>ഡാഷ്‌ബോർഡ് തുറക്കുന്നു...</h3>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', fontFamily: 'sans-serif' }}>
      
      {/* Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 900 }}>
            <b style={{ color: '#1467B8' }}>easy</b><span style={{ color: '#2FC18E' }}>drive</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '0.88rem', color: '#64748B' }}>
            👤 <b>{userProfile?.full_name}</b> ({userProfile?.phone})
          </span>
          <button
            onClick={handleLogout}
            style={{ padding: '6px 14px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main style={{ maxWidth: '840px', margin: '32px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Booking Form Card */}
        <section style={{ background: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px -4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.3rem', color: '#1467B8' }}>പുതിയ യാത്ര ബുക്ക് ചെയ്യുക</h2>
          <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#64748B' }}>വിവരങ്ങൾ നൽകിയാൽ അഡ്മിന് തനിയെ WhatsApp അലേർട്ട് ലഭിക്കും</p>

          <form onSubmit={handleBooking} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>പിക്കപ്പ് സ്ഥലം</label>
              <input required placeholder="ഉദാ: Aluva" value={formData.pickup} onChange={e => setFormData({ ...formData, pickup: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>ലക്ഷ്യസ്ഥാനം (Destination)</label>
              <input required placeholder="ഉദാ: Kakkanad" value={formData.dropoff} onChange={e => setFormData({ ...formData, dropoff: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>തീയതി</label>
              <input required type="date" min={todayDate} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>സമയം</label>
              <input required type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>സർവീസ് തരം</label>
              <select value={formData.serviceType} onChange={e => setFormData({ ...formData, serviceType: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box', background: '#fff' }}>
                <option value="Hourly">Hourly Driver (മണിക്കൂർ കണക്കിൽ)</option>
                <option value="Full-Day">Full-Day Driver (പൂർണ്ണ ദിവസം)</option>
                <option value="Night">Night Driver (രാത്രി യാത്ര)</option>
                <option value="Outstation">Outstation Driver (ദൂരയാത്ര)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>വാഹനം</label>
              <select value={formData.vehicleType} onChange={e => setFormData({ ...formData, vehicleType: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box', background: '#fff' }}>
                <option value="Manual">Manual Car</option>
                <option value="Automatic">Automatic Car</option>
                <option value="Luxury">Luxury / SUV</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              style={{
                gridColumn: '1 / -1',
                padding: '13px',
                background: 'linear-gradient(90deg, #1467B8, #179469)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '0.95rem',
                marginTop: '4px'
              }}
            >
              {submitLoading ? 'ബുക്കിംഗ് രേഖപ്പെടുത്തുന്നു...' : 'ഡ്രൈവറെ ബുക്ക് ചെയ്യുക ➔'}
            </button>
          </form>

          {statusMsg.text && (
            <div style={{ marginTop: '16px', padding: '12px', background: statusMsg.color === '#15803D' ? '#F0FDF4' : '#FEE2E2', color: statusMsg.color, borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
              {statusMsg.text}
            </div>
          )}
        </section>

        {/* Real-time Status Tracking Section */}
        <section style={{ background: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.25rem', color: '#0F172A' }}>നിങ്ങളുടെ മുൻകാല യാത്രകൾ & തത്സമയ സ്റ്റാറ്റസ്</h2>
          
          {rides.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>ഇതുവരെ യാത്രകളൊന്നും ബുക്ക് ചെയ്തിട്ടില്ല.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rides.map(r => (
                <div key={r.id} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1467B8', background: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                        #{r.booking_reference}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1E293B' }}>
                        📍 {r.pickup_location} ➔ 🏁 {r.dropoff_location}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '6px' }}>
                      🕒 {new Date(r.scheduled_time).toLocaleString('en-IN')} | {r.service_type} ({r.vehicle_type})
                    </div>
                  </div>

                  <div>
                    {r.status === 'requested' ? (
                      <span style={{ padding: '6px 12px', background: '#FEF3C7', color: '#B45309', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800 }}>
                        ⏳ Requested (Pending Driver)
                      </span>
                    ) : r.status === 'assigned' ? (
                      <span style={{ padding: '6px 12px', background: '#DCFCE7', color: '#15803D', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800 }}>
                        ✅ Driver Assigned
                      </span>
                    ) : r.status === 'completed' ? (
                      <span style={{ padding: '6px 12px', background: '#F1F5F9', color: '#475569', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800 }}>
                        🏁 Completed
                      </span>
                    ) : (
                      <span style={{ padding: '6px 12px', background: '#FEE2E2', color: '#DC2626', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800 }}>
                        ❌ Cancelled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
