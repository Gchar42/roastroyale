import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react'

// Import components with error boundaries
let LandingPage, GameLobby, TeamFormation, GamePlay, socketService

try {
  LandingPage = require('./components/LandingPage').default
} catch (e) {
  console.error('Failed to load LandingPage:', e)
  LandingPage = () => <div className="text-white p-8">Loading Landing Page...</div>
}

try {
  GameLobby = require('./components/GameLobby').default
} catch (e) {
  console.error('Failed to load GameLobby:', e)
  GameLobby = () => <div className="text-white p-8">Loading Game Lobby...</div>
}

try {
  TeamFormation = require('./components/TeamFormation').default
} catch (e) {
  console.error('Failed to load TeamFormation:', e)
  TeamFormation = () => <div className="text-white p-8">Loading Team Formation...</div>
}

try {
  GamePlay = require('./components/GamePlay').default
} catch (e) {
  console.error('Failed to load GamePlay:', e)
  GamePlay = () => <div className="text-white p-8">Loading Game Play...</div>
}

try {
  socketService = require('./services/socket').default
} catch (e) {
  console.error('Failed to load socket service:', e)
  socketService = {
    socket: null,
    connect: () => console.log('Socket service not available'),
    on: () => {},
    emit: () => {},
    disconnect: () => {},
    createRoom: () => {},
    joinRoom: () => {},
    onConnect: () => {},
    onDisconnect: () => {}
  }
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">🚨 Something went wrong</h1>
            <p className="text-lg mb-4">The game encountered an error</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              Reload Game
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  const [gameState, setGameState] = useState({
    currentScreen: 'landing',
    playerName: '',
    roomCode: '',
    roomData: null,
    gameData: null,
    isHost: false,
    connected: false,
    connectionStatus: 'connecting',
    reconnectAttempts: 0,
    lastError: null
  })

  const [connectionHealth, setConnectionHealth] = useState({
    connected: false,
    socketId: null,
    latency: null,
    transport: null,
    lastConnected: null,
    errors: []
  })

  // Safe initialization
  useEffect(() => {
    try {
      console.log('🚀 Initializing Roast Royale...')
      initializeSocket()
    } catch (error) {
      console.error('Initialization error:', error)
      setGameState(prev => ({
        ...prev,
        connected: false,
        connectionStatus: 'error',
        lastError: error.message
      }))
    }

    return () => {
      try {
        if (socketService && socketService.disconnect) {
          socketService.disconnect()
        }
      } catch (error) {
        console.error('Cleanup error:', error)
      }
    }
  }, [])

  const initializeSocket = () => {
    try {
      if (!socketService) {
        console.warn('Socket service not available')
        return
      }

      // Setup connection callbacks
      socketService.onConnect((data) => {
        console.log('✅ Socket connected:', data)
        setGameState(prev => ({
          ...prev,
          connected: true,
          connectionStatus: 'connected',
          reconnectAttempts: 0,
          lastError: null
        }))
        
        setConnectionHealth(prev => ({
          ...prev,
          connected: true,
          socketId: data?.socketId || null,
          lastConnected: new Date(),
          errors: []
        }))
      })

      socketService.onDisconnect((data) => {
        console.warn('🔌 Socket disconnected:', data)
        setGameState(prev => ({
          ...prev,
          connected: false,
          connectionStatus: data?.reason === 'transport close' ? 'reconnecting' : 'disconnected',
          lastError: data?.error || data?.reason || 'Connection lost'
        }))
        
        setConnectionHealth(prev => ({
          ...prev,
          connected: false,
          socketId: null,
          errors: [...(prev.errors || []).slice(-4), {
            time: new Date(),
            reason: data?.reason || data?.error || 'Unknown'
          }]
        }))
      })

      // Setup game event listeners
      setupGameEventListeners()

      // Start connection
      socketService.connect()

    } catch (error) {
      console.error('❌ Socket initialization error:', error)
      setGameState(prev => ({
        ...prev,
        connected: false,
        connectionStatus: 'error',
        lastError: error.message
      }))
    }
  }

  const setupGameEventListeners = () => {
    if (!socketService || !socketService.on) return

    try {
      // Room creation
      socketService.on('room_created', (data) => {
        console.log('🏠 Room created:', data)
        if (data && data.success) {
          updateGameState({
            currentScreen: 'lobby',
            roomCode: data.room_code || '',
            roomData: data.room_data || null,
            isHost: true
          })
        }
      })

      socketService.on('room_error', (data) => {
        console.error('❌ Room error:', data)
        alert(`Room Error: ${data?.message || 'Unknown error'}`)
      })

      // Room joining
      socketService.on('join_success', (data) => {
        console.log('👥 Joined room successfully:', data)
        if (data && data.success && data.room_data) {
          updateGameState({
            currentScreen: 'lobby',
            roomCode: data.room_data.room_code || '',
            roomData: data.room_data,
            isHost: false
          })
        }
      })

      socketService.on('join_error', (data) => {
        console.error('❌ Join error:', data)
        alert(`Join Error: ${data?.message || 'Failed to join room'}`)
      })

      // Room updates
      socketService.on('room_updated', (roomData) => {
        console.log('🔄 Room updated:', roomData)
        if (roomData) {
          updateGameState({ roomData })
        }
      })

      // Game events
      socketService.on('game_started', (data) => {
        console.log('🎮 Game started:', data)
        if (data && data.room_data) {
          updateGameState({
            currentScreen: 'gameplay',
            gameData: data.room_data
          })
        }
      })

      socketService.on('game_error', (data) => {
        console.error('❌ Game error:', data)
        alert(`Game Error: ${data?.message || 'Game error occurred'}`)
      })

      socketService.on('game_state_updated', (gameData) => {
        console.log('🎯 Game state updated:', gameData)
        if (gameData) {
          updateGameState({ gameData })
        }
      })

      socketService.on('round_started', (data) => {
        console.log('▶️ Round started:', data)
        if (data && data.room_data) {
          updateGameState({ gameData: data.room_data })
        }
      })

      socketService.on('round_ended', (data) => {
        console.log('⏹️ Round ended:', data)
        if (data && data.room_data) {
          updateGameState({ gameData: data.room_data })
        }
      })

      socketService.on('game_ended', (data) => {
        console.log('🏆 Game ended:', data)
        if (data && data.room_data) {
          updateGameState({ 
            gameData: { ...data.room_data, gameEnded: true }
          })
        }
      })

      // Connection events
      socketService.on('connected', (data) => {
        console.log('🔗 Server connection confirmed:', data)
      })

      // Error handling
      socketService.on('error', (data) => {
        console.error('🚨 Socket error:', data)
        setGameState(prev => ({
          ...prev,
          lastError: data?.message || 'Socket error'
        }))
      })

    } catch (error) {
      console.error('Error setting up event listeners:', error)
    }
  }

  const updateGameState = (updates) => {
    try {
      setGameState(prev => ({ ...prev, ...updates }))
    } catch (error) {
      console.error('Error updating game state:', error)
    }
  }

  // Manual reconnection
  const handleReconnect = () => {
    try {
      console.log('🔄 Manual reconnection triggered')
      setGameState(prev => ({
        ...prev,
        connectionStatus: 'connecting',
        lastError: null
      }))
      if (socketService && socketService.forceReconnect) {
        socketService.forceReconnect()
      }
    } catch (error) {
      console.error('Reconnection error:', error)
    }
  }

  // Game actions with error handling
  const handleCreateRoom = (playerName) => {
    try {
      if (!gameState.connected) {
        alert('Not connected to server. Please wait for connection.')
        return
      }
      
      updateGameState({ playerName: playerName || '' })
      if (socketService && socketService.createRoom) {
        socketService.createRoom(playerName)
      }
    } catch (error) {
      console.error('Create room error:', error)
      alert('Failed to create room')
    }
  }

  const handleJoinRoom = (roomCode, playerName) => {
    try {
      if (!gameState.connected) {
        alert('Not connected to server. Please wait for connection.')
        return
      }
      
      updateGameState({ playerName: playerName || '' })
      if (socketService && socketService.joinRoom) {
        socketService.joinRoom(roomCode, playerName)
      }
    } catch (error) {
      console.error('Join room error:', error)
      alert('Failed to join room')
    }
  }

  const handleStartGame = (settings) => {
    try {
      if (!gameState.isHost) {
        alert('Only the host can start the game.')
        return
      }
      
      if (socketService && socketService.startGame) {
        socketService.startGame(gameState.roomCode, settings || {})
      }
    } catch (error) {
      console.error('Start game error:', error)
      alert('Failed to start game')
    }
  }

  const handleSubmitAnswer = (answerData) => {
    try {
      if (socketService && socketService.submitAnswer) {
        socketService.submitAnswer(gameState.roomCode, answerData || {})
      }
    } catch (error) {
      console.error('Submit answer error:', error)
    }
  }

  const handleUseChaosCard = (cardType) => {
    try {
      if (socketService && socketService.useChaosCard) {
        socketService.useChaosCard(gameState.roomCode, cardType)
      }
    } catch (error) {
      console.error('Chaos card error:', error)
    }
  }

  const handleRevealAnswer = () => {
    try {
      if (socketService && socketService.revealAnswer) {
        socketService.revealAnswer(gameState.roomCode)
      }
    } catch (error) {
      console.error('Reveal answer error:', error)
    }
  }

  const handleNextRound = () => {
    try {
      if (socketService && socketService.nextRound) {
        socketService.nextRound(gameState.roomCode)
      }
    } catch (error) {
      console.error('Next round error:', error)
    }
  }

  const handleBackToHome = () => {
    try {
      if (gameState.roomCode && socketService && socketService.leaveRoom) {
        socketService.leaveRoom(gameState.roomCode)
      }
      
      updateGameState({
        currentScreen: 'landing',
        roomCode: '',
        roomData: null,
        gameData: null,
        isHost: false,
        playerName: ''
      })
    } catch (error) {
      console.error('Back to home error:', error)
      // Force navigation even if there's an error
      updateGameState({
        currentScreen: 'landing',
        roomCode: '',
        roomData: null,
        gameData: null,
        isHost: false,
        playerName: ''
      })
    }
  }

  // Connection status component
  const ConnectionStatus = () => {
    const getStatusColor = () => {
      switch (gameState.connectionStatus) {
        case 'connected': return 'bg-green-500/20 text-green-300 border-green-500/30'
        case 'connecting': case 'reconnecting': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        case 'disconnected': case 'error': return 'bg-red-500/20 text-red-300 border-red-500/30'
        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      }
    }

    const getStatusIcon = () => {
      switch (gameState.connectionStatus) {
        case 'connected': return <Wifi className="w-4 h-4" />
        case 'connecting': case 'reconnecting': return <RefreshCw className="w-4 h-4 animate-spin" />
        case 'disconnected': case 'error': return <WifiOff className="w-4 h-4" />
        default: return <AlertCircle className="w-4 h-4" />
      }
    }

    const getStatusText = () => {
      switch (gameState.connectionStatus) {
        case 'connected': return 'Connected ✓'
        case 'connecting': return 'Connecting...'
        case 'reconnecting': return `Reconnecting... (${gameState.reconnectAttempts})`
        case 'disconnected': return 'Disconnected ✗'
        case 'error': return 'Connection Error'
        default: return 'Unknown Status'
      }
    }

    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Badge className={`${getStatusColor()} flex items-center gap-2 px-3 py-1`}>
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
        
        {!gameState.connected && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReconnect}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        )}
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <ConnectionStatus />

          <Routes>
            <Route 
              path="/" 
              element={
                <LandingPage
                  onCreateRoom={handleCreateRoom}
                  onJoinRoom={handleJoinRoom}
                  connected={gameState.connected}
                  connectionStatus={gameState.connectionStatus}
                />
              } 
            />
            
            <Route 
              path="/lobby/:roomCode?" 
              element={
                gameState.currentScreen === 'lobby' ? (
                  <GameLobby
                    roomData={gameState.roomData}
                    isHost={gameState.isHost}
                    onStartGame={handleStartGame}
                    onBackToHome={handleBackToHome}
                    connected={gameState.connected}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            <Route 
              path="/teams/:roomCode?" 
              element={
                gameState.currentScreen === 'teams' ? (
                  <TeamFormation
                    roomData={gameState.roomData}
                    onStartGame={handleStartGame}
                    onBackToHome={handleBackToHome}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            <Route 
              path="/game/:roomCode?" 
              element={
                gameState.currentScreen === 'gameplay' ? (
                  <GamePlay
                    gameState={gameState}
                    onSubmitAnswer={handleSubmitAnswer}
                    onUseChaosCard={handleUseChaosCard}
                    onRevealAnswer={handleRevealAnswer}
                    onNextRound={handleNextRound}
                    onBackToHome={handleBackToHome}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App

