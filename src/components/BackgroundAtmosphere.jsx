import React from 'react';

export default function BackgroundAtmosphere() {
  return (
    <div className="bg-atmosphere" aria-hidden="true">
      <div className="bg-grid"></div>
      <div className="bg-growth-arrow"></div>
      <div className="glow-ambient-1"></div>
      <div className="glow-ambient-2"></div>
      <div className="bg-orbits">
        <div className="orbit-line orbit-1"></div>
        <div className="orbit-line orbit-2"></div>
        <div className="orbit-line orbit-3"></div>
      </div>
    </div>
  );
}
