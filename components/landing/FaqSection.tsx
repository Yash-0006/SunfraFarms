'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Play } from 'lucide-react';

const FAQS = [
  { question: "What is Sufra Farms' core mission?", answer: "Sufra Farms aims to provide high-quality, farm-fresh eggs using sustainable and modern poultry management methods." },
  { question: "Are your products 100% organic?", answer: "Our free-range options are raised on organic feed without synthetic additives, ensuring healthy flocks and nutritious eggs." },
  { question: "How fresh are the eggs?", answer: "We collect, grade, and dispatch eggs daily from our godown, ensuring they reach you within 24-48 hours of collection." },
  { question: "Do you offer wholesale purchasing?", answer: "Yes, we support bulk and wholesale purchases for bakeries, restaurants, and retailers. Contact our sales team for details." },
  { question: "Can I schedule recurring deliveries?", answer: "Yes, you can easily set up weekly or bi-weekly subscription deliveries to ensure you never run out of fresh eggs." },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faqs" style={{ padding: '100px 24px', background: 'var(--white)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '1200px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '60px' }}>
        
        {/* Left: Titles & Video/Image */}
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', background: 'var(--grey-bg)', color: 'var(--text-primary)', marginBottom: '16px', display: 'inline-block' }}>
            FAQ
          </span>
          <h2 style={{ fontSize: '42px', fontWeight: 700, color: '#111', lineHeight: 1.1, marginBottom: '40px', letterSpacing: '-0.02em' }}>
            Frequently Asked<br />Questions
          </h2>

          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '24px', overflow: 'hidden' }}>
            <Image src="/drone_spraying.png" alt="Farm Drone" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
          </div>
        </div>

        {/* Right: Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} style={{ background: 'var(--bg)', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s' }}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{ width: '100%', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{faq.question}</span>
                  <ChevronDown size={20} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </button>
                <div style={{ maxHeight: isOpen ? '200px' : '0px', opacity: isOpen ? 1 : 0, transition: 'all 0.3s', padding: isOpen ? '0 24px 24px' : '0 24px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
