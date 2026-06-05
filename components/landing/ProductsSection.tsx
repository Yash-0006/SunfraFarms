'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const CATEGORIES = [
  'Farm Fresh Eggs',
  'Free-Range Options',
  'Organic Chicken Feed',
  'Fertilizer'
];

const CATEGORY_IMAGES: Record<string, string> = {
  'Farm Fresh Eggs': '/product_fresh_eggs.png',
  'Free-Range Options': '/product_free_range.png',
  'Organic Chicken Feed': '/product_chicken_feed.png',
  'Fertilizer': '/product_fertilizer.png'
};

export default function ProductsSection() {
  const [activeCat, setActiveCat] = useState('Farm Fresh Eggs');

  return (
    <section id="product" style={{ padding: '100px 24px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', background: 'var(--white)', color: 'var(--primary)', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} /> Our Products
        </div>
        <h2 style={{ fontSize: '46px', fontWeight: 800, color: '#111', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Fresh & Organic<br />Products
        </h2>
      </div>

      <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', gap: '60px', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Sidebar */}
        <div style={{ flex: '1', minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)} style={{
              fontSize: '24px', fontWeight: activeCat === cat ? 700 : 500,
              color: activeCat === cat ? '#111' : 'var(--text-muted)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s',
              opacity: activeCat === cat ? 1 : 0.6
            }}>
              {activeCat === cat && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#111' }} />}
              {cat}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: '2', minWidth: '320px', display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1.5', minWidth: '280px', position: 'relative', height: '480px', borderRadius: '24px', overflow: 'hidden' }}>
            <Image 
              src={CATEGORY_IMAGES[activeCat] || '/farmer_harvest.png'} 
              alt={activeCat} 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw" 
              style={{ objectFit: 'cover', transition: 'opacity 0.3s ease-in-out' }} 
            />
          </div>
          
          <div style={{ flex: '1', minWidth: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
              Our {activeCat.toLowerCase()} are carefully managed in our modern facilities. We ensure the highest standards for healthy flocks, resulting in premium quality and nutritious products for you and your family.
            </p>
            <Link href="#about" style={{
              display: 'inline-block',
              background: '#111', color: '#fff', padding: '16px 32px', borderRadius: '16px',
              fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', alignSelf: 'flex-start',
              textDecoration: 'none'
            }}>
              Learn More
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
