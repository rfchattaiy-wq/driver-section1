'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Send OTP code directly to user's email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setSuccessMsg('A 6-digit verification code has been sent to your email.');
      setStep('otp');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the 6-digit token entered by the user
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'email',
      });

      if (error) {
        throw error;
      }

      if (data?.session) {
        // Successfully authenticated - route to the driver status/dashboard
        router.push('/driver/status');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Driver Portal</h1>
        <p style={styles.subtitle}>
          {step === 'email'
            ? 'Sign in with your email address'
            : `Enter the code sent to ${email}`}
        </p>

        {errorMsg && <div style={styles.errorBanner}>{errorMsg}</div>}
        {successMsg && <div style={styles.successBanner}>{successMsg}</div>}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} style={styles.form}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="driver@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={styles.input}
            />

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <label style={styles.label}>6-Digit Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={loading}
              style={{ ...styles.input, textAlign: 'center', letterSpacing: '4px', fontSize: '18px' }}
            />

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Verifying...' : 'Verify & Log In'}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setStep('email');
                setOtp('');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={styles.secondaryButton}
            >
              Use a different email
            </button>
          </form>
        )}
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
    padding: '16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '32px 24px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
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
    
