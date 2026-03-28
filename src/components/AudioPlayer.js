import React, { useRef, useState } from 'react';

function AudioPlayer({ url, title, isEn }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  return (
    <div style={{ background: 'var(--color-bg-cream)', padding: '1rem', borderRadius: '12px', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #EFECE6' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ margin: 0, color: 'var(--color-deep-indigo)', fontSize: '1rem' }}>{title}</h4>
        <button 
          onClick={togglePlay} 
          title={isEn ? "Play/Pause Audio" : "सुन्नुहोस्"}
          style={{ background: 'var(--color-primary-sage)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}>
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
      </div>
      
      <div style={{ width: '100%', height: '6px', background: '#E2DFD8', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-warm-terracotta)', transition: 'width 0.1s linear' }} />
      </div>
      
      <audio 
        ref={audioRef} 
        src={url} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => setIsPlaying(false)}
        style={{ display: 'none' }} 
      />
    </div>
  );
}

export default AudioPlayer;
