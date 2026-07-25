import React from 'react';
import './Visualizer.css';

export default function Visualizer({ visualType, visualData, isActive }) {
  if (!isActive || visualType === 'none' || !visualData) return null;

  return (
    <div className="visualizer-container fade-in">
      {visualType === 'math' && (
        <div className="math-visual">
          <p className="math-equation">{visualData.equation || visualData.text || ''}</p>
        </div>
      )}

      {visualType === 'fraction' && (
        <div className="fraction-visual">
          <FractionSVG 
            numerator={visualData.numerator || 1} 
            denominator={visualData.denominator || 4} 
          />
        </div>
      )}
    </div>
  );
}

function FractionSVG({ numerator, denominator }) {
  // Simple pie chart generation for fractions using SVG dasharray
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const fraction = numerator / denominator;
  const dasharray = `${fraction * circumference} ${circumference}`;

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="fraction-svg">
      <circle cx="60" cy="60" r={radius} fill="#f0f7ff" stroke="#4a90e2" strokeWidth="2" />
      <circle 
        cx="60" 
        cy="60" 
        r={radius / 2} 
        fill="transparent" 
        stroke="#f39c12" 
        strokeWidth={radius} 
        strokeDasharray={dasharray}
        transform="rotate(-90) translate(-120)" 
        className="fraction-fill"
      />
      <text x="60" y="105" textAnchor="middle" fill="#2c3e50" fontWeight="bold">
        {numerator}/{denominator}
      </text>
    </svg>
  );
}
