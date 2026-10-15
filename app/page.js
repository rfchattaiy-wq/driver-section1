'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndRedirect() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          router.replace('/driver/status');
        } else {
          router.replace('/login');
        }
      } catch (err) {
        // Fallback to login on any session error
        router.replace('/login');
      }
    }

    checkAuthAndRedirect();
  }, [router]);

  return (
    <main style={styles.container}>
      <div style={styles.spinner} />
      <p style={styles.text}>Redirecting to Driver Portal...</p>
    </main>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #334155',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  text: {
    fontSize: '14px',
    color: '#64748b',
    letterSpacing: '0.3px',
  },
};
