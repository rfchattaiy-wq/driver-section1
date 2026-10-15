'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendLink = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/driver/status`,
        },
      });

      if (error) throw error;
      setSent(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send sign-in link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Driver Portal</h1>
        <p style={styles.subtitle}>
          {sent ? 'Check your email inbox' : 'Sign in with your email address'}
        </p>

        {errorMsg && <div style={styles.errorBanner}>{errorMsg}</div>}

        {sent ? (
          <div style={styles.sentContainer}>
            <p style={styles.sentText}>
              We sent a sign-in link to <strong>{email}</strong>.
            </p>
            <p style={styles.hintText}>
              Open the email on this device and click <strong>"Sign In"</strong> to log in instantly.
            </p>
            <button
              type="button"
              onClick={() => { setSent(false); setEmail(''); }}
              style={styles.secondaryButton}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendLink} style={styles.form}>
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
              {loading ? 'Sending link...' : 'Send Sign-In Link'}
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
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#cbd5e1',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontSize: '15px',
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
    marginTop: '8px',
  },
  sentContainer: {
    textAlign: 'center',
  },
  sentText: {
    fontSize: '15px',
    lineHeight: '1.5',
    marginBottom: '8px',
  },
  hintText: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.5',
    marginBottom: '20px',
  },
  secondaryButton: {
    background: 'none',
    border: 'none',
    color: '#60a5fa',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  errorBanner: {
    padding: '10px 12px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    color: '#fca5a5',
    fontSize: '13px',
    marginBottom: '16px',
  },
};
