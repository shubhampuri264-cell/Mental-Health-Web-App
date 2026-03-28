import React from 'react';
import '../styles/DhakaBorder.css';

/**
 * Dhaka Border Strip
 *
 * Inspired by Nepal's traditional hand-woven Dhaka textile patterns.
 * Bold geometric chevron pattern in Indigo + Gold.
 * Used as decoration: left-edge vertical border on landing,
 * thin divider between elements, transition accent.
 */
function DhakaBorder({ orientation = 'vertical', className = '' }) {
  return (
    <div className={`dhaka-border dhaka-${orientation} ${className}`}>
      <svg
        className="dhaka-svg"
        preserveAspectRatio="none"
        viewBox="0 0 24 200"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
        aria-hidden="true"
      >
        {/* Repeating chevron/diamond pattern */}
        {Array.from({ length: 20 }).map((_, i) => (
          <g key={i} transform={`translate(0, ${i * 10})`}>
            <polygon
              points="12,0 24,5 12,10 0,5"
              fill={i % 2 === 0 ? '#1B1F5E' : '#D4A843'}
              opacity={i % 3 === 0 ? 1 : 0.85}
            />
            <line
              x1="0" y1="5"
              x2="24" y2="5"
              stroke="#D4A843"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default DhakaBorder;
