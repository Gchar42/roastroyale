import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import GameLobby from './components/GameLobby';
import GamePlay from './components/GamePlay';

// Socket service for real-time communication
const socketService = {
  socket: null,
  
  connect() {
    try {
      // Use Socket.IO with fallback transports
      const io = window.io || require('socket.io-client');
      
      this.socket = io(window.location.origin, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 10,
        pingTimeout: 60000,
        pingInterval: 25000,
      });

      return this.socket;
    } catch (error) {
      console.error('Socket connection error:', error);
      return null;
    }
  },

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },

  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  },

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  },

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
};

const App = () => {
  const [gameState, setGameState] = useState({
    currentScreen: 'landing', // 'landing', 'lobby', 'gameplay'
    roomCode: '',
    playerName: '',
    roomData: null,
    currentQuestion: null,
    currentRound: 1,
    totalRounds: 5,
    connectionStatus: 'Connecting...',
    error: null,
  });

  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Initialize socket connection
  useEffect(() => {
    const socket = socketService.connect();
    
    if (!socket) {
      setGameState(prev => ({ 
        ...prev, 
        connectionStatus: 'Connection Failed',
        error: 'Failed to initialize connection'
      }));
      return;
    }

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Connected to server');
      setGameState(prev => ({ ...prev, connectionStatus: 'Connected' }));
      setReconnectAttempts(0);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      setGameState(prev => ({ ...prev, connectionStatus: 'Disconnected' }));
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      setGameState(prev => ({ ...prev, connectionStatus: 'Connected' }));
      setReconnectAttempts(0);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt', attemptNumber);
      setGameState(prev => ({ 
        ...prev, 
        connectionStatus: `Reconnecting... (${attemptNumber})` 
      }));
      setReconnectAttempts(attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.log('❌ Reconnection failed:', error);
      setGameState(prev => ({ 
        ...prev, 
        connectionStatus: 'Connection Error',
        error: 'Failed to reconnect to server'
      }));
    });

    socket.on('reconnect_failed', () => {
      console.log('❌ Reconnection failed permanently');
      setGameState(prev => ({ 
        ...prev, 
        connectionStatus: 'Connection Failed',
        error: 'Unable to connect to server'
      }));
    });

    // Game event handlers
    socket.on('room_created', (data) => {
      console.log('🎮 Room created:', data);
      setGameState(prev => ({
        ...prev,
        currentScreen: 'lobby',
        roomCode: data.room_code,
        roomData: data,
        error: null
      }));
    });

    socket.on('room_joined', (data) => {
      console.log('🚪 Room joined:', data);
      setGameState(prev => ({
        ...prev,
        currentScreen: 'lobby',
        roomCode: data.room_code,
        roomData: data,
        error: null
      }));
    });

    socket.on('room_updated', (data) => {
      console.log('🔄 Room updated:', data);
      setGameState(prev => ({
        ...prev,
        roomData: data
      }));
    });

    socket.on('game_started', (data) => {
      console.log('🎯 Game started:', data);
      setGameState(prev => ({
        ...prev,
        currentScreen: 'gameplay',
        currentQuestion: data.question,
        currentRound: data.round,
        totalRounds: data.totalRounds
      }));
    });

    socket.on('new_question', (data) => {
      console.log('❓ New question:', data);
      setGameState(prev => ({
        ...prev,
        currentQuestion: data.question,
        currentRound: data.round
      }));
    });

    socket.on('round_ended', (data) => {
      console.log('🏁 Round ended:', data);
      // Handle round end logic
    });

    socket.on('game_ended', (data) => {
      console.log('🏆 Game ended:', data);
      // Handle game end logic
    });

    socket.on('error', (error) => {
      console.error('🚨 Socket error:', error);
      setGameState(prev => ({
        ...prev,
        error: error.message || 'An error occurred',
        connectionStatus: 'Error'
      }));
    });

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Game action handlers
  const handleCreateRoom = async (playerName) => {
    try {
      setGameState(prev => ({ ...prev, playerName, error: null }));
      socketService.emit('create_room', { 
        player_name: playerName,
        settings: {
          rounds: 5,
          timePerQuestion: 30,
          chaosCards: true,
          roastMode: true
        }
      });
    } catch (error) {
      console.error('Error creating room:', error);
      setGameState(prev => ({ 
        ...prev, 
        error: 'Failed to create room. Please try again.' 
      }));
    }
  };

  const handleJoinRoom = async (playerName, roomCode) => {
    try {
      setGameState(prev => ({ ...prev, playerName, error: null }));
      socketService.emit('join_room', { 
        player_name: playerName, 
        room_code: roomCode.toUpperCase() 
      });
    } catch (error) {
      console.error('Error joining room:', error);
      setGameState(prev => ({ 
        ...prev, 
        error: 'Failed to join room. Please check the room code and try again.' 
      }));
    }
  };

  const handleStartGame = () => {
    try {
      socketService.emit('start_game', { room_code: gameState.roomCode });
    } catch (error) {
      console.error('Error starting game:', error);
      setGameState(prev => ({ 
        ...prev, 
        error: 'Failed to start game. Please try again.' 
      }));
    }
  };

  const handleSubmitAnswer = (answerData) => {
    try {
      socketService.emit('submit_answer', {
        room_code: gameState.roomCode,
        ...answerData
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleUseChaosCard = (cardType) => {
    try {
      socketService.emit('use_chaos_card', {
        room_code: gameState.roomCode,
        card_type: cardType
      });
    } catch (error) {
      console.error('Error using chaos card:', error);
    }
  };

  const handleNextRound = () => {
    try {
      socketService.emit('next_round', { room_code: gameState.roomCode });
    } catch (error) {
      console.error('Error advancing to next round:', error);
    }
  };

  const handleUpdateSettings = (newSettings) => {
    try {
      socketService.emit('update_settings', {
        room_code: gameState.roomCode,
        settings: newSettings
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleBackToHome = () => {
    try {
      // Leave room if in one
      if (gameState.roomCode) {
        socketService.emit('leave_room', { room_code: gameState.roomCode });
      }
      
      // Reset game state
      setGameState(prev => ({
        ...prev,
        currentScreen: 'landing',
        roomCode: '',
        roomData: null,
        currentQuestion: null,
        currentRound: 1,
        error: null
      }));
    } catch (error) {
      console.error('Error returning to home:', error);
      // Force navigation even if there's an error
      setGameState(prev => ({
        ...prev,
        currentScreen: 'landing',
        roomCode: '',
        roomData: null,
        currentQuestion: null,
        currentRound: 1
      }));
    }
  };

  const handleReconnect = () => {
    try {
      socketService.disconnect();
      setTimeout(() => {
        const socket = socketService.connect();
        if (socket) {
          setGameState(prev => ({ 
            ...prev, 
            connectionStatus: 'Connecting...',
            error: null 
          }));
        }
      }, 1000);
    } catch (error) {
      console.error('Error reconnecting:', error);
    }
  };

  // Render current screen
  const renderCurrentScreen = () => {
    try {
      switch (gameState.currentScreen) {
        case 'lobby':
          return (
            <GameLobby
              roomData={gameState.roomData}
              gameState={gameState}
              onStartGame={handleStartGame}
              onBackToHome={handleBackToHome}
              onUpdateSettings={handleUpdateSettings}
              socketService={socketService}
            />
          );
        
        case 'gameplay':
          return (
            <GamePlay
              gameState={gameState}
              roomData={gameState.roomData}
              onSubmitAnswer={handleSubmitAnswer}
              onUseChaosCard={handleUseChaosCard}
              onNextRound={handleNextRound}
              onBackToHome={handleBackToHome}
              socketService={socketService}
            />
          );
        
        default:
          return (
            <LandingPage
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              connectionStatus={gameState.connectionStatus}
              onReconnect={handleReconnect}
            />
          );
      }
    } catch (error) {
      console.error('Error rendering screen:', error);
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ef4444' }}>
              Something went wrong
            </h1>
            <p style={{ marginBottom: '2rem', color: '#a1a1aa' }}>
              {error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={handleBackToHome}
              style={{
                padding: '1rem 2rem',
                background: '#00d4ff',
                border: 'none',
                borderRadius: '8px',
                color: '#0a0a0a',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#ffffff'
    }}>
      {gameState.error && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          padding: '1rem',
          background: 'rgba(239, 68, 68, 0.9)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          color: '#ffffff',
          zIndex: 1000,
          maxWidth: '300px',
          fontSize: '0.875rem'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Error</div>
          <div>{gameState.error}</div>
          <button
            onClick={() => setGameState(prev => ({ ...prev, error: null }))}
            style={{
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              background: 'transparent',
              border: '1px solid #ffffff',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {renderCurrentScreen()}
    </div>
  );
};

export default App;
