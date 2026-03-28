import React from 'react';
import '../styles/ProgressBar.css';

function ProgressBar({ current, total }) {
  const progress = (current / total) * 100;

  return (
    <div className="progress-bar-container" aria-label={`Question ${current} of ${total}`}>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
        {/* Dhaka-inspired geometric pattern overlay */}
        <div className="progress-bar-pattern" />
      </div>
    </div>
  );
}

export default ProgressBar;
