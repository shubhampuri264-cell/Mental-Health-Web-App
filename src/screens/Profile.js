import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { TopBar, BottomNav } from '../components/Navigation';
import '../styles/design-tokens.css';

function Profile() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusIsSuccess, setStatusIsSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLinkAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');
    setStatusIsSuccess(false);
    try {
      // Step 1: Link email (this may send a confirmation email depending on Supabase settings)
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) throw emailError;

      // Step 2: Set password separately — works even if email confirmation is pending
      const { data, error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) throw pwError;

      setStatusIsSuccess(true);
      setStatusMsg(t('nav.accountUpgraded'));
      setUser(data.user);
    } catch (err) {
      console.error(err);
      setStatusIsSuccess(false);
      setStatusMsg(err.message || "Failed to upgrade account.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/home');
  };

  if (loading) return <div className="screen-with-nav" style={{textAlign:'center', padding:'3rem'}}>{isEn ? 'Loading...' : 'लोड हुँदैछ...'}</div>;

  const isAnonymous = user && user.is_anonymous;

  return (
    <div className="profile-screen screen-with-nav" style={{ padding: '0 1rem', background: 'var(--color-bg-cream)' }}>
      <TopBar title={t('nav.profileSettings')} titleEn={t('nav.profileSettings')} />

      <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', marginTop: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--color-deep-indigo)', marginBottom: '0.5rem' }}>
          {t('nav.accountStatus')}
        </h2>

        {isAnonymous ? (
          <div>
            <p style={{ color: 'var(--color-primary-sage)', fontWeight: 'bold', marginBottom: '1rem' }}>
              {t('nav.browsingAnonymously')}
            </p>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem', lineHeight: '1.4' }}>
              {t('nav.anonExplanation')}
            </p>

            <form onSubmit={handleLinkAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label htmlFor="profile-email" className="sr-only">{t('nav.emailPlaceholder')}</label>
              <input
                id="profile-email"
                type="email"
                placeholder={t('nav.emailPlaceholder')}
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ padding: '12px', border: '1px solid #EFECE6', borderRadius: '6px' }}
              />
              <label htmlFor="profile-password" className="sr-only">{t('nav.passwordPlaceholder')}</label>
              <input
                id="profile-password"
                type="password"
                placeholder={t('nav.passwordPlaceholder')}
                required
                minLength="6"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ padding: '12px', border: '1px solid #EFECE6', borderRadius: '6px' }}
              />
              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
                style={{ background: 'var(--color-warm-terracotta)', color: 'white', border: 'none', padding: '14px', borderRadius: '6px', fontWeight: 'bold' }}
              >
                {t('nav.saveData')}
              </button>
              {statusMsg && <p style={{ fontSize: '0.85rem', color: statusIsSuccess ? 'green' : 'red', textAlign: 'center' }}>{statusMsg}</p>}
            </form>
          </div>
        ) : user ? (
          <div>
            <p style={{ color: 'var(--color-deep-indigo)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {t('nav.loggedInAs')} <span style={{color: 'var(--color-primary-sage)'}}>{user.email}</span>
            </p>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '2rem' }}>
              {t('nav.dataSecured')}
            </p>

            <button
              onClick={handleLogout}
              className="primary-btn"
              style={{ background: '#f5f5f5', color: '#B34A30', border: '1px solid #EFECE6', padding: '12px', borderRadius: '6px', width: '100%', fontWeight: 'bold' }}
            >
              {t('nav.signOut')}
            </button>
          </div>
        ) : (
           <p>{isEn ? 'Initializing...' : 'सुरु हुँदैछ...'}</p>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

export default Profile;
