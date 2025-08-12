import { useState, useEffect } from 'react'
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

const GameLobby = ({ gameState, onStartGame, updateGameState }) => {
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

  // Get real player data - NO FAKE PLAYERS
  const realPlayers = gameState.roomData?.players || []
  const currentPlayers = realPlayers.length
  const roomCodeDisplay = roomCode || gameState.roomCode
  const playerSid = gameState.socketId || 'unknown'
  const isHost = realPlayers.find(p => p.sid === playerSid)?.is_host || false

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

  const handleBackToHome = () => {
    navigate('/')
  }

  const handleStartGame = () => {
    if (currentPlayers < 2) {
      alert('Need at least 2 players to start the game!')
      return
    }
    
    const gameSettings = {
      gameMode,
      maxPlayers,
      ...settings
    }
    onStartGame(gameSettings)
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const gameModeOptions = [
    { value: '1v1', label: '1v1 Teams', description: 'Intense duels', maxPlayers: 2 },
    { value: '2v2', label: '2v2 Teams', description: 'Perfect for couples', maxPlayers: 4 },
    { value: '3v3', label: '3v3 Teams', description: 'Squad goals', maxPlayers: 6 },
    { value: '4v4', label: '4v4 Teams', description: 'Crew battles', maxPlayers: 8 },
    { value: '5v5', label: '5v5 Teams', description: 'Army warfare', maxPlayers: 10 },
    { value: 'ffa', label: 'Free For All', description: 'Pure chaos', maxPlayers: 10 }
  ]

  const selectedGameMode = gameModeOptions.find(mode => mode.value === gameMode)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Back Button */}
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
          variant={gameState.isConnected ? "default" : "destructive"}
          className={gameState.isConnected ? "bg-green-500 text-white" : "bg-red-500 text-white"}
        >
          {gameState.isConnected ? "Connected ✓" : "Disconnected ✗"}
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
                  className="text-white hover:bg-white/10"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Players Section - ONLY REAL PLAYERS */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Players ({currentPlayers}/{selectedGameMode?.maxPlayers || 10})
                </CardTitle>
                <CardDescription className="text-white/70">
                  {currentPlayers < 2 ? 'Waiting for more players to join...' : 'Ready to start!'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* ONLY SHOW REAL PLAYERS */}
                {realPlayers.map((player, index) => (
                  <motion.div
                    key={player.sid}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <span className="text-2xl">
                      {player.is_host ? '👑' : '🎮'}
                    </span>
                    <span className="text-white font-medium flex-1">
                      {player.name}
                    </span>
                    {player.is_host && (
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        Host
                      </Badge>
                    )}
                  </motion.div>
                ))}

                {/* Show message if waiting for players */}
                {currentPlayers < 2 && (
                  <div className="text-center py-8">
                    <div className="text-white/50 text-lg">
                      Share the room code with your friends to get them in the game!
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Game Settings */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Game Settings
                </CardTitle>
                <CardDescription className="text-white/70">
                  Configure the game mode
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Game Mode Selection */}
                <div className="space-y-2">
                  <Label className="text-white">Game Mode</Label>
                  <Select value={gameMode} onValueChange={setGameMode} disabled={!isHost}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gameModeOptions.map(mode => (
                        <SelectItem key={mode.value} value={mode.value}>
                          <div>
                            <div className="font-medium">{mode.label}</div>
                            <div className="text-sm text-muted-foreground">{mode.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-white/60">
                    Max Players: {selectedGameMode?.maxPlayers || 10} | Current Players: {currentPlayers}
                    {currentPlayers > (selectedGameMode?.maxPlayers || 10) && (
                      <span className="text-red-400 ml-2">Too many players for this mode!</span>
                    )}
                  </div>
                </div>

                {/* Game Features */}
                <div className="space-y-4">
                  <Label className="text-white">Game Features</Label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-white">Chaos Cards</span>
                      </div>
                      <Switch 
                        checked={settings.chaosCards}
                        onCheckedChange={(checked) => handleSettingChange('chaosCards', checked)}
                        disabled={!isHost}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-red-400" />
                        <span className="text-white">Roast Mode</span>
                      </div>
                      <Switch 
                        checked={settings.roastMode}
                        onCheckedChange={(checked) => handleSettingChange('roastMode', checked)}
                        disabled={!isHost}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-green-400" />
                        <span className="text-white">Viral Clips</span>
                      </div>
                      <Switch 
                        checked={settings.viralClips}
                        onCheckedChange={(checked) => handleSettingChange('viralClips', checked)}
                        disabled={!isHost}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-white">Trending Topics</span>
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
          className="flex justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button
            onClick={handleStartGame}
            disabled={!isHost || currentPlayers < 2 || currentPlayers > (selectedGameMode?.maxPlayers || 10)}
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Game
          </Button>
          {!isHost && (
            <p className="text-white/60 mt-2 text-center">
              Waiting for host to start the game...
            </p>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-white/60">
            Share the room code with your friends to get them in the game!
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default GameLobby

