import { useState } from 'react'

const LandingPage = ({ onCreateRoom, onJoinRoom, connected, connectionStatus }) => {
  const [createPlayerName, setCreatePlayerName] = useState('')
  const [joinPlayerName, setJoinPlayerName] = useState('')
  const [joinRoomCode, setJoinRoomCode] = useState('')

  const handleCreateRoom = () => {
    if (!createPlayerName.trim()) {
      alert('Please enter your name')
      return
    }
    if (!connected) {
      alert('Not connected to server. Please wait for connection.')
      return
    }
    onCreateRoom(createPlayerName.trim())
  }

  const handleJoinRoom = () => {
    if (!joinPlayerName.trim()) {
      alert('Please enter your name')
      return
    }
    if (!joinRoomCode.trim()) {
      alert('Please enter a room code')
      return
    }
    if (!connected) {
      alert('Not connected to server. Please wait for connection.')
      return
    }
    onJoinRoom(joinRoomCode.trim().toUpperCase(), joinPlayerName.trim())
  }

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundBlob1: {
      position: 'absolute',
      top: '-200px',
      right: '-200px',
      width: '400px',
      height: '400px',
      background: 'rgba(147, 51, 234, 0.2)',
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'pulse 3s infinite'
    },
    backgroundBlob2: {
      position: 'absolute',
      bottom: '-200px',
      left: '-200px',
      width: '400px',
      height: '400px',
      background: 'rgba(59, 130, 246, 0.2)',
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'pulse 3s infinite 1s'
    },
    content: {
      maxWidth: '1000px',
      width: '100%',
      position: 'relative',
      zIndex: 10
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '4rem',
      fontWeight: 'bold',
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '20px',
      textShadow: '0 4px 8px rgba(0,0,0,0.3)'
    },
    subtitle: {
      fontSize: '1.5rem',
      color: 'rgba(255,255,255,0.9)',
      marginBottom: '30px'
    },
    badges: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '20px'
    },
    badge: {
      background: 'rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.9)',
      padding: '8px 16px',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.2)',
      fontSize: '0.9rem',
      backdropFilter: 'blur(10px)'
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '30px',
      marginBottom: '40px'
    },
    card: {
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '20px',
      padding: '30px',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    cardHover: {
      background: 'rgba(255,255,255,0.15)',
      transform: 'translateY(-5px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
    },
    cardIcon: {
      width: '60px',
      height: '60px',
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 20px',
      fontSize: '24px'
    },
    cardTitle: {
      color: 'white',
      fontSize: '1.8rem',
      fontWeight: 'bold',
      marginBottom: '10px',
      textAlign: 'center'
    },
    cardDescription: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: '1.1rem',
      marginBottom: '20px',
      textAlign: 'center'
    },
    input: {
      width: '100%',
      padding: '15px',
      marginBottom: '15px',
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1.1rem',
      outline: 'none'
    },
    button: {
      width: '100%',
      padding: '15px',
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      border: 'none',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    },
    buttonDisabled: {
      background: 'rgba(255,255,255,0.2)',
      cursor: 'not-allowed',
      opacity: 0.6
    },
    gameModesCard: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '20px',
      padding: '30px',
      marginBottom: '20px'
    },
    gameModesTitle: {
      color: 'white',
      fontSize: '1.8rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '20px'
    },
    gameModesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '20px',
      textAlign: 'center'
    },
    gameModeItem: {
      color: 'white'
    },
    gameModeNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    gameModeDescription: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: '0.9rem'
    },
    connectionStatus: {
      textAlign: 'center',
      marginTop: '20px'
    },
    statusBadge: {
      background: connected ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
      color: connected ? '#22c55e' : '#ef4444',
      border: `1px solid ${connected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.9rem'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundBlob1}></div>
      <div style={styles.backgroundBlob2}></div>
      
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>👑 Roast Royale 👑</h1>
          <p style={styles.subtitle}>Think you know your friends? Think again.</p>
          
          <div style={styles.badges}>
            <span style={styles.badge}>❤️ Multiple Choice Questions</span>
            <span style={styles.badge}>✨ Trending Topics</span>
            <span style={styles.badge}>🎯 Perfect for Streamers</span>
          </div>
        </div>

        {/* Main Actions */}
        <div style={styles.cardsContainer}>
          {/* Create Room */}
          <div style={styles.card}>
            <div style={styles.cardIcon}>🎮</div>
            <h2 style={styles.cardTitle}>Create Room</h2>
            <p style={styles.cardDescription}>Start a new game and invite your friends</p>
            
            <input
              style={styles.input}
              placeholder="Enter your name"
              value={createPlayerName}
              onChange={(e) => setCreatePlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
            />
            <button
              style={{
                ...styles.button,
                ...((!connected || !createPlayerName.trim()) ? styles.buttonDisabled : {})
              }}
              onClick={handleCreateRoom}
              disabled={!connected || !createPlayerName.trim()}
              onMouseOver={(e) => {
                if (connected && createPlayerName.trim()) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              👥 Create Game Room
            </button>
          </div>

          {/* Join Room */}
          <div style={styles.card}>
            <div style={styles.cardIcon}>👥</div>
            <h2 style={styles.cardTitle}>Join Room</h2>
            <p style={styles.cardDescription}>Enter a room code to join an existing game</p>
            
            <input
              style={styles.input}
              placeholder="Enter your name"
              value={joinPlayerName}
              onChange={(e) => setJoinPlayerName(e.target.value)}
            />
            <input
              style={{...styles.input, fontFamily: 'monospace', textTransform: 'uppercase'}}
              placeholder="Room code (e.g. ABC123)"
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
            <button
              style={{
                ...styles.button,
                background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                ...((!connected || !joinPlayerName.trim() || !joinRoomCode.trim()) ? styles.buttonDisabled : {})
              }}
              onClick={handleJoinRoom}
              disabled={!connected || !joinPlayerName.trim() || !joinRoomCode.trim()}
              onMouseOver={(e) => {
                if (connected && joinPlayerName.trim() && joinRoomCode.trim()) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              🎯 Join Game
            </button>
          </div>
        </div>

        {/* Game Modes */}
        <div style={styles.gameModesCard}>
          <h2 style={styles.gameModesTitle}>Game Modes</h2>
          <div style={styles.gameModesGrid}>
            <div style={styles.gameModeItem}>
              <div style={styles.gameModeNumber}>1v1</div>
              <div style={styles.gameModeDescription}>Intense duels</div>
            </div>
            <div style={styles.gameModeItem}>
              <div style={styles.gameModeNumber}>2v2</div>
              <div style={styles.gameModeDescription}>Couple's therapy</div>
            </div>
            <div style={styles.gameModeItem}>
              <div style={styles.gameModeNumber}>3v3</div>
              <div style={styles.gameModeDescription}>Squad goals</div>
            </div>
            <div style={styles.gameModeItem}>
              <div style={styles.gameModeNumber}>4v4</div>
              <div style={styles.gameModeDescription}>Crew battles</div>
            </div>
            <div style={styles.gameModeItem}>
              <div style={styles.gameModeNumber}>5v5</div>
              <div style={styles.gameModeDescription}>Army warfare</div>
            </div>
            <div style={styles.gameModeItem}>
              <div style={styles.gameModeNumber}>FFA</div>
              <div style={styles.gameModeDescription}>Pure chaos</div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div style={styles.connectionStatus}>
          <span style={styles.statusBadge}>
            {connected ? '✅ Connected' : '❌ Disconnected'}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        input::placeholder {
          color: rgba(255,255,255,0.5);
        }
        
        input:focus {
          border-color: rgba(255,255,255,0.4);
          box-shadow: 0 0 0 2px rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  )
}

export default LandingPage

