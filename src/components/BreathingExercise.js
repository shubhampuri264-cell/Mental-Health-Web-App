import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/BreathingExercise.css';

const PHASES = [
  { name: 'सास लिनुहोस्', nameEn: 'Breathe In', duration: 4000 },
  { name: 'रोक्नुहोस्', nameEn: 'Hold', duration: 4000 },
  { name: 'सास छोड्नुहोस्', nameEn: 'Breathe Out', duration: 6000 },
  { name: 'रोक्नुहोस्', nameEn: 'Hold', duration: 2000 },
];

function BreathingExercise({ onClose }) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const totalCycles = 5;

  useEffect(() => {
    if (!isActive) return;

    const phase = PHASES[phaseIndex];
    setCountdown(Math.ceil(phase.duration / 1000));

    // Countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Phase transition
    timerRef.current = setTimeout(() => {
      const nextPhase = (phaseIndex + 1) % PHASES.length;
      if (nextPhase === 0) {
        const nextCycle = cycleCount + 1;
        if (nextCycle >= totalCycles) {
          setIsActive(false);
          return;
        }
        setCycleCount(nextCycle);
      }
      setPhaseIndex(nextPhase);
    }, phase.duration);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, [isActive, phaseIndex, cycleCount]);

  const handleStart = () => {
    setIsActive(true);
    setPhaseIndex(0);
    setCycleCount(0);
  };

  const handleStop = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setCycleCount(0);
    clearTimeout(timerRef.current);
    clearInterval(countdownRef.current);
  };

  const phase = PHASES[phaseIndex];
  const scaleValue = phaseIndex === 0 ? 1.4 : phaseIndex === 2 ? 0.8 : (phaseIndex === 1 ? 1.4 : 0.8);

  return (
    <div className="breathing-container">
      <div className="breathing-visual">
        <div
          className={`breathing-circle ${isActive ? 'active' : ''}`}
          style={{
            transform: isActive ? `scale(${scaleValue})` : 'scale(1)',
            transition: `transform ${phase.duration}ms ease-in-out`,
          }}
        >
          <div className="breathing-inner">
            {isActive ? (
              <>
                <span className="breathing-phase-ne">{isEn ? phase.nameEn : phase.name}</span>
                <span className="breathing-countdown">{countdown}</span>
              </>
            ) : (
              <>
                <span className="breathing-phase-ne">
                  {cycleCount >= totalCycles ? (isEn ? 'Complete!' : 'सकियो!') : (isEn ? 'Ready' : 'तयार')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="breathing-info">
        {isActive && (
          <p className="breathing-cycle">
            {isEn ? `Cycle ${cycleCount + 1} of ${totalCycles}` : `चक्र ${cycleCount + 1} / ${totalCycles}`}
          </p>
        )}
      </div>

      <div className="breathing-controls">
        {!isActive ? (
          <button className="breathing-start" onClick={handleStart}>
            <span className="btn-ne">{cycleCount >= totalCycles ? (isEn ? 'Do it again' : 'फेरि गर्नुहोस्') : (isEn ? 'Start' : 'सुरु गर्नुहोस्')}</span>
          </button>
        ) : (
          <button className="breathing-stop" onClick={handleStop}>
            <span className="btn-ne">{isEn ? 'Stop' : 'रोक्नुहोस्'}</span>
          </button>
        )}
      </div>

      <div className="breathing-instructions">
        <p className="instructions-ne">{isEn ? '4 seconds in → 4 seconds hold → 6 seconds out' : '४ सेकेन्ड सास लिनुहोस् → ४ सेकेन्ड रोक्नुहोस् → ६ सेकेन्ड सास छोड्नुहोस्'}</p>
      </div>
    </div>
  );
}

export default BreathingExercise;
