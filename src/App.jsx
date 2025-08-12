import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import GameLobby from './components/GameLobby'
import TeamFormation from './components/TeamFormation'
import GamePlay from './components/GamePlay'
import socketService from './services/socket'
import './App.css'

function App() {
  const [gameState, setGameState] = useState({
    playerName: '',
    roomCode: '',
    isConnected: false,
    connectionError: null,
    roomData: null,
    gameData: null
  })

  useEffect(() => {
    // Connect to backend when app loads
    socketService.connect()

    // Set up socket event listeners
    socketService.on('connection_status', (data) => {
      setGameState(prev => ({
        ...prev,
        isConnected: data.connected,
        connectionError: data.connected ? null : 'Disconnected from server'
      }))
    })

    socketService.on('connection_error', (error) => {
      setGameState(prev => ({
        ...prev,
        isConnected: false,
        connectionError: 'Failed to connect to server'
      }))
    })

    socketService.on('room_created', (data) => {
      setGameState(prev => ({
        ...prev,
        roomCode: data.room_code,
        roomData: data.room_data
      }))
    })

    socketService.on('room_updated', (data) => {
      setGameState(prev => ({
        ...prev,
        roomData: data
      }))
    })

    socketService.on('join_success', (data) => {
      console.log('Successfully joined room:', data)
    })

    socketService.on('join_error', (data) => {
      alert('Failed to join room: ' + data.message)
    })

    socketService.on('game_started', (data) => {
      setGameState(prev => ({
        ...prev,
        gameData: data
      }))
    })

    socketService.on('game_state_updated', (data) => {
      setGameState(prev => ({
        ...prev,
        gameData: data
      }))
    })

    socketService.on('round_started', (data) => {
      setGameState(prev => ({
        ...prev,
        gameData: data
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
    updateGameState({ playerName })
    socketService.createRoom(playerName)
  }

  const joinRoom = (roomCode, playerName) => {
    updateGameState({ playerName, roomCode })
    socketService.joinRoom(roomCode, playerName)
  }

  const startGame = (settings) => {
    socketService.startGame(gameState.roomCode, settings)
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
                onStartGame={startGame}
              />
            } 
          />
          <Route 
            path="/play/:roomCode" 
            element={
              <GamePlay 
                gameState={gameState} 
                updateGameState={updateGameState}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App

