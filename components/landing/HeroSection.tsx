'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section style={{
      position: 'relative',
      paddingTop: '160px',
      minHeight: '100svh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'var(--white)',
      overflow: 'hidden'
    }}>
      {/* Headlines */}
      <div style={{ textAlign: 'center', maxWidth: '800px', padding: '0 24px', zIndex: 10, marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '64px',
          fontWeight: 800,
          color: '#111',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          marginBottom: '24px'
        }}>
          Premium quality <span style={{ color: 'var(--primary)' }}>eggs</span> straight from the farm
        </h1>
        <p style={{
          fontSize: '15px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: '600px',
          margin: '0 auto 32px'
        }}>
          Managing healthy flocks and delivering farm-fresh eggs, ensuring quality and sustainability from our godown to your table.
        </p>
        <Link href="#about" style={{
          display: 'inline-flex',
          background: '#111',
          color: '#fff',
          padding: '16px 36px',
          borderRadius: '99px',
          fontSize: '15px',
          fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 10px 24px rgba(0,0,0,0.1)'
        }}>
          Learn more
        </Link>
      </div>

      {/* Curved Hero Image (Using an arch-like border radius) */}
      <div style={{
        position: 'relative',
        width: '100%',
        flex: 1,
        minHeight: '400px',
        marginTop: 'auto',
      }}>
        {/* We use an SVG mask or border radius for the curve. Simple border-top-left/right-radius for now */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderTopLeftRadius: '50% 100%',
          borderTopRightRadius: '50% 100%',
          overflow: 'hidden'
        }}>
          <Image
            src="/hero_harvester.png"
            alt="Farm landscape"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      </div>
    </section>
  );
}
