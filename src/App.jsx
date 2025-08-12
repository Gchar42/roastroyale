import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import LandingPage from './components/LandingPage'
import GameLobby from './components/GameLobby'
import TeamFormation from './components/TeamFormation'
import GamePlay from './components/GamePlay'
import socketService from './services/socket'

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
    console.log('🚀 Initializing Roast Royale...')
    initializeSocket()

    return () => {
      if (socketService && socketService.disconnect) {
        socketService.disconnect()
      }
    }
  }, [])

  const initializeSocket = () => {
    try {
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
  }

  const updateGameState = (updates) => {
    setGameState(prev => ({ ...prev, ...updates }))
  }

  // Manual reconnection
  const handleReconnect = () => {
    console.log('🔄 Manual reconnection triggered')
    setGameState(prev => ({
      ...prev,
      connectionStatus: 'connecting',
      lastError: null
    }))
    if (socketService && socketService.forceReconnect) {
      socketService.forceReconnect()
    }
  }

  // Game actions
  const handleCreateRoom = (playerName) => {
    if (!gameState.connected) {
      alert('Not connected to server. Please wait for connection.')
      return
    }
    
    updateGameState({ playerName: playerName || '' })
    socketService.createRoom(playerName)
  }

  const handleJoinRoom = (roomCode, playerName) => {
    if (!gameState.connected) {
      alert('Not connected to server. Please wait for connection.')
      return
    }
    
    updateGameState({ playerName: playerName || '' })
    socketService.joinRoom(roomCode, playerName)
  }

  const handleStartGame = (settings) => {
    if (!gameState.isHost) {
      alert('Only the host can start the game.')
      return
    }
    
    socketService.startGame(gameState.roomCode, settings || {})
  }

  const handleSubmitAnswer = (answerData) => {
    socketService.submitAnswer(gameState.roomCode, answerData || {})
  }

  const handleUseChaosCard = (cardType) => {
    socketService.useChaosCard(gameState.roomCode, cardType)
  }

  const handleRevealAnswer = () => {
    socketService.revealAnswer(gameState.roomCode)
  }

  const handleNextRound = () => {
    socketService.nextRound(gameState.roomCode)
  }

  const handleBackToHome = () => {
    if (gameState.roomCode) {
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

  const renderCurrentScreen = () => {
    switch (gameState.currentScreen) {
      case 'lobby':
        return (
          <GameLobby
            roomData={gameState.roomData}
            isHost={gameState.isHost}
            onStartGame={handleStartGame}
            onBackToHome={handleBackToHome}
            connected={gameState.connected}
          />
        )
      
      case 'teams':
        return (
          <TeamFormation
            roomData={gameState.roomData}
            onStartGame={handleStartGame}
            onBackToHome={handleBackToHome}
          />
        )
      
      case 'gameplay':
        return (
          <GamePlay
            gameState={gameState}
            onSubmitAnswer={handleSubmitAnswer}
            onUseChaosCard={handleUseChaosCard}
            onRevealAnswer={handleRevealAnswer}
            onNextRound={handleNextRound}
            onBackToHome={handleBackToHome}
          />
        )
      
      default:
        return (
          <LandingPage
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            connected={gameState.connected}
            connectionStatus={gameState.connectionStatus}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <ConnectionStatus />
      {renderCurrentScreen()}
    </div>
  )
}

export default App

