import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
    this.reconnectDelay = 1000
    this.listeners = new Map()
    this.connectionCallbacks = []
    this.disconnectionCallbacks = []
  }

  connect() {
    try {
      // Determine the server URL
      const serverUrl = this.getServerUrl()
      console.log('🔗 Connecting to server:', serverUrl)

      // Disconnect existing connection if any
      if (this.socket) {
        this.socket.disconnect()
      }

      // Create new socket connection with robust configuration
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
        timeout: 10000, // 10 second timeout
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        maxHttpBufferSize: 1e6, // 1MB buffer
        pingTimeout: 60000, // 60 seconds
        pingInterval: 25000, // 25 seconds
        forceNew: true, // Force new connection
        upgrade: true,
        rememberUpgrade: true
      })

      this.setupEventListeners()
      
    } catch (error) {
      console.error('❌ Socket connection error:', error)
      this.handleConnectionError(error)
    }
  }

  getServerUrl() {
    // Determine server URL based on environment
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
      const host = window.location.host
      
      // For development
      if (host.includes('localhost') || host.includes('127.0.0.1')) {
        return `${protocol}//${host}`
      }
      
      // For production (same origin)
      return `${protocol}//${host}`
    }
    
    // Fallback
    return process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:5000'
  }

  setupEventListeners() {
    if (!this.socket) return

    // Connection successful
    this.socket.on('connect', () => {
      console.log('✅ Connected to server successfully!')
      this.isConnected = true
      this.reconnectAttempts = 0
      
      // Notify all connection callbacks
      this.connectionCallbacks.forEach(callback => {
        try {
          callback({ connected: true, socketId: this.socket.id })
        } catch (error) {
          console.error('Connection callback error:', error)
        }
      })
    })

    // Connection failed
    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection failed:', error)
      this.isConnected = false
      this.handleConnectionError(error)
    })

    // Disconnected
    this.socket.on('disconnect', (reason) => {
      console.warn('🔌 Disconnected from server:', reason)
      this.isConnected = false
      
      // Notify all disconnection callbacks
      this.disconnectionCallbacks.forEach(callback => {
        try {
          callback({ connected: false, reason })
        } catch (error) {
          console.error('Disconnection callback error:', error)
        }
      })

      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect - try to reconnect
        console.log('🔄 Server disconnected, attempting to reconnect...')
        setTimeout(() => this.connect(), 2000)
      }
    })

    // Reconnection attempt
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}`)
      this.reconnectAttempts = attemptNumber
    })

    // Reconnection successful
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected successfully after ${attemptNumber} attempts`)
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    // Reconnection failed
    this.socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after maximum attempts')
      this.isConnected = false
      
      // Try manual reconnection after a delay
      setTimeout(() => {
        console.log('🔄 Attempting manual reconnection...')
        this.connect()
      }, 10000) // Wait 10 seconds before manual retry
    })

    // Ping/Pong for connection health
    this.socket.on('ping', () => {
      console.log('🏓 Ping received from server')
    })

    this.socket.on('pong', (latency) => {
      console.log(`🏓 Pong - Latency: ${latency}ms`)
    })

    // Re-register all existing listeners
    this.listeners.forEach((callback, event) => {
      this.socket.on(event, callback)
    })
  }

  handleConnectionError(error) {
    console.error('🚨 Socket connection error:', error)
    
    // Notify disconnection callbacks
    this.disconnectionCallbacks.forEach(callback => {
      try {
        callback({ connected: false, error: error.message })
      } catch (err) {
        console.error('Error callback error:', err)
      }
    })
  }

  // Enhanced event listener with automatic re-registration
  on(event, callback) {
    try {
      // Store the listener for re-registration on reconnect
      this.listeners.set(event, callback)
      
      if (this.socket) {
        this.socket.on(event, callback)
      }
    } catch (error) {
      console.error(`Error registering listener for ${event}:`, error)
    }
  }

  // Remove event listener
  off(event, callback) {
    try {
      this.listeners.delete(event)
      
      if (this.socket) {
        this.socket.off(event, callback)
      }
    } catch (error) {
      console.error(`Error removing listener for ${event}:`, error)
    }
  }

  // Enhanced emit with error handling and retry
  emit(event, data, callback) {
    try {
      if (!this.socket || !this.isConnected) {
        console.warn(`⚠️ Cannot emit ${event} - not connected. Attempting to reconnect...`)
        this.connect()
        
        // Retry after connection attempt
        setTimeout(() => {
          if (this.socket && this.isConnected) {
            this.socket.emit(event, data, callback)
          } else {
            console.error(`❌ Failed to emit ${event} - still not connected`)
            if (callback) callback({ error: 'Not connected to server' })
          }
        }, 2000)
        return
      }

      console.log(`📤 Emitting ${event}:`, data)
      this.socket.emit(event, data, callback)
      
    } catch (error) {
      console.error(`Error emitting ${event}:`, error)
      if (callback) callback({ error: error.message })
    }
  }

  // Connection status callbacks
  onConnect(callback) {
    this.connectionCallbacks.push(callback)
    
    // If already connected, call immediately
    if (this.isConnected) {
      callback({ connected: true, socketId: this.socket?.id })
    }
  }

  onDisconnect(callback) {
    this.disconnectionCallbacks.push(callback)
  }

  // Game-specific methods with enhanced error handling
  createRoom(playerName) {
    this.emit('create_room', { player_name: playerName }, (response) => {
      if (response?.error) {
        console.error('Create room error:', response.error)
      }
    })
  }

  joinRoom(roomCode, playerName) {
    this.emit('join_room', { 
      room_code: roomCode, 
      player_name: playerName 
    }, (response) => {
      if (response?.error) {
        console.error('Join room error:', response.error)
      }
    })
  }

  startGame(roomCode, settings) {
    this.emit('start_game', { 
      room_code: roomCode, 
      settings 
    }, (response) => {
      if (response?.error) {
        console.error('Start game error:', response.error)
      }
    })
  }

  submitAnswer(roomCode, answerData) {
    this.emit('submit_answer', { 
      room_code: roomCode, 
      answer_data: answerData 
    }, (response) => {
      if (response?.error) {
        console.error('Submit answer error:', response.error)
      }
    })
  }

  useChaosCard(roomCode, cardType) {
    this.emit('use_chaos_card', { 
      room_code: roomCode, 
      card_type: cardType 
    })
  }

  revealAnswer(roomCode) {
    this.emit('reveal_answer', { room_code: roomCode })
  }

  nextRound(roomCode) {
    this.emit('next_round', { room_code: roomCode })
  }

  leaveRoom(roomCode) {
    this.emit('leave_room', { room_code: roomCode })
  }

  // Force reconnection
  forceReconnect() {
    console.log('🔄 Forcing reconnection...')
    if (this.socket) {
      this.socket.disconnect()
    }
    setTimeout(() => this.connect(), 1000)
  }

  // Disconnect cleanly
  disconnect() {
    try {
      console.log('🔌 Disconnecting from server...')
      this.isConnected = false
      
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }
      
      // Clear listeners
      this.listeners.clear()
      this.connectionCallbacks = []
      this.disconnectionCallbacks = []
      
    } catch (error) {
      console.error('Error during disconnect:', error)
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      transport: this.socket?.io?.engine?.transport?.name
    }
  }

  // Health check
  healthCheck() {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve({ healthy: false, reason: 'Not connected' })
        return
      }

      const timeout = setTimeout(() => {
        resolve({ healthy: false, reason: 'Timeout' })
      }, 5000)

      this.socket.emit('ping', Date.now(), (response) => {
        clearTimeout(timeout)
        resolve({ 
          healthy: true, 
          latency: Date.now() - response,
          socketId: this.socket.id
        })
      })
    })
  }
}

// Create singleton instance
const socketService = new SocketService()

export default socketService

