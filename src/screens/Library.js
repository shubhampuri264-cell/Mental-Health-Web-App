import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TopBar, BottomNav } from '../components/Navigation';
import BreathingExercise from '../components/BreathingExercise';
import AudioPlayer from '../components/AudioPlayer';
import '../styles/Library.css';

import { supabase } from '../supabaseClient';

function Library() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [libraryContent, setLibraryContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [activePrompt, setActivePrompt] = useState(0);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setConnectionError(true);
      setLoading(false);
    }, 5000);

    async function fetchLibrary() {
      try {
        const { data, error } = await supabase
          .from('library_content')
          .select('*');
        
        if (error) throw error;
        
        setLibraryContent(data || []);
        clearTimeout(timeoutId);
        setConnectionError(false);
      } catch (err) {
        console.error('Error fetching library from Supabase:', err);
        setConnectionError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchLibrary();
    
    return () => clearTimeout(timeoutId);
  }, []);

  if (selectedItem === 'breathing') {
    return (
      <div className="library-detail-screen screen-with-nav">
        <TopBar title="Breathing Exercise" titleEn="Breathing Exercise" />
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
        <TopBar title={isEn ? item.title_en : item.title_ne} titleEn={isEn ? item.title_en : item.title_ne} />

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
      <TopBar title={isEn ? "Self-Help Library" : "स्व-सहायता"} titleEn={isEn ? "Self-Help Library" : "स्व-सहायता"} showBack={false} />

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
