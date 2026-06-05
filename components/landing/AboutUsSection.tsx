import Image from 'next/image';

export default function AboutUsSection() {
  return (
    <section id="about" style={{ padding: '100px 24px', background: 'var(--white)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', flexDirection: 'column', gap: '60px' }}>
        
        {/* Header Area */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', background: 'var(--bg)', color: 'var(--primary)', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} /> About Us
          </div>
          <h2 style={{ fontSize: '46px', fontWeight: 800, color: '#111', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '24px' }}>
            Rooted in Tradition, Driven by Quality
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Sunfra Farms has been a family-operated agricultural endeavor dedicated to bringing the freshest, most nutritious products to your table. Our commitment goes beyond farming—it's about building a sustainable future.
          </p>
        </div>

        {/* Content & Images Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>
              Our Mission
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We believe in humane practices, organic feed, and an unwavering standard for quality. Every egg collected and every product delivered is a testament to our dedication to the well-being of our flocks and our customers.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              {[
                '100% Organic & Free-Range options',
                'State-of-the-art facilities',
                'Strict hygiene and quality checks',
                'Sustainable farming methods'
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 600, color: '#111' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2E5C1A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ position: 'relative', height: '340px', borderRadius: '24px', overflow: 'hidden', transform: 'translateY(40px)' }}>
              <Image src="/farmer_harvest.png" alt="Happy hens" fill sizes="(max-width: 768px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'relative', height: '340px', borderRadius: '24px', overflow: 'hidden' }}>
              <Image src="/signup-bg.png" alt="Farm landscape" fill sizes="(max-width: 768px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
