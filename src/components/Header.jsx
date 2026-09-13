import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import skillArcadiaLogo from '../assets/img/skill-arcadia-logo.png';
import grantThorntonLogo from '../assets/img/grant-thornton-logo.png';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <div className="brand-lockup">
          <img src={skillArcadiaLogo} alt="Skill Arcadia" />
          <span className="brand-divider">×</span>
          <img src={grantThorntonLogo} alt="Grant Thornton" />
        </div>

        <Link to="/admin/login" className="header-cta" aria-label="Admin Login">
          <span className="cta-text-full">Admin Login</span>
          <span className="cta-text-short">Admin</span>
          <i className="fa-solid fa-arrow-right icon-arrow"></i>
        </Link>
      </div>
    </header>
  );
}
