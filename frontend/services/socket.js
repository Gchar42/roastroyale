import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
  }

  connect(serverUrl = window.location.origin) {
    if (this.socket) {
      this.disconnect()
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id)
      this.isConnected = true
      this.emit('connection_status', { connected: true, id: this.socket.id })
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.isConnected = false
      this.emit('connection_status', { connected: false })
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      this.emit('connection_error', error)
    })

    // Game event listeners
    this.setupGameListeners()

    return this.socket
  }

  setupGameListeners() {
    if (!this.socket) return

    // Room events
    this.socket.on('room_created', (data) => {
      console.log('Room created:', data)
      this.emit('room_created', data)
    })

    this.socket.on('room_updated', (data) => {
      console.log('Room updated:', data)
      this.emit('room_updated', data)
    })

    this.socket.on('join_success', (data) => {
      console.log('Join success:', data)
      this.emit('join_success', data)
    })

    this.socket.on('join_error', (data) => {
      console.error('Join error:', data)
      this.emit('join_error', data)
    })

    // Game events
    this.socket.on('game_started', (data) => {
      console.log('Game started:', data)
      this.emit('game_started', data)
    })

    this.socket.on('game_state_updated', (data) => {
      console.log('Game state updated:', data)
      this.emit('game_state_updated', data)
    })

    this.socket.on('round_started', (data) => {
      console.log('Round started:', data)
      this.emit('round_started', data)
    })

    this.socket.on('answer_submitted', (data) => {
      console.log('Answer submitted:', data)
      this.emit('answer_submitted', data)
    })

    this.socket.on('answer_revealed', (data) => {
      console.log('Answer revealed:', data)
      this.emit('answer_revealed', data)
    })

    this.socket.on('power_up_used', (data) => {
      console.log('Power-up used:', data)
      this.emit('power_up_used', data)
    })

    // Error events
    this.socket.on('start_error', (data) => {
      console.error('Start error:', data)
      this.emit('start_error', data)
    })

    this.socket.on('submit_error', (data) => {
      console.error('Submit error:', data)
      this.emit('submit_error', data)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data))
    }
  }

  // Game actions
  createRoom(playerName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('create_room', { player_name: playerName })
    }
  }

  joinRoom(roomCode, playerName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', { room_code: roomCode, player_name: playerName })
    }
  }

  startGame(roomCode, settings = {}) {
    if (this.socket && this.isConnected) {
      this.socket.emit('start_game', { room_code: roomCode, settings })
    }
  }

  submitAnswer(roomCode, answer) {
    if (this.socket && this.isConnected) {
      this.socket.emit('submit_answer', { room_code: roomCode, answer })
    }
  }

  usePowerUp(roomCode, powerUpId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('use_power_up', { room_code: roomCode, power_up_id: powerUpId })
    }
  }

  revealAnswer(roomCode, answerIndex) {
    if (this.socket && this.isConnected) {
      this.socket.emit('reveal_answer', { room_code: roomCode, answer_index: answerIndex })
    }
  }

  nextRound(roomCode) {
    if (this.socket && this.isConnected) {
      this.socket.emit('next_round', { room_code: roomCode })
    }
  }
}

// Create singleton instance
const socketService = new SocketService()

export default socketService

