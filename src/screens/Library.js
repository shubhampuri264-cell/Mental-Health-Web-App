import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TopBar, BottomNav } from '../components/Navigation';
import BreathingExercise from '../components/BreathingExercise';
import AudioPlayer from '../components/AudioPlayer';
import '../styles/Library.css';

import { supabase } from '../supabaseClient';

const staticLibraryData = [
  {
    id: 'pmr',
    category: 'exercise',
    title_en: 'Progressive Muscle Relaxation',
    title_ne: 'मांसपेशी विश्राम अभ्यास',
    icon: '💪',
    content: {
      stepsEn: [
        "Find a quiet place and sit comfortably.",
        "Take a deep breath and close your eyes.",
        "Tense the muscles in your toes for 5 seconds.",
        "Release and relax for 10 seconds.",
        "Move up to your calves, tense and release.",
        "Continue moving up your body (legs, stomach, hands, face)."
      ],
      stepsNe: [
        "शान्त ठाउँमा बस्नुहोस् र आँखा बन्द गर्नुहोस्।",
        "गहिरो सास लिनुहोस्।",
        "५ सेकेन्डसम्म आफ्नो खुट्टाको औंला कडा पार्नुहोस्।",
        "१० सेकेन्डको लागि छोड्नुहोस् र आराम महसुस गर्नुहोस्।",
        "यसैगरी पिँडुला, तिघ्रा, पेट र अनुहारमा दोहोर्याउनुहोस्।"
      ]
    }
  },
  {
    id: 'box_breathing',
    category: 'exercise',
    title_en: 'Box Breathing',
    title_ne: 'बक्स ब्रिदिङ',
    icon: '🔲',
    content: {
      stepsEn: [
        "Exhale completely to the count of 4.",
        "Hold your lungs empty for a 4-count.",
        "Inhale deeply through your nose to the count of 4.",
        "Hold the air in your lungs for a 4-count.",
        "Repeat this pattern for 3-5 minutes."
      ],
      stepsNe: [
        "४ गन्दासम्म सास बाहिर फाल्नुहोस्।",
        "४ गन्दासम्म सास रोक्नुहोस्।",
        "४ गन्दासम्म भित्र सास लिनुहोस्।",
        "४ गन्दासम्म सास भित्र होल्ड गर्नुहोस्।",
        "३-५ मिनेटसम्म दोहोर्याउनुहोस्।"
      ]
    }
  },
  {
    id: 'gratitude_journal',
    category: 'journal',
    title_en: 'Gratitude Reflection',
    title_ne: 'कृतज्ञता जर्नलिङ',
    icon: '🌅',
    content: {
      promptsEn: [
        "What are three things that went well today?",
        "Who are you thankful for and why?",
        "What is a simple pleasure you enjoyed recently?",
        "Name a challenge you overcame."
      ],
      promptsNe: [
        "आज राम्रो भएका तीन कुराहरू के हुन्?",
        "तपाईं कोप्रति आभारी हुनुहुन्छ?",
        "तपाईंले भर्खरै रमाइलो मानेको सानो कुरा के हो?",
        "तपाईंले पार गरेको एउटा चुनौती लेख्नुहोस्।"
      ]
    }
  },
  {
    id: 'cognitive_distortion',
    category: 'learn',
    title_en: 'Common Thinking Traps',
    title_ne: 'सोचका त्रुटिहरू',
    icon: '🧠',
    content: {
      sectionsEn: [
        { title: "All-or-Nothing Thinking", body: "Seeing things in black and white. Total success or total failure." },
        { title: "Overgeneralization", body: "Seeing a single negative event as a never-ending pattern." },
        { title: "Jumping to Conclusions", body: "Assuming the worst without facts." }
      ],
      sectionsNe: [
        { title: "कालो वा सेतो सोच", body: "कुराहरूलाई पूर्ण सफलता वा पूर्ण विफलताको रूपमा मात्र हेर्ने।" },
        { title: "अति सामान्यीकरण", body: "एउटा सानो घटनालाई सँधै हुने कुरा जस्तो मान्ने।" },
        { title: "निष्कर्षमा हतारिनु", body: "प्रमाण बिना नै नराम्रो हुन्छ भनेर मान्नु।" }
      ]
    }
  }
];

