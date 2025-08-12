import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Users, 
  Settings, 
  Play, 
  Copy, 
  Check, 
  Crown, 
  ArrowLeft, 
  Home,
  Gamepad2,
  Zap,
  MessageCircle,
  TrendingUp,
  Video
} from 'lucide-react'
import { motion } from 'framer-motion'

const GameLobby = ({ gameState, onStartGame, onUpdateSettings, socket }) => {
  const navigate = useNavigate()
  const { roomCode } = useParams()
  const [copied, setCopied] = useState(false)
  const [gameMode, setGameMode] = useState('2v2')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [settings, setSettings] = useState({
    chaosCards: true,
    roastMode: true,
    viralClips: true,
    trendingTopics: true
  })

  const isHost = gameState.roomData?.players?.find(p => p.sid === socket?.id)?.is_host
  const currentPlayers = gameState.roomData?.players?.length || 0
  const roomCodeDisplay = roomCode || gameState.roomCode

  useEffect(() => {
    if (gameState.gameStarted) {
      navigate(`/game/${roomCodeDisplay}`)
    }
  }, [gameState.gameStarted, roomCodeDisplay, navigate])

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCodeDisplay)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy room code:', err)
    }
  }

  const handleStartGame = () => {
    const gameSettings = {
      game_mode: gameMode,
      max_players: maxPlayers,
      ...settings
    }
    onStartGame(gameSettings)
  }

  const handleBackToHome = () => {
    // Disconnect from current room and go back to home
    if (socket) {
      socket.disconnect()
    }
    navigate('/')
    window.location.reload()
  }

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    if (onUpdateSettings) {
      onUpdateSettings(newSettings)
    }
  }

  const gameModeOptions = [
    { value: '1v1', label: '1v1 Teams', description: 'Intense duels', maxPlayers: 2 },
    { value: '2v2', label: '2v2 Teams', description: 'Perfect for couples', maxPlayers: 4 },
    { value: '3v3', label: '3v3 Teams', description: 'Squad goals', maxPlayers: 6 },
    { value: '4v4', label: '4v4 Teams', description: 'Crew battles', maxPlayers: 8 },
    { value: '5v5', label: '5v5 Teams', description: 'Army warfare', maxPlayers: 10 },
    { value: 'ffa', label: 'Free For All', description: 'Pure chaos', maxPlayers: 8 }
  ]

  const selectedGameMode = gameModeOptions.find(mode => mode.value === gameMode)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Navigation */}
      <motion.div 
        className="absolute top-4 left-4 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackToHome}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Leave Game
        </Button>
      </motion.div>

      {/* Connection Status */}
      <motion.div 
        className="absolute top-4 right-4 z-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Badge 
          variant={gameState.connected ? "default" : "destructive"}
          className={gameState.connected ? "bg-green-500 text-white" : "bg-red-500 text-white"}
        >
          {gameState.connected ? "Connected ✓" : "Disconnected ✗"}
        </Badge>
      </motion.div>

      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
            Game Lobby
          </h1>
          
          {/* Room Code Display */}
          <div className="flex items-center justify-center gap-3">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-white/70">Room Code:</span>
                <span className="text-2xl font-bold text-white font-mono tracking-wider">
                  {roomCodeDisplay}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyRoomCode}
                  className="text-white hover:bg-white/20"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Players Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Players ({currentPlayers}/{maxPlayers})
                </CardTitle>
                <CardDescription className="text-white/70">
                  Waiting for more players to join...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {gameState.roomData?.players?.map((player, index) => (
                  <motion.div
                    key={player.sid}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <span className="text-2xl">{player.avatar}</span>
                    <span className="text-white font-medium flex-1">{player.name}</span>
                    {player.is_host && (
                      <Badge className="bg-yellow-500 text-black">
                        <Crown className="w-3 h-3 mr-1" />
                        Host
                      </Badge>
                    )}
                  </motion.div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: maxPlayers - currentPlayers }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 border-dashed opacity-50"
                  >
                    <span className="text-2xl">👤</span>
                    <span className="text-white/50 font-medium">Waiting for players...</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Game Settings */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Game Settings
                </CardTitle>
                <CardDescription className="text-white/70">
                  Configure the game mode
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Game Mode Selection */}
                <div className="space-y-3">
                  <Label className="text-white font-medium">Game Mode</Label>
                  <Select 
                    value={gameMode} 
                    onValueChange={(value) => {
                      setGameMode(value)
                      const mode = gameModeOptions.find(m => m.value === value)
                      if (mode) {
                        setMaxPlayers(mode.maxPlayers)
                      }
                    }}
                    disabled={!isHost}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gameModeOptions.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{mode.label}</span>
                            <span className="text-sm text-muted-foreground">{mode.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedGameMode && (
                    <div className="text-sm text-white/70 bg-white/5 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>Max Players:</span>
                        <span className="font-medium text-white">{selectedGameMode.maxPlayers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Players:</span>
                        <span className={`font-medium ${currentPlayers >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {currentPlayers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ready to Start:</span>
                        <span className={`font-medium ${currentPlayers >= 2 ? 'text-green-400' : 'text-red-400'}`}>
                          {currentPlayers >= 2 ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Game Features */}
                <div className="space-y-4">
                  <Label className="text-white font-medium">Game Features</Label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-sm">Chaos Cards</span>
                      </div>
                      <Switch
                        checked={settings.chaosCards}
                        onCheckedChange={(checked) => handleSettingChange('chaosCards', checked)}
                        disabled={!isHost}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-pink-400" />
                        <span className="text-white text-sm">Roast Mode</span>
                      </div>
                      <Switch
                        checked={settings.roastMode}
                        onCheckedChange={(checked) => handleSettingChange('roastMode', checked)}
                        disabled={!isHost}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-green-400" />
                        <span className="text-white text-sm">Viral Clips</span>
                      </div>
                      <Switch
                        checked={settings.viralClips}
                        onCheckedChange={(checked) => handleSettingChange('viralClips', checked)}
                        disabled={!isHost}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-sm">Trending Topics</span>
                      </div>
                      <Switch
                        checked={settings.trendingTopics}
                        onCheckedChange={(checked) => handleSettingChange('trendingTopics', checked)}
                        disabled={!isHost}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Start Game Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button
            onClick={handleStartGame}
            disabled={!isHost || currentPlayers < 2}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold px-8 py-4 text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Game
          </Button>
          
          {!isHost && (
            <p className="text-white/70 text-sm mt-2">
              Waiting for host to start the game...
            </p>
          )}
          
          {isHost && currentPlayers < 2 && (
            <p className="text-yellow-400 text-sm mt-2">
              Need at least 2 players to start
            </p>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          className="text-center text-white/70 space-y-2 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-lg font-medium text-white">
            Share the room code with your friends to get them in the game!
          </p>
          <p>Perfect for Discord voice chats, Twitch streams, or party nights 🎉</p>
        </motion.div>
      </div>
    </div>
  )
}

export default GameLobby

