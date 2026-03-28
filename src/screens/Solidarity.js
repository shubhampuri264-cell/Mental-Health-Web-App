import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { calculateScore, getSolidarityCount } from '../utils/scoring';
import '../styles/Solidarity.css';

function Solidarity() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [displayCount, setDisplayCount] = useState(0);
  const [result, setResult] = useState(null);
  const [targetCount, setTargetCount] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('manasthiti-answers');
    if (!stored) {
      navigate('/');
      return;
    }

    const answers = JSON.parse(stored);
    const scoreResult = calculateScore(answers);
    setResult(scoreResult);

    const count = getSolidarityCount(scoreResult.cohort);
    setTargetCount(count);

    // Store result for support tier screen
    sessionStorage.setItem('manasthiti-result', JSON.stringify({
      ...scoreResult,
      solidarityCount: count,
    }));

    // Store in check-in history for mood tracking
    const history = JSON.parse(localStorage.getItem('manasthiti-history') || '[]');
    history.push({
      date: new Date().toISOString(),
      score: scoreResult.rawTotal,
      tier: scoreResult.tier,
      cohort: scoreResult.cohort,
    });
    localStorage.setItem('manasthiti-history', JSON.stringify(history));
  }, [navigate]);

  // Animate counter from 0 to target over ~2 seconds
  useEffect(() => {
    if (targetCount === 0) return;

    const duration = 2000;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out curve for natural feel
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.floor(eased * targetCount));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetCount]);

  if (!result) return null;

  const cohortKey = result.cohort;
  const cohort = t(`cohorts.${cohortKey}`, { returnObjects: true });

  return (
    <div className="solidarity-screen">
      <div className="solidarity-content">
        <div className="solidarity-counter">
          {displayCount.toLocaleString()}
        </div>

        <p className="solidarity-message-ne">
          {cohort.message.replace('{count}', displayCount.toLocaleString())}
        </p>

        <div className="solidarity-notalone">
          <p className="notalone-ne">{t('solidarity.notAlone')}</p>
        </div>
      </div>

      <button
        className="solidarity-continue"
        onClick={() => navigate('/support')}
      >
        <span className="continue-ne">{t('solidarity.continue')}</span>
      </button>
    </div>
  );
}

export default Solidarity;
