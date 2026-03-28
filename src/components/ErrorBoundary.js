import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
          <h2 style={{ color: '#1B1F5E', marginBottom: '1rem' }}>केही गडबड भयो</h2>
          <p style={{ color: '#6B6B6B', marginBottom: '1.5rem' }}>Something went wrong. Please reload.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#C4522A', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reload
          </button>
          <div style={{ marginTop: '2rem' }}>
            <a href="tel:1660-0102005" style={{ color: '#C4522A', fontWeight: 'bold' }}>
              TPO Nepal: 1660-0102005
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
