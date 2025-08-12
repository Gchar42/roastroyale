import React, { useState, useEffect } from 'react';

const LandingPage = ({ 
  onCreateRoom, 
  onJoinRoom, 
  connectionStatus, 
  onReconnect 
}) => {
  const [createName, setCreateName] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!createName.trim()) return;
    setIsLoading(true);
    await onCreateRoom(createName.trim());
    setIsLoading(false);
  };

  const handleJoinRoom = async () => {
    if (!joinName.trim() || !joinCode.trim()) return;
    setIsLoading(true);
    await onJoinRoom(joinName.trim(), joinCode.trim().toUpperCase());
    setIsLoading(false);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      color: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(0, 255, 136, 0.05) 0%, transparent 50%)
      `,
      zIndex: 1,
    },
    content: {
      position: 'relative',
      zIndex: 2,
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      justifyContent: 'center',
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem',
    },
    title: {
      fontSize: '3.5rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #00d4ff, #8b5cf6, #00ff88)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem',
      textShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
    },
    subtitle: {
      fontSize: '1.25rem',
      color: '#a1a1aa',
      marginBottom: '2rem',
      maxWidth: '600px',
    },
    connectionStatus: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '600',
      marginBottom: '2rem',
      background: connectionStatus === 'Connected' 
        ? 'rgba(0, 255, 136, 0.1)' 
        : 'rgba(239, 68, 68, 0.1)',
      border: connectionStatus === 'Connected' 
        ? '1px solid rgba(0, 255, 136, 0.3)' 
        : '1px solid rgba(239, 68, 68, 0.3)',
      color: connectionStatus === 'Connected' ? '#00ff88' : '#ef4444',
    },
    gameSection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '2rem',
      width: '100%',
      maxWidth: '800px',
      marginBottom: '3rem',
    },
    card: {
      background: 'rgba(42, 42, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid #333333',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    },
    cardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(0, 212, 255, 0.2)',
      borderColor: '#00d4ff',
    },
    cardIcon: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
      color: '#ffffff',
    },
    cardDescription: {
      color: '#a1a1aa',
      marginBottom: '1.5rem',
      lineHeight: '1.6',
    },
    inputGroup: {
      marginBottom: '1rem',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      background: 'rgba(26, 26, 26, 0.8)',
      border: '2px solid #333333',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    inputFocus: {
      borderColor: '#00d4ff',
      boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.1)',
    },
    button: {
      width: '100%',
      padding: '14px 24px',
      background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
      border: 'none',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4)',
    },
    buttonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
      transform: 'none',
    },
    features: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      width: '100%',
      maxWidth: '800px',
      marginBottom: '2rem',
    },
    feature: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
      background: 'rgba(42, 42, 42, 0.5)',
      borderRadius: '8px',
      border: '1px solid #333333',
    },
    featureIcon: {
      fontSize: '1.25rem',
    },
    featureText: {
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    gameModes: {
      textAlign: 'center',
      width: '100%',
      maxWidth: '600px',
    },
    gameModesTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: '#ffffff',
    },
    modesList: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    mode: {
      padding: '0.5rem 1rem',
      background: 'rgba(139, 92, 246, 0.2)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#8b5cf6',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>👑 Roast Royale</h1>
          <p style={styles.subtitle}>
            The ultimate party game where friends roast each other with hilarious questions and trending topics. Perfect for streamers, Discord groups, and game nights!
          </p>
          
          <div style={styles.connectionStatus}>
            <span>{connectionStatus === 'Connected' ? '✅' : '❌'}</span>
            {connectionStatus}
            {connectionStatus !== 'Connected' && (
              <button 
                onClick={onReconnect}
                style={{
                  marginLeft: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            )}
          </div>
        </div>

        <div style={styles.features}>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🎯</span>
            <span style={styles.featureText}>Multiple Choice Questions</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🔥</span>
            <span style={styles.featureText}>Trending Topics</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>📺</span>
            <span style={styles.featureText}>Perfect for Streamers</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>⚡</span>
            <span style={styles.featureText}>Real-time Multiplayer</span>
          </div>
        </div>

        <div style={styles.gameSection}>
          <div 
            style={styles.card}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, styles.cardHover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.borderColor = '#333333';
            }}
          >
            <div style={styles.cardIcon}>🎮</div>
            <h3 style={styles.cardTitle}>Create Room</h3>
            <p style={styles.cardDescription}>
              Start a new game and invite your friends to join the roast battle
            </p>
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Enter your name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => {
                  e.target.style.borderColor = '#333333';
                  e.target.style.boxShadow = 'none';
                }}
                maxLength={20}
              />
            </div>
            <button
              onClick={handleCreateRoom}
              disabled={!createName.trim() || isLoading || connectionStatus !== 'Connected'}
              style={{
                ...styles.button,
                ...((!createName.trim() || isLoading || connectionStatus !== 'Connected') && styles.buttonDisabled)
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  Object.assign(e.target.style, styles.buttonHover);
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {isLoading ? '🎮 Creating...' : '🎮 Create Game Room'}
            </button>
          </div>

          <div 
            style={styles.card}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, styles.cardHover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.borderColor = '#333333';
            }}
          >
            <div style={styles.cardIcon}>🚪</div>
            <h3 style={styles.cardTitle}>Join Room</h3>
            <p style={styles.cardDescription}>
              Enter a room code to join an existing game with your friends
            </p>
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Enter your name"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => {
                  e.target.style.borderColor = '#333333';
                  e.target.style.boxShadow = 'none';
                }}
                maxLength={20}
              />
            </div>
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Room code (e.g. ABC123)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => {
                  e.target.style.borderColor = '#333333';
                  e.target.style.boxShadow = 'none';
                }}
                maxLength={6}
              />
            </div>
            <button
              onClick={handleJoinRoom}
              disabled={!joinName.trim() || !joinCode.trim() || isLoading || connectionStatus !== 'Connected'}
              style={{
                ...styles.button,
                ...((!joinName.trim() || !joinCode.trim() || isLoading || connectionStatus !== 'Connected') && styles.buttonDisabled)
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  Object.assign(e.target.style, styles.buttonHover);
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {isLoading ? '🚪 Joining...' : '🚪 Join Game'}
            </button>
          </div>
        </div>

        <div style={styles.gameModes}>
          <h3 style={styles.gameModesTitle}>Game Modes</h3>
          <div style={styles.modesList}>
            <span style={styles.mode}>1v1</span>
            <span style={styles.mode}>2v2</span>
            <span style={styles.mode}>3v3</span>
            <span style={styles.mode}>4v4</span>
            <span style={styles.mode}>5v5</span>
            <span style={styles.mode}>FFA</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
