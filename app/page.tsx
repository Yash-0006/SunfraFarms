'use client';

import { useState, useEffect } from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import FaqSection from '@/components/landing/FaqSection';
import ProductsSection from '@/components/landing/ProductsSection';
import AboutUsSection from '@/components/landing/AboutUsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import NewsletterFooter from '@/components/landing/NewsletterFooter';
import LoginModal from '@/components/landing/LoginModal';
import SignupModal from '@/components/landing/SignupModal';
import BackToTopButton from '@/components/landing/BackToTopButton';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('login=true')) {
      setShowLogin(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  return (
    <div style={{ minHeight: '100svh', background: 'var(--bg)' }}>
      <LandingNavbar onOpenLogin={() => setShowLogin(true)} onOpenSignup={() => setShowSignup(true)} />
      <HeroSection />
      <ProductsSection />
      <AboutUsSection />
      <TestimonialsSection />
      <FaqSection />
      <NewsletterFooter />
      
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }} 
      />
      <SignupModal 
        isOpen={showSignup} 
        onClose={() => setShowSignup(false)} 
        onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }} 
      />
      <BackToTopButton />
    </div>
  );
}
