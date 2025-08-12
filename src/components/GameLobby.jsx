import React, { useState, useEffect } from 'react';

const GameLobby = ({ 
  roomData, 
  gameState, 
  onStartGame, 
  onBackToHome, 
  onUpdateSettings,
  socketService 
}) => {
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const roomCode = roomData?.room_code || gameState?.roomCode || '';
  const players = roomData?.players || [];
  const settings = roomData?.settings || {};
  const currentSocketId = socketService?.socket?.id;
  
  // Find current player and check if host
  const currentPlayer = players.find(p => p.sid === currentSocketId);
  const isHost = currentPlayer?.is_host || false;
  const canStartGame = isHost && players.length >= 2;

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.log('Failed to copy room code');
    }
  };

  const handleSettingChange = (setting, value) => {
    if (isHost && onUpdateSettings) {
      onUpdateSettings({ [setting]: value });
    }
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
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: 'rgba(42, 42, 42, 0.8)',
      border: '1px solid #333333',
      borderRadius: '8px',
      color: '#ffffff',
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    backButtonHover: {
      background: 'rgba(239, 68, 68, 0.2)',
      borderColor: '#ef4444',
      transform: 'translateY(-2px)',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textAlign: 'center',
      flex: 1,
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
      marginBottom: '2rem',
    },
    card: {
      background: 'rgba(42, 42, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid #333333',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    roomCodeSection: {
      textAlign: 'center',
      marginBottom: '1.5rem',
    },
    roomCodeDisplay: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem 2rem',
      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.1))',
      border: '2px solid #00d4ff',
      borderRadius: '12px',
      fontSize: '2rem',
      fontWeight: '800',
      letterSpacing: '0.2em',
      color: '#00d4ff',
      boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
    },
    copyButton: {
      padding: '0.5rem',
      background: 'rgba(0, 212, 255, 0.2)',
      border: '1px solid #00d4ff',
      borderRadius: '6px',
      color: '#00d4ff',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1rem',
    },
    copyButtonHover: {
      background: '#00d4ff',
      color: '#0a0a0a',
      transform: 'scale(1.1)',
    },
    playersList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    player: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      background: 'rgba(26, 26, 26, 0.8)',
      border: '1px solid #333333',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
    },
    playerHover: {
      borderColor: '#00d4ff',
      boxShadow: '0 0 15px rgba(0, 212, 255, 0.2)',
    },
    playerAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#ffffff',
    },
    playerInfo: {
      flex: 1,
    },
    playerName: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#ffffff',
    },
    playerBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '600',
      marginTop: '0.25rem',
    },
    hostBadge: {
      background: 'rgba(0, 255, 136, 0.2)',
      color: '#00ff88',
      border: '1px solid rgba(0, 255, 136, 0.3)',
    },
    youBadge: {
      background: 'rgba(0, 212, 255, 0.2)',
      color: '#00d4ff',
      border: '1px solid rgba(0, 212, 255, 0.3)',
    },
    settingsGrid: {
      display: 'grid',
      gap: '1.5rem',
    },
    settingItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      background: 'rgba(26, 26, 26, 0.8)',
      border: '1px solid #333333',
      borderRadius: '8px',
    },
    settingLabel: {
      fontSize: '1rem',
      fontWeight: '500',
      color: '#ffffff',
    },
    settingControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    settingButton: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 212, 255, 0.2)',
      border: '1px solid #00d4ff',
      borderRadius: '6px',
      color: '#00d4ff',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1rem',
      fontWeight: '700',
    },
    settingButtonHover: {
      background: '#00d4ff',
      color: '#0a0a0a',
      transform: 'scale(1.1)',
    },
    settingValue: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#ffffff',
      minWidth: '40px',
      textAlign: 'center',
    },
    toggleButton: {
      padding: '0.5rem 1rem',
      background: 'rgba(139, 92, 246, 0.2)',
      border: '1px solid #8b5cf6',
      borderRadius: '6px',
      color: '#8b5cf6',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '0.875rem',
      fontWeight: '600',
    },
    toggleButtonActive: {
      background: '#8b5cf6',
      color: '#ffffff',
    },
    startSection: {
      textAlign: 'center',
      padding: '2rem',
      background: 'rgba(42, 42, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid #333333',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    startButton: {
      padding: '1rem 3rem',
      background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
      border: 'none',
      borderRadius: '12px',
      color: '#0a0a0a',
      fontSize: '1.25rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 20px rgba(0, 255, 136, 0.3)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    startButtonHover: {
      transform: 'translateY(-3px)',
      boxShadow: '0 8px 30px rgba(0, 255, 136, 0.5)',
    },
    startButtonDisabled: {
      background: 'rgba(71, 71, 71, 0.5)',
      color: '#71717a',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
    statusMessage: {
      fontSize: '1rem',
      color: '#a1a1aa',
      marginBottom: '1.5rem',
    },
    shareText: {
      fontSize: '0.875rem',
      color: '#71717a',
      marginTop: '1rem',
      lineHeight: '1.5',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      <div style={styles.content}>
        <div style={styles.header}>
          <button
            onClick={onBackToHome}
            style={styles.backButton}
            onMouseEnter={(e) => Object.assign(e.target.style, styles.backButtonHover)}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(42, 42, 42, 0.8)';
              e.target.style.borderColor = '#333333';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ← Leave Game
          </button>
          <h1 style={styles.title}>Game Lobby</h1>
          <div></div>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span>👥</span>
              Players ({players.length})
            </h2>
            
            <div style={styles.roomCodeSection}>
              <div style={styles.roomCodeDisplay}>
                <span>{roomCode}</span>
                <button
                  onClick={copyRoomCode}
                  style={styles.copyButton}
                  onMouseEnter={(e) => Object.assign(e.target.style, styles.copyButtonHover)}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0, 212, 255, 0.2)';
                    e.target.style.color = '#00d4ff';
                    e.target.style.transform = 'scale(1)';
                  }}
                  title="Copy room code"
                >
                  {copiedCode ? '✓' : '📋'}
                </button>
              </div>
            </div>

            <div style={styles.playersList}>
              {players.map((player, index) => (
                <div
                  key={player.sid || index}
                  style={{
                    ...styles.player,
                    ...(hoveredPlayer === index && styles.playerHover)
                  }}
                  onMouseEnter={() => setHoveredPlayer(index)}
                  onMouseLeave={() => setHoveredPlayer(null)}
                >
                  <div style={styles.playerAvatar}>
                    {player.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={styles.playerInfo}>
                    <div style={styles.playerName}>{player.name}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {player.is_host && (
                        <span style={{ ...styles.playerBadge, ...styles.hostBadge }}>
                          👑 Host
                        </span>
                      )}
                      {player.sid === currentSocketId && (
                        <span style={{ ...styles.playerBadge, ...styles.youBadge }}>
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {players.length < 10 && (
                <div style={styles.player}>
                  <div style={{ ...styles.playerAvatar, background: 'rgba(71, 71, 71, 0.5)' }}>
                    +
                  </div>
                  <div style={styles.playerInfo}>
                    <div style={{ ...styles.playerName, color: '#71717a' }}>
                      Waiting for more players...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span>⚙️</span>
              Game Settings
            </h2>
            
            <div style={styles.settingsGrid}>
              <div style={styles.settingItem}>
                <span style={styles.settingLabel}>Rounds</span>
                <div style={styles.settingControls}>
                  <button
                    onClick={() => handleSettingChange('rounds', Math.max(1, (settings.rounds || 5) - 1))}
                    disabled={!isHost}
                    style={{
                      ...styles.settingButton,
                      opacity: isHost ? 1 : 0.5,
                      cursor: isHost ? 'pointer' : 'not-allowed',
                    }}
                    onMouseEnter={(e) => {
                      if (isHost) Object.assign(e.target.style, styles.settingButtonHover);
                    }}
                    onMouseLeave={(e) => {
                      if (isHost) {
                        e.target.style.background = 'rgba(0, 212, 255, 0.2)';
                        e.target.style.color = '#00d4ff';
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    -
                  </button>
                  <span style={styles.settingValue}>{settings.rounds || 5}</span>
                  <button
                    onClick={() => handleSettingChange('rounds', Math.min(10, (settings.rounds || 5) + 1))}
                    disabled={!isHost}
                    style={{
                      ...styles.settingButton,
                      opacity: isHost ? 1 : 0.5,
                      cursor: isHost ? 'pointer' : 'not-allowed',
                    }}
                    onMouseEnter={(e) => {
                      if (isHost) Object.assign(e.target.style, styles.settingButtonHover);
                    }}
                    onMouseLeave={(e) => {
                      if (isHost) {
                        e.target.style.background = 'rgba(0, 212, 255, 0.2)';
                        e.target.style.color = '#00d4ff';
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={styles.settingItem}>
                <span style={styles.settingLabel}>Time per Question</span>
                <div style={styles.settingControls}>
                  <button
                    onClick={() => handleSettingChange('timePerQuestion', Math.max(10, (settings.timePerQuestion || 30) - 5))}
                    disabled={!isHost}
                    style={{
                      ...styles.settingButton,
                      opacity: isHost ? 1 : 0.5,
                      cursor: isHost ? 'pointer' : 'not-allowed',
                    }}
                    onMouseEnter={(e) => {
                      if (isHost) Object.assign(e.target.style, styles.settingButtonHover);
                    }}
                    onMouseLeave={(e) => {
                      if (isHost) {
                        e.target.style.background = 'rgba(0, 212, 255, 0.2)';
                        e.target.style.color = '#00d4ff';
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    -
                  </button>
                  <span style={styles.settingValue}>{settings.timePerQuestion || 30}s</span>
                  <button
                    onClick={() => handleSettingChange('timePerQuestion', Math.min(60, (settings.timePerQuestion || 30) + 5))}
                    disabled={!isHost}
                    style={{
                      ...styles.settingButton,
                      opacity: isHost ? 1 : 0.5,
                      cursor: isHost ? 'pointer' : 'not-allowed',
                    }}
                    onMouseEnter={(e) => {
                      if (isHost) Object.assign(e.target.style, styles.settingButtonHover);
                    }}
                    onMouseLeave={(e) => {
                      if (isHost) {
                        e.target.style.background = 'rgba(0, 212, 255, 0.2)';
                        e.target.style.color = '#00d4ff';
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={styles.settingItem}>
                <span style={styles.settingLabel}>Chaos Cards</span>
                <button
                  onClick={() => handleSettingChange('chaosCards', !settings.chaosCards)}
                  disabled={!isHost}
                  style={{
                    ...styles.toggleButton,
                    ...(settings.chaosCards && styles.toggleButtonActive),
                    opacity: isHost ? 1 : 0.5,
                    cursor: isHost ? 'pointer' : 'not-allowed',
                  }}
                >
                  {settings.chaosCards ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div style={styles.settingItem}>
                <span style={styles.settingLabel}>Roast Mode</span>
                <button
                  onClick={() => handleSettingChange('roastMode', !settings.roastMode)}
                  disabled={!isHost}
                  style={{
                    ...styles.toggleButton,
                    ...(settings.roastMode && styles.toggleButtonActive),
                    opacity: isHost ? 1 : 0.5,
                    cursor: isHost ? 'pointer' : 'not-allowed',
                  }}
                >
                  {settings.roastMode ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.startSection}>
          <div style={styles.statusMessage}>
            {canStartGame 
              ? `Ready to start! ${players.find(p => p.is_host)?.name || 'Host'} can begin the roast battle.`
              : players.length < 2 
                ? 'Need at least 2 players to start the game'
                : !isHost 
                  ? `Waiting for ${players.find(p => p.is_host)?.name || 'host'} to start the game...`
                  : 'Ready to start!'
            }
          </div>
          
          <button
            onClick={onStartGame}
            disabled={!canStartGame}
            style={{
              ...styles.startButton,
              ...(!canStartGame && styles.startButtonDisabled)
            }}
            onMouseEnter={(e) => {
              if (canStartGame) Object.assign(e.target.style, styles.startButtonHover);
            }}
            onMouseLeave={(e) => {
              if (canStartGame) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 20px rgba(0, 255, 136, 0.3)';
              }
            }}
          >
            🔥 Start the Roast Battle
          </button>

          <div style={styles.shareText}>
            Share the room code <strong>{roomCode}</strong> with your friends!  

            They can join by entering the code on the home page.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
