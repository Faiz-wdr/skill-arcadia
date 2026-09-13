import React from 'react';
import Countdown from './Countdown';
import RegistrationForm from './RegistrationForm';

export default function Hero({ webinar }) {
  const title = webinar?.title || 'GROW THROUGH INDUSTRY';
  const eyebrow = webinar?.eyebrow || 'NEXT-GEN FINANCE';
  const subtitle =
    webinar?.description ||
    'Where commerce education meets global industry expertise — building practical skills, industry exposure, and future-ready finance professionals.';
  const date = webinar?.date || 'September 23, 2026';
  const time = webinar?.time || '7:30 PM IST';
  const mode = webinar?.mode || 'Live Online';
  const access = webinar?.access || 'Free Registration';
  const webinarId = webinar?.id || 'a0000000-0000-0000-0000-000000000001';

  return (
    <main>
      <section className="hero-section">
        <div className="container hero-grid">
          {/* Left Side: Copy & Info */}
          <div className="hero-content">
            {/* Signature Visual Effect behind Headline */}
            <div className="headline-glow-field anim-reveal delay-1"></div>

            <div className="hero-eyebrow anim-reveal delay-1">{eyebrow}</div>

            <div className="pill-group anim-reveal delay-1">
              <span className="pill">SKILL ARCADIA × GRANT THORNTON</span>
              <span className="pill accent">LIVE WEBINAR</span>
            </div>

            <h1 className="hero-title">
              {title === 'GROW THROUGH INDUSTRY' ? (
                <>
                  <div className="line-wrapper">
                    <span className="line-inner anim-reveal delay-2">
                      <span className="highlight-letter">G</span>ROW
                    </span>
                  </div>
                  <div className="line-wrapper">
                    <span className="line-inner anim-reveal delay-3">
                      <span className="highlight-letter">T</span>HROUGH
                    </span>
                  </div>
                  <div className="line-wrapper">
                    <span className="line-inner anim-reveal delay-4">INDUSTRY</span>
                  </div>
                </>
              ) : (
                <div className="line-wrapper">
                  <span className="line-inner anim-reveal delay-2">{title}</span>
                </div>
              )}
            </h1>

            <div className="ecafa-badge anim-scale delay-5">
              <span className="ecafa-title">ECAFA</span>
              <span className="ecafa-desc">
                Executive Certificate in AI Finance<br />Modeling & Forensic Accounting
              </span>
            </div>

            <p className="hero-subtitle anim-reveal delay-6">{subtitle}</p>

            <div className="info-row anim-reveal delay-7">
              <div className="info-item">
                <span className="info-label">Date</span>
                <span className="info-val">{date}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Time</span>
                <span className="info-val">{time}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Mode</span>
                <span className="info-val">{mode}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Access</span>
                <span className="info-val" style={{ color: 'var(--accent-blue)' }}>
                  {access}
                </span>
              </div>
            </div>

            {/* Countdown Component */}
            <Countdown date={date} time={time} />
          </div>

          {/* Right Side: Form */}
          <RegistrationForm webinarId={webinarId} />
        </div>
      </section>
    </main>
  );
}
