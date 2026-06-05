'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function NewsletterFooter() {
  return (
    <footer style={{ background: '#0A1118', padding: '100px 24px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        
        {/* Newsletter Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '40px', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '500px' }}>
            Get fresh updates subscribe to our newsletter
          </h2>
          <div style={{ flex: 1, minWidth: '300px', maxWidth: '400px' }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>
              Get fresh organic updates, seasonal offers, and farm news directly to your inbox. No spam, just good nature.
            </p>
            <div style={{ position: 'relative' }}>
              <input type="email" placeholder="Enter your email" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px 20px', color: '#fff', fontSize: '14px', outline: 'none' }} />
            </div>
          </div>
        </div>

        {/* Big landscape image */}
        <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '24px', overflow: 'hidden', marginBottom: '80px' }}>
          <Image src="/signup-bg.png" alt="Farm landscape at sunset" fill style={{ objectFit: 'cover' }} />
        </div>

        {/* Footer Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '60px', marginBottom: '40px' }}>
          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '24px' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>Our Place</Link>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>Our Mission</Link>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>About Us</Link>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>Our Farm</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '24px' }}>Service</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>Egg Quality Standards</Link>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>Wholesale Partnerships</Link>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>Godown Locations</Link>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>Delivery Service</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '24px' }}>Social Media</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>Instagram ↗</Link>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>Facebook ↗</Link>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>YouTube ↗</Link>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>WhatsApp ↗</Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image src="/logo.png" alt="Sufra Farms" width={24} height={24} style={{ filter: 'brightness(0) invert(1)', width: 'auto', height: 'auto' }} />
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Sufra Farms</span>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>© 2026 Sufra Farms. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
