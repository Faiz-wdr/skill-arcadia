import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <h4>Skill Arcadia</h4>
          <p>India's No.1 Commerce Upskilling Partner.</p>
        </div>
        <div className="footer-contact">
          <p>Calicut | Kochi | Online</p>
          <p>+91 75588 77660</p>
          <p>skillarcadia@gmail.com</p>
        </div>
        <div className="footer-bottom-row">
          <div className="footer-bottom-text">
            &copy; 2026 Skill Arcadia. All rights reserved.
          </div>
          <div className="social-links">
            <a
              href="https://www.instagram.com/skill_arcadia"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a
              href="https://www.facebook.com/p/Skill-Arcadia-61577750122622/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a
              href="https://www.youtube.com/@SkillArcadia"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <i className="fa-brands fa-youtube"></i>
            </a>
            <a
              href="https://www.linkedin.com/company/skill-arcadia"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
