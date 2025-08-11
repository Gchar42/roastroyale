import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Copy, Users, Settings, Play, Crown, UserPlus, Share2, Gamepad2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const GameLobby = ({ gameState, updateGameState }) => {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const [gameMode, setGameMode] = useState('2v2')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [copied, setCopied] = useState(false)
  
  // Mock players for demo - in real app this would come from WebSocket
  const [players, setPlayers] = useState([
    { id: 1, name: gameState.playerName || 'You', isHost: true, avatar: '👑' },
    { id: 2, name: 'Alex_Gaming', isHost: false, avatar: '🎮' },
    { id: 3, name: 'MemeLord420', isHost: false, avatar: '😂' },
  ])

  const gameModes = [
    { value: '1v1', label: '1v1 Duel', players: 2, description: 'Intense head-to-head' },
    { value: '2v2', label: '2v2 Teams', players: 4, description: 'Perfect for couples' },
    { value: '3v3', label: '3v3 Squad', players: 6, description: 'Balanced strategy' },
    { value: '4v4', label: '4v4 Crew', players: 8, description: 'Large group fun' },
    { value: '5v5', label: '5v5 Army', players: 10, description: 'Maximum chaos' },
    { value: 'ffa', label: 'Free For All', players: 8, description: 'Every player for themselves' }
  ]

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareRoom = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join my Roast Royale game!',
        text: `Room code: ${roomCode}`,
        url: window.location.href
      })
    } else {
      copyRoomCode()
    }
  }

  const handleGameModeChange = (mode) => {
    setGameMode(mode)
    const selectedMode = gameModes.find(m => m.value === mode)
    setMaxPlayers(selectedMode.players)
  }

  const startGame = () => {
    updateGameState({
      gameMode,
      maxPlayers,
      players,
      gamePhase: 'teams'
    })
    navigate(`/teams/${roomCode}`)
  }

  const isHost = players.find(p => p.name === gameState.playerName)?.isHost

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Game Lobby
          </h1>
          
          <div className="flex items-center justify-center space-x-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="flex items-center space-x-2 p-4">
                <span className="text-white/70">Room Code:</span>
                <span className="text-2xl font-mono font-bold text-white">{roomCode}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyRoomCode}
                  className="text-white hover:bg-white/20"
                >
                  {copied ? '✓' : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareRoom}
                  className="text-white hover:bg-white/20"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Players List */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-6 h-6 text-blue-400" />
                  <span>Players ({players.length}/{maxPlayers})</span>
                </CardTitle>
                <CardDescription className="text-white/70">
                  Waiting for more players to join...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence>
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-2xl">{player.avatar}</span>
                      <span className="flex-1 font-medium">{player.name}</span>
                      {player.isHost && (
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Crown className="w-3 h-3 mr-1" />
                          Host
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {players.length < maxPlayers && (
                  <motion.div
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border-2 border-dashed border-white/20"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <UserPlus className="w-6 h-6 text-white/50" />
                    <span className="text-white/50">Waiting for players...</span>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Game Settings */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-6 h-6 text-green-400" />
                  <span>Game Settings</span>
                </CardTitle>
                <CardDescription className="text-white/70">
                  {isHost ? 'Configure the game mode' : 'Host is configuring the game'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Game Mode</label>
                  <Select 
                    value={gameMode} 
                    onValueChange={handleGameModeChange}
                    disabled={!isHost}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {gameModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value} className="text-white hover:bg-gray-800">
                          <div>
                            <div className="font-medium">{mode.label}</div>
                            <div className="text-xs text-gray-400">{mode.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-white/20" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Max Players</span>
                    <span className="text-white font-medium">{maxPlayers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Current Players</span>
                    <span className="text-white font-medium">{players.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Ready to Start</span>
                    <span className={`font-medium ${players.length >= 2 ? 'text-green-400' : 'text-red-400'}`}>
                      {players.length >= 2 ? 'Yes' : 'Need more players'}
                    </span>
                  </div>
                </div>

                <Separator className="bg-white/20" />

                <div className="space-y-2">
                  <h4 className="font-medium text-white">Game Features</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                      Chaos Cards ✨
                    </Badge>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                      Roast Mode 🔥
                    </Badge>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                      Viral Clips 📹
                    </Badge>
                    <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                      Trending Topics 📈
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Start Game Button */}
        {isHost && (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={startGame}
              disabled={players.length < 2}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-8 py-4 text-lg"
            >
              <Play className="w-6 h-6 mr-2" />
              Start Game
            </Button>
            {players.length < 2 && (
              <p className="text-white/60 text-sm mt-2">
                Need at least 2 players to start
              </p>
            )}
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div 
          className="text-center text-white/60 text-sm space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>Share the room code with your friends to get them in the game!</p>
          <p>Perfect for Discord voice chats, Twitch streams, or party nights 🎉</p>
        </motion.div>
      </div>
    </div>
  )
}

export default GameLobby

