import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Users, 
  Crown, 
  ArrowLeft, 
  Play,
  Copy,
  Check,
  Settings,
  Zap,
  Target,
  Timer
} from 'lucide-react'
import socketService from '@/services/socket'

const GameLobby = ({ roomData, isHost, onStartGame, onBackToHome, connected }) => {
  const [copied, setCopied] = useState(false)
  const [gameSettings, setGameSettings] = useState({
    rounds: 5,
    timePerQuestion: 30,
    chaosCardsEnabled: true,
    roastModeEnabled: true
  })

  // Safe access to room data
  const roomCode = roomData?.room_code || ''
  const players = roomData?.players || []
  const hostPlayer = players.find(p => p.is_host)
  const currentSocketId = socketService.socket?.id
  const currentPlayer = players.find(p => p.sid === currentSocketId)
  const isCurrentUserHost = currentPlayer?.is_host || false
  const canStartGame = isCurrentUserHost && players.length >= 2

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = roomCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleStartGame = () => {
    if (!canStartGame) {
      if (!isCurrentUserHost) {
        alert('Only the host can start the game.')
      } else if (players.length < 2) {
        alert('Need at least 2 players to start the game.')
      }
      return
    }
    
    onStartGame(gameSettings)
  }

  const handleSettingChange = (setting, value) => {
    setGameSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToHome}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Leave Game
        </Button>
      </div>

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
            Game Lobby
          </h1>
          
          {/* Room Code */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-white/70">Room Code:</div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-2xl font-mono px-4 py-2">
                {roomCode}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={copyRoomCode}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Players */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Players ({players.length})
            </CardTitle>
            <CardDescription className="text-white/70">
              {hostPlayer ? `${hostPlayer.name} is the host` : 'Waiting for host...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {players.map((player) => (
                <div
                  key={player.sid}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {player.name}
                        {player.sid === currentSocketId && (
                          <Badge className="ml-2 bg-green-500/20 text-green-300 border-green-500/30">
                            You
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {player.is_host && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        <Crown className="w-3 h-3 mr-1" />
                        Host
                      </Badge>
                    )}
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              ))}
              
              {/* Placeholder for more players */}
              {players.length < 8 && (
                <div className="flex items-center justify-center p-3 bg-white/5 rounded-lg border border-white/10 border-dashed">
                  <div className="text-white/50">Waiting for more players...</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Settings - Only show for host */}
        {isCurrentUserHost && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Game Settings
              </CardTitle>
              <CardDescription className="text-white/70">
                Customize your game experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-white/70" />
                      <span className="text-white">Rounds: {gameSettings.rounds}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSettingChange('rounds', Math.max(3, gameSettings.rounds - 1))}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-8 h-8 p-0"
                      >
                        -
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSettingChange('rounds', Math.min(10, gameSettings.rounds + 1))}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-8 h-8 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-white/70" />
                      <span className="text-white">Time per question: {gameSettings.timePerQuestion}s</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSettingChange('timePerQuestion', Math.max(15, gameSettings.timePerQuestion - 5))}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-8 h-8 p-0"
                      >
                        -
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSettingChange('timePerQuestion', Math.min(60, gameSettings.timePerQuestion + 5))}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-8 h-8 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-white">Chaos Cards</span>
                    </div>
                    <Switch
                      checked={gameSettings.chaosCardsEnabled}
                      onCheckedChange={(checked) => handleSettingChange('chaosCardsEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-red-400" />
                      <span className="text-white">Roast Mode</span>
                    </div>
                    <Switch
                      checked={gameSettings.roastModeEnabled}
                      onCheckedChange={(checked) => handleSettingChange('roastModeEnabled', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start Game Button */}
        <div className="text-center space-y-4">
          {isCurrentUserHost ? (
            <Button
              onClick={handleStartGame}
              disabled={!canStartGame || !connected}
              size="lg"
              className={`font-bold py-4 px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-300 ${
                canStartGame && connected
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                  : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <Play className="w-5 h-5 mr-2" />
              Start the Roast Battle
            </Button>
          ) : (
            <div className="text-white/70 text-lg">
              Waiting for {hostPlayer?.name || 'host'} to start the game...
            </div>
          )}

          {!connected && (
            <div className="text-center">
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                Disconnected - Reconnecting...
              </Badge>
            </div>
          )}

          {players.length < 2 && (
            <div className="text-white/50 text-sm">
              Need at least 2 players to start the game
            </div>
          )}
        </div>

        {/* Instructions */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center text-white/70">
              <p className="text-lg mb-2">Share the room code with your friends!</p>
              <p className="text-sm">They can join by entering the code on the home page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default GameLobby

