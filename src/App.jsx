import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import socketService from './services/socket'
import LandingPage from './components/LandingPage'
import GameLobby from './components/GameLobby'
import GamePlay from './components/GamePlay'
import TeamFormation from './components/TeamFormation'

function App() {
  const [gameState, setGameState] = useState({
    isConnected: false,
    connectionError: null,
    playerName: '',
    roomCode: '',
    roomData: null,
    gameData: null,
    gameStarted: false,
    currentRound: 0,
    totalRounds: 5
  })

  useEffect(() => {
    // Initialize socket connection
    socketService.connect()

    // Socket event listeners
    socketService.on('connected', (data) => {
      console.log('Connected to server:', data)
      setGameState(prev => ({
        ...prev,
        isConnected: true,
        connectionError: null
      }))
    })

    socketService.on('disconnect', () => {
      setGameState(prev => ({
        ...prev,
        isConnected: false,
        connectionError: 'Disconnected from server'
      }))
    })

    socketService.on('room_created', (data) => {
      console.log('Room created:', data)
      if (data.success) {
        setGameState(prev => ({
          ...prev,
          roomCode: data.room_code,
          roomData: data.room_data
        }))
        // Navigate to lobby after room creation
        window.location.href = `/lobby/${data.room_code}`
      }
    })

    socketService.on('room_updated', (data) => {
      console.log('Room updated:', data)
      setGameState(prev => ({
        ...prev,
        roomData: data
      }))
    })

    // FIXED: Proper join success handling with navigation
    socketService.on('join_success', (data) => {
      console.log('Successfully joined room:', data)
      setGameState(prev => ({
        ...prev,
        roomCode: data.room_data.room_code,
        roomData: data.room_data
      }))
      // Navigate to lobby after successful join
      window.location.href = `/lobby/${data.room_data.room_code}`
    })

    socketService.on('join_error', (data) => {
      console.error('Failed to join room:', data.message)
      alert('Failed to join room: ' + data.message)
    })

    socketService.on('room_error', (data) => {
      console.error('Room error:', data.message)
      alert('Room error: ' + data.message)
    })

    socketService.on('game_started', (data) => {
      console.log('Game started:', data)
      setGameState(prev => ({
        ...prev,
        gameData: data,
        gameStarted: true
      }))
    })

    socketService.on('game_state_updated', (data) => {
      console.log('Game state updated:', data)
      setGameState(prev => ({
        ...prev,
        gameData: data
      }))
    })

    socketService.on('round_started', (data) => {
      console.log('Round started:', data)
      setGameState(prev => ({
        ...prev,
        gameData: data
      }))
    })

    socketService.on('round_ended', (data) => {
      console.log('Round ended:', data)
      setGameState(prev => ({
        ...prev,
        gameData: data
      }))
    })

    socketService.on('game_ended', (data) => {
      console.log('Game ended:', data)
      setGameState(prev => ({
        ...prev,
        gameData: data,
        gameStarted: false
      }))
    })

    // Cleanup on unmount
    return () => {
      socketService.disconnect()
    }
  }, [])

  const updateGameState = (updates) => {
    setGameState(prev => ({ ...prev, ...updates }))
  }

  const createRoom = (playerName) => {
    console.log('Creating room for player:', playerName)
    updateGameState({ playerName })
    socketService.createRoom(playerName)
  }

  const joinRoom = (roomCode, playerName) => {
    console.log('Joining room:', roomCode, 'as player:', playerName)
    updateGameState({ playerName, roomCode })
    socketService.joinRoom(roomCode, playerName)
  }

  const startGame = (settings) => {
    console.log('Starting game with settings:', settings)
    socketService.startGame(gameState.roomCode, settings)
  }

  const submitAnswer = (answer) => {
    socketService.submitAnswer(gameState.roomCode, answer)
  }

  const useChaosCard = (cardType) => {
    socketService.useChaosCard(gameState.roomCode, cardType)
  }

  const revealAnswer = () => {
    socketService.revealAnswer(gameState.roomCode)
  }

  const nextRound = () => {
    socketService.nextRound(gameState.roomCode)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Connection Status */}
      {!gameState.isConnected && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-lg">
            {gameState.connectionError || 'Connecting to server...'}
          </div>
        </div>
      )}

      {gameState.isConnected && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500/90 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-lg">
            Connected ✓
          </div>
        </div>
      )}

      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <LandingPage 
                gameState={gameState}
                onCreateRoom={createRoom}
                onJoinRoom={joinRoom}
              />
            } 
          />
          <Route 
            path="/lobby/:roomCode" 
            element={
              <GameLobby 
                gameState={gameState} 
                updateGameState={updateGameState}
                onStartGame={startGame}
              />
            } 
          />
          <Route 
            path="/teams/:roomCode" 
            element={
              <TeamFormation 
                gameState={gameState}
                updateGameState={updateGameState}
              />
            } 
          />
          <Route 
            path="/game/:roomCode" 
            element={
              <GamePlay 
                gameState={gameState}
                onSubmitAnswer={submitAnswer}
                onUseChaosCard={useChaosCard}
                onRevealAnswer={revealAnswer}
                onNextRound={nextRound}
              />
            } 
          />
        </Routes>
      </Router>
    </div>
  )
}

export default App

