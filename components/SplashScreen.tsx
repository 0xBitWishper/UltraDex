"use client"
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 900;
    let start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(percent);
      if (percent >= 100) {
        setVisible(false);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;
  // ...existing code...

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
      <style>{`
        @media (max-width: 768px) {
          .splash-logo {
            width: 160px !important;
            height: 160px !important;
            margin-bottom: 16px !important;
            margin-top: 32px !important;
            padding: 12px !important;
          }
          .splash-progress {
            width: 70vw !important;
            max-width: 180px !important;
            margin-bottom: 12px !important;
            margin-top: -12px !important;
          }
        }
        @media (min-width: 769px) {
          .splash-logo {
            width: 420px !important;
            height: 420px !important;
            margin-bottom: 24px !important;
          }
          .splash-progress {
            width: 80% !important;
            max-width: 320px !important;
            margin-bottom: 16px !important;
            margin-top: 0 !important;
          }
        }
      `}</style>
      <Image
        src="/images/logo_for_darkmode.png"
        alt="Logo"
        width={420}
        height={420}
        className="splash-logo"
        style={{ filter: 'drop-shadow(0 0 48px #00ffb3)', objectFit: 'contain' }}
        priority
      />
      <div className="splash-progress" style={{ margin: '0 auto' }}>
        <div style={{
          width: '100%',
          height: 12,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg,#00ffb3,#00cfff)',
            transition: 'width 0.1s',
          }} />
          <span style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            textShadow: '0 1px 4px #000',
          }}>{progress}%</span>
        </div>
      </div>
      <div style={{
        textAlign: 'center',
        color: '#fff',
        fontSize: 32,
        fontWeight: 700,
        letterSpacing: '-1px',
        marginBottom: 8,
        fontFamily: 'Space Grotesk, sans-serif',
      }}>
        {/* ...existing code... */}
      </div>
      <div style={{
        textAlign: 'center',
        color: '#e0e0e0',
        fontSize: 18,
        fontWeight: 400,
        fontFamily: 'Space Grotesk, sans-serif',
        marginTop: 0,
      }}>
        {/* ...existing code... */}
      </div>
    </div>
  );
}