function Library() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [libraryContent, setLibraryContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [activePrompt, setActivePrompt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setConnectionError(true);
        setLoading(false);
      }
    }, 5000);

    async function fetchLibrary() {
      try {
        const { data, error } = await supabase
          .from('library_content')
          .select('*');

        if (cancelled) return;
        if (error) {
          console.error(error);
          setLibraryContent(staticLibraryData);
        } else {
          // Merge dynamic and static to make it feel robust
          const existingIds = new Set(data.map(d => d.id));
          const uniqueStatic = staticLibraryData.filter(sd => !existingIds.has(sd.id));
          setLibraryContent([...uniqueStatic, ...data]);
        }

        clearTimeout(timeoutId);
        setConnectionError(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching library from Supabase:', err);
        clearTimeout(timeoutId);
        setLibraryContent(staticLibraryData); // fallback
        setConnectionError(false); // set false to show static resources
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchLibrary();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  if (selectedItem === 'breathing') {
    return (
      <div className="library-detail-screen screen-with-nav">
        <TopBar title={t('nav.breathingExercise')} titleEn={t('nav.breathingExercise')} onBack={() => setSelectedItem(null)} />
        <BreathingExercise onClose={() => setSelectedItem(null)} />
        <BottomNav />
      </div>
    );
  }

  if (selectedItem) {
    const item = libraryContent.find(i => i.id === selectedItem);
    if (!item) return null;

    return (
      <div className="library-detail-screen screen-with-nav">
        <TopBar title={isEn ? item.title_en : item.title_ne} titleEn={isEn ? item.title_en : item.title_ne} onBack={() => setSelectedItem(null)} />

        <div className="library-detail-content">
          <div className="detail-header">
            <span className="detail-icon">{item.icon}</span>
            <h2 className="detail-title-ne">{isEn ? item.title_en : item.title_ne}</h2>
          </div>

          {/* Audio Integration */}
          {item.content?.audioUrl && (
            <div style={{ marginBottom: '1.5rem' }}>
              <AudioPlayer 
                url={item.content.audioUrl}
                title={isEn ? "Guided Meditation Audio" : "निर्देशित ध्यान अडियो"}
                isEn={isEn}
              />
            </div>
          )}

          {/* Grounding Exercise */}
          {item.content?.stepsNe && (
            <div className="detail-steps">
              {(isEn ? item.content.stepsEn : item.content.stepsNe).map((step, i) => (
                <div key={i} className="detail-step">
                  <span className="step-number">{5 - i}</span>
                  <div>
                    <p className="step-text-ne">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Journaling */}
          {item.content?.promptsNe && (
            <div className="journal-section">
              <div className="journal-prompt-card">
                <p className="journal-prompt-ne">{(isEn ? item.content.promptsEn : item.content.promptsNe)[activePrompt]}</p>
              </div>
              <textarea
                className="journal-input"
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder={isEn ? "Write here..." : "यहाँ लेख्नुहोस्..."}
                rows={5}
              />
              <div className="journal-actions">
                <button
                  className="journal-save"
                  onClick={() => {
                    if (journalEntry.trim()) {
                      const entries = JSON.parse(localStorage.getItem('manasthiti-journal') || '[]');
                      entries.push({
                        date: new Date().toISOString(),
                        prompt: (isEn ? item.content.promptsEn : item.content.promptsNe)[activePrompt],
                        text: journalEntry,
                      });
                      localStorage.setItem('manasthiti-journal', JSON.stringify(entries));
                      setJournalEntry('');
                      setActivePrompt((activePrompt + 1) % item.content.promptsNe.length);
                    }
                  }}
                >
                  {isEn ? 'Save' : 'सुरक्षित गर्नुहोस्'}
                </button>
                <button
                  className="journal-next-prompt"
                  onClick={() => setActivePrompt((activePrompt + 1) % item.content.promptsNe.length)}
                >
                  {isEn ? 'Next prompt →' : 'अर्को प्रश्न →'}
                </button>
              </div>
              <p className="journal-privacy">🔒 {isEn ? 'Stored only on your device' : 'यो तपाईंको फोनमा मात्र सुरक्षित छ'}</p>
            </div>
          )}

          {/* Educational Content */}
          {item.content?.sectionsNe && (
            <div className="edu-sections">
              {(isEn ? item.content.sectionsEn : item.content.sectionsNe).map((section, i) => (
                <div key={i} className="edu-section">
                  <h3 className="edu-title-ne">{section.title}</h3>
                  <p className="edu-body-ne">{section.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          {item.content?.tipsNe && (
            <div className="tips-list">
              {(isEn ? item.content.tipsEn : item.content.tipsNe).map((tip, i) => (
                <div key={i} className="tip-item">
                  <span className="tip-number">{i + 1}</span>
                  <div>
                    <p className="tip-ne">{tip}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    );
  }

  // Library listing
  return (
    <div className="library-screen screen-with-nav">
      <TopBar title={t('nav.selfHelpLibrary')} titleEn={t('nav.selfHelpLibrary')} showBack={false} />

      <div className="library-categories">
        {loading ? (
          <p style={{textAlign: 'center', opacity: 0.5}}>{isEn ? "Loading resources..." : "लोड हुँदैछ..."}</p>
        ) : connectionError ? (
          <div style={{textAlign: 'center', padding: '2rem'}}>
            <h3 style={{color: 'var(--color-warm-terracotta)', marginBottom: '1rem'}}>{isEn ? "Connection Error" : "जडान त्रुटि"}</h3>
            <p style={{opacity: 0.7, marginBottom: '1.5rem'}}>{isEn ? "Unable to connect to the mental health library. Please check your internet connection." : "तपाईंको इन्टरनेट जडान जाँच गर्नुहोस् वा केही समयपछि फेरि प्रयास गर्नुहोस्।"}</p>
            <button 
              className="primary-btn" 
              onClick={() => window.location.reload()}
              style={{ background: 'var(--color-primary-sage)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
            >
              {isEn ? "Try Again" : "फेरि प्रयास गर्नुहोस्"}
            </button>
          </div>
        ) : (
          <>
            <div className="emergency-hotlines-card">
              <div className="emergency-header">
                <span className="emergency-icon">🚨</span>
                <h3 className="emergency-title">{isEn ? 'Emergency Helplines' : 'आपतकालीन हेल्पलाइनहरू'}</h3>
              </div>
              <p className="emergency-desc">
                {isEn ? 'If you or someone you know is in immediate danger, please reach out to these free, confidential resources:' : 'यदि तपाईं वा तपाईंले चिनेको कोही व्यक्ति संकटमा हुनुहुन्छ भने तल दिइएको नम्बरहरूमा सम्पर्क गर्नुहोस्:'}
              </p>
              <div className="hotline-links">
                <a href="tel:988" className="hotline-item">
                  <div className="hotline-desc-block">
                    <span className="hotline-name">US Suicide & Crisis Lifeline</span>
                    <span className="hotline-sub">Available 24/7, English & Spanish</span>
                  </div>
                  <span className="hotline-number">Call 988</span>
                </a>
                <a href="sms:741741" className="hotline-item">
                  <div className="hotline-desc-block">
                    <span className="hotline-name">US Crisis Text Line</span>
                    <span className="hotline-sub">Available 24/7</span>
                  </div>
                  <span className="hotline-number">Text HOME to 741741</span>
                </a>
                <a href="tel:16600102005" className="hotline-item">
                  <div className="hotline-desc-block">
                    <span className="hotline-name">Nepal TUTH Suicide Hotline</span>
                    <span className="hotline-sub">T.U. Teaching Hospital</span>
                  </div>
                  <span className="hotline-number">1660-010-2005</span>
                </a>
              </div>
            </div>

            <h3 className="lib-cat-title-ne">{isEn ? 'Exercises' : 'अभ्यासहरू'}</h3>
            <div className="library-grid">
              {libraryContent.filter(i => i.category === 'exercise').map((item) => (
                <button key={item.id} className="library-card" onClick={() => setSelectedItem(item.id)}>
                  <span className="library-card-icon">{item.icon}</span>
                  <span className="library-card-ne">{isEn ? item.title_en : item.title_ne}</span>
                </button>
              ))}
            </div>

            <h3 className="lib-cat-title-ne">{isEn ? 'Journaling' : 'जर्नलिङ'}</h3>
            <div className="library-grid">
              {libraryContent.filter(i => i.category === 'journal').map((item) => (
                <button key={item.id} className="library-card" onClick={() => setSelectedItem(item.id)}>
                  <span className="library-card-icon">{item.icon}</span>
                  <span className="library-card-ne">{isEn ? item.title_en : item.title_ne}</span>
                </button>
              ))}
            </div>

            <h3 className="lib-cat-title-ne">{isEn ? 'Learn' : 'सिक्नुहोस्'}</h3>
            <div className="library-grid">
              {libraryContent.filter(i => i.category === 'learn').map((item) => (
                <button key={item.id} className="library-card" onClick={() => setSelectedItem(item.id)}>
                  <span className="library-card-icon">{item.icon}</span>
                  <span className="library-card-ne">{isEn ? item.title_en : item.title_ne}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default Library;
