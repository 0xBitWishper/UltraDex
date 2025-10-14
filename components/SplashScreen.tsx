"use client"
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(20,24,24,0.55)',
        backdropFilter: 'blur(32px)',
        width: '100vw',
        height: '100vh',
        flexDirection: 'column',
        transition: 'opacity 0.5s',
      }}
    >
      <Image
        src="/images/logo_for_darkmode.png"
        alt="Logo"
        width={420}
        height={420}
        style={{ filter: 'drop-shadow(0 0 48px #00ffb3)', objectFit: 'contain', marginBottom: 24 }}
        priority
      />
      <div style={{
        textAlign: 'center',
        color: '#fff',
        fontSize: 32,
        fontWeight: 700,
        letterSpacing: '-1px',
        marginBottom: 8,
        fontFamily: 'Space Grotesk, sans-serif',
      }}>
        
      </div>
      <div style={{
        textAlign: 'center',
        color: '#e0e0e0',
        fontSize: 18,
        fontWeight: 400,
        fontFamily: 'Space Grotesk, sans-serif',
        marginTop: 0,
      }}>
       
      </div>
    </div>
  );
}
