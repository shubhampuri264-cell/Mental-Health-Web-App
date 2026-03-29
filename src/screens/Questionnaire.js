import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuestionFlow } from '../utils/scoring';
import { supabase } from '../supabaseClient';
import ProgressBar from '../components/ProgressBar';
import '../styles/Questionnaire.css';

// Devanagari numerals for ghost display
const DEVANAGARI_NUMERALS = ['०१', '०२', '०३', '०४', '०५', '०६', '०७', '०८', '०९', '१०'];

function Questionnaire() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

  const questionFlow = useMemo(() => getQuestionFlow(answers), [answers]);
  const currentQuestionId = questionFlow[currentIndex];
  const question = t(`questions.${currentQuestionId}`, { returnObjects: true });
  const totalQuestions = questionFlow.length;

  const handleSelect = useCallback((optionIndex) => {
    setSelectedOption(optionIndex);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedOption === null) return;

    const option = question.options[selectedOption];
    const questionData = t(`questions.${currentQuestionId}`, { returnObjects: true });

    const newAnswers = {
      ...answers,
      [currentQuestionId]: {
        score: option.score,
        dimension: questionData.dimension,
        riskFlag: questionData.riskFlag || false,
      },
    };
    setAnswers(newAnswers);

    // Check if we need to recalculate flow (for risk questions)
    const updatedFlow = getQuestionFlow(newAnswers);

    if (currentIndex + 1 < updatedFlow.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      // Store answers in sessionStorage for results screen
      sessionStorage.setItem('manasthiti-answers', JSON.stringify(newAnswers));
      
      // Calculate total score and log silently to Supabase
      let total = 0;
      Object.values(newAnswers).forEach(ans => {
         if (ans && typeof ans.score === 'number') total += ans.score;
      });

      supabase.auth.getUser().then(({ data }) => {
        const user = data?.user;
        if (user) {
          supabase.from('user_checkins').insert([{ stress_score: total, user_id: user.id }]).then(({ error }) => {
            if (error) console.error('Supabase logging error:', error);
          });
        }
      }).catch(err => console.error('Failed to log score:', err));

      navigate('/solidarity');
    }
  }, [selectedOption, question, currentQuestionId, answers, currentIndex, navigate, t]);

  if (!question) return null;

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(null);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="questionnaire-screen">
      <div className="questionnaire-top">
        <button className="q-back-button" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <ProgressBar current={currentIndex + 1} total={totalQuestions} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionId}
          className="question-card"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Ghost Devanagari numeral */}
          <span className="ghost-numeral">
            {DEVANAGARI_NUMERALS[currentIndex] || `${currentIndex + 1}`}
          </span>

          <div className="question-text-block">
            <h2 className="question-text-ne">{question.text}</h2>
          </div>

          <div className="dhaka-divider" />

          <div className="options-list">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${selectedOption === index ? 'selected' : ''}`}
                onClick={() => handleSelect(index)}
              >
                <span className="option-ne">{option.text}</span>
              </button>
            ))}
          </div>

          <button
            className={`next-button ${selectedOption !== null ? 'active' : 'disabled'}`}
            onClick={handleNext}
            disabled={selectedOption === null}
          >
            <span className="next-ne">{t('next')}</span>
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Questionnaire;
