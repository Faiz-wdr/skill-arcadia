import React, { useState } from 'react';
import { createRegistration } from '../services/registrationService';

const INITIAL_FORM_VALUES = {
  fullName: '',
  whatsapp: '',
  email: '',
  course: '',
  status: ''
};

export default function RegistrationForm({ webinarId }) {
  const [formData, setFormData] = useState(INITIAL_FORM_VALUES);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredName, setRegisteredName] = useState('');

  const validate = (name, value) => {
    const val = (value || '').trim();
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(val);
    }
    if (name === 'whatsapp') {
      const phoneRegex = /^[\d\s\+\-\(\)]{8,15}$/;
      return phoneRegex.test(val);
    }
    return val.length > 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setTouched((prev) => ({ ...prev, [id]: true }));
    if (serverError) setServerError('');
  };

  const handleBlur = (e) => {
    const { id } = e.target;
    setTouched((prev) => ({ ...prev, [id]: true }));
  };

  const handleResetForm = () => {
    setFormData(INITIAL_FORM_VALUES);
    setTouched({});
    setSubmitted(false);
    setIsSubmitting(false);
    setServerError('');
    setIsSuccess(false);
    setRegisteredName('');
  };

  const getFieldStatus = (fieldName) => {
    const value = formData[fieldName];
    const isValid = validate(fieldName, value);
    const isTouched = touched[fieldName] || submitted;

    if (!isTouched && (!value || value.trim().length === 0)) {
      return '';
    }

    if (isValid) {
      return 'is-valid';
    } else if (isTouched || (value && value.trim().length > 0)) {
      return 'is-invalid';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError('');

    const fields = ['fullName', 'whatsapp', 'email', 'course', 'status'];
    let allValid = true;

    fields.forEach((field) => {
      if (!validate(field, formData[field])) {
        allValid = false;
      }
    });

    if (!allValid) return;

    setIsSubmitting(true);

    // Call Supabase registration service
    const targetWebinarId = webinarId || 'a0000000-0000-0000-0000-000000000001';
    const result = await createRegistration({
      webinarId: targetWebinarId,
      fullName: formData.fullName,
      whatsapp: formData.whatsapp,
      email: formData.email,
      course: formData.course,
      status: formData.status
    });

    if (!result.success) {
      setIsSubmitting(false);
      setServerError(result.message);
      return;
    }

    // Success: show success screen with user's name & action buttons
    setRegisteredName(formData.fullName.trim());
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="form-wrapper anim-form delay-8" id="registration">
      <div className="form-border-wrap">
        <div className="form-accent-line"></div>
        <div className="premium-form-card">
          {isSuccess ? (
            <div className="success-card-content">
              {/* Animated Tick */}
              <div className="success-tick-wrapper">
                <div className="success-tick-halo"></div>
                <svg className="success-tick-svg" viewBox="0 0 52 52" aria-hidden="true">
                  <circle className="success-tick-circle" cx="26" cy="26" r="24" fill="none" />
                  <path className="success-tick-check" fill="none" d="M14.5 27.2l7.5 7.5 15.5-15.5" />
                </svg>
              </div>

              <span className="success-badge">Registration Confirmed</span>

              <h2 className="success-title">
                {registeredName
                  ? `${registeredName}, you successfully registered!`
                  : "You're Successfully Registered!"}
              </h2>

              <p className="success-desc">
                We will update you about the webinar details soon. Thank you!
              </p>

              {/* Action Buttons */}
              <div className="success-actions-group">
                {/* WhatsApp Enquiry Button */}
                <a
                  href="https://api.whatsapp.com/send/?phone=917558877660&text=Hi+Skill+Arcadia%21+%F0%9F%91%8B+I+have+registered+for+the+Skill+Arcadia+%C3%97+Grant+Thornton+Live+Webinar+and+would+like+to+make+an+enquiry.&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="success-btn success-btn-whatsapp"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                  <span>WhatsApp Enquiry</span>
                </a>

                {/* Instagram Button */}
                <a
                  href="https://www.instagram.com/skill_arcadia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="success-btn success-btn-instagram"
                >
                  <i className="fa-brands fa-instagram"></i>
                  <span>Instagram Updates</span>
                </a>

                {/* Brochure Ghost Button */}
                <a
                  href="https://drive.google.com/file/d/1A1dTBHthaf620KNYDwWDYcdOHE1Q55Qa/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="success-btn success-btn-ghost"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="success-btn-stroke-icon"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download Brochure</span>
                </a>
              </div>

              {/* Subtle reset option */}
              <button
                type="button"
                className="success-reset-btn"
                onClick={handleResetForm}
              >
                Register another attendee
              </button>
            </div>
          ) : (
            <>
              <div className="form-header">
                <span className="form-top-label">FREE REGISTRATION</span>
                <h2 className="form-title">JOIN THE WEBINAR</h2>
                <p className="form-desc">
                  Reserve your free spot and receive instant webinar access on WhatsApp.
                </p>
              </div>

              <form id="webinarForm" className="webinar-form" onSubmit={handleSubmit} noValidate>
                <div className="input-group">
                  <label htmlFor="fullName">Full Name</label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      id="fullName"
                      className={`input-field ${getFieldStatus('fullName')}`}
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <i className="fa-solid fa-check input-check"></i>
                  </div>
                  <div className="input-error-msg">Please enter your full name.</div>
                </div>

                <div className="input-group">
                  <label htmlFor="whatsapp">WhatsApp Number</label>
                  <div className="input-wrap">
                    <input
                      type="tel"
                      id="whatsapp"
                      className={`input-field ${getFieldStatus('whatsapp')}`}
                      placeholder="Enter WhatsApp number"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <i className="fa-solid fa-check input-check"></i>
                  </div>
                  <div className="input-error-msg">Please enter a valid WhatsApp number.</div>
                </div>

                <div className="input-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrap">
                    <input
                      type="email"
                      id="email"
                      className={`input-field ${getFieldStatus('email')}`}
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <i className="fa-solid fa-check input-check"></i>
                  </div>
                  <div className="input-error-msg">Please enter a valid email address.</div>
                </div>

                <div className="input-group">
                  <label htmlFor="course">Course</label>
                  <div className="input-wrap">
                    <select
                      id="course"
                      className={`input-field ${getFieldStatus('course')}`}
                      value={formData.course}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    >
                      <option value="" disabled>
                        Select course
                      </option>
                      <option value="bcom">B.Com / BBA</option>
                      <option value="ca">CA</option>
                      <option value="cma-india">CMA India</option>
                      <option value="cma-usa">CMA USA</option>
                      <option value="acca">ACCA</option>
                      <option value="mba">MBA</option>
                      <option value="other">Other</option>
                    </select>
                    <i className="fa-solid fa-check input-check"></i>
                  </div>
                  <div className="input-error-msg">Please select your course.</div>
                </div>

                <div className="input-group">
                  <label htmlFor="status">Current Status</label>
                  <div className="input-wrap">
                    <select
                      id="status"
                      className={`input-field ${getFieldStatus('status')}`}
                      value={formData.status}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    >
                      <option value="" disabled>
                        Select status
                      </option>
                      <option value="student">Student</option>
                      <option value="professional">Working Professional</option>
                    </select>
                    <i className="fa-solid fa-check input-check"></i>
                  </div>
                  <div className="input-error-msg">Please select your current status.</div>
                </div>

                {serverError && (
                  <div
                    className="form-server-error"
                    style={{
                      color: '#EF4444',
                      fontSize: '0.8125rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      textAlign: 'center',
                      fontWeight: 500,
                      marginTop: '4px'
                    }}
                  >
                    {serverError}
                  </div>
                )}

                <button
                  type="submit"
                  id="submitBtn"
                  className="submit-btn"
                  disabled={isSubmitting}
                  style={{
                    opacity: isSubmitting ? 0.8 : 1,
                    pointerEvents: isSubmitting ? 'none' : 'auto'
                  }}
                >
                  <span>
                    {isSubmitting ? 'RESERVING YOUR SPOT...' : 'RESERVE MY SPOT'}
                  </span>
                  {!isSubmitting && <i className="fa-solid fa-arrow-right icon-arrow"></i>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
