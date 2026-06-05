'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

const REVIEWS = [
  { text: "Ever since switching to Sunfra, our family meals have never been healthier. The quality of their eggs is outstanding, and we love supporting a farm that cares.", author: "James Wilson", role: "Local Buyer" },
  { text: "I always get fresh, delicious eggs from this farm. Their deliveries arrive right on schedule for my bakery. I appreciate the reliability.", author: "Michael Johnson", role: "Bakery Owner" },
  { text: "The eggs are consistently fresh with rich yolks. Their dedication to flock health always shows in the quality. I can rely on them with complete confidence.", author: "Helen Hunter", role: "Caring Consumer" },
  { text: "We've tried many local suppliers, but Sunfra Farms simply has the best organic options. Their transparent farming practices give us peace of mind.", author: "Sarah Jenkins", role: "Restaurant Chef" },
  { text: "Unbelievable freshness! It makes a huge difference in my daily cooking. The delivery is always prompt and the packaging is perfect.", author: "David Clarkson", role: "Home Cook" },
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % REVIEWS.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <section id="clients" style={{ padding: '100px 24px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px', maxWidth: '600px' }}>
        <h2 style={{ fontSize: '42px', fontWeight: 800, color: '#111', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Client Feedback
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
          Real experiences from customers who trust Sunfra Farms for fresh, healthy farm products every day.
        </p>
      </div>

      <div 
        style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: '1200px', 
          height: '400px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          perspective: '1000px'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {REVIEWS.map((r, i) => {
          // Calculate offset from the active index
          // This creates a circular loop feeling
          let offset = i - activeIndex;
          if (offset < -2) offset += REVIEWS.length;
          if (offset > 2) offset -= REVIEWS.length;

          // Determine styles based on distance from center
          const isCenter = offset === 0;
          const isVisible = Math.abs(offset) <= 2;
          
          let translateX = offset * 320; // Distance between cards
          let scale = 1 - Math.abs(offset) * 0.15; // Scale down outer cards
          let opacity = isCenter ? 1 : 1 - Math.abs(offset) * 0.4;
          let zIndex = 10 - Math.abs(offset);

          return (
            <div 
              key={i} 
              onClick={() => handleCardClick(i)}
              style={{ 
                position: 'absolute',
                width: '340px',
                background: 'var(--white)', 
                border: '1px solid var(--border)', 
                borderRadius: '24px', 
                padding: '32px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '24px', 
                boxShadow: isCenter ? '0 20px 50px rgba(0,0,0,0.08)' : '0 10px 30px rgba(0,0,0,0.02)',
                transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
                transform: `translateX(${translateX}px) scale(${scale})`,
                opacity: isVisible ? opacity : 0,
                zIndex: zIndex,
                pointerEvents: isVisible ? 'auto' : 'none',
                cursor: isCenter ? 'default' : 'pointer'
              }}
            >
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={isCenter ? "#2E5C1A" : "#111"} color={isCenter ? "#2E5C1A" : "#111"} />)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg)', padding: '12px 16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#111' }}>100%</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CUSTOMER SATISFACTION</span>
              </div>
              <p style={{ fontSize: '15px', color: '#111', lineHeight: 1.6, fontStyle: 'italic', flex: 1 }}>
                "{r.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', position: 'relative', background: 'var(--bg)' }}>
                  <Image src="/user_profile.png" alt={r.author} fill sizes="40px" style={{ objectFit: 'cover' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{r.author}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.role}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Navigation dots */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
        {REVIEWS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleCardClick(idx)}
            style={{
              width: activeIndex === idx ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: activeIndex === idx ? '#2E5C1A' : 'var(--border)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
