import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Gamepad2, 
  Zap, 
  Crown,
  Heart,
  Target,
  Sparkles
} from 'lucide-react'

const LandingPage = ({ onCreateRoom, onJoinRoom, connected, connectionStatus }) => {
  const [createPlayerName, setCreatePlayerName] = useState('')
  const [joinPlayerName, setJoinPlayerName] = useState('')
  const [joinRoomCode, setJoinRoomCode] = useState('')

  const handleCreateRoom = () => {
    if (!createPlayerName.trim()) {
      alert('Please enter your name')
      return
    }
    if (!connected) {
      alert('Not connected to server. Please wait for connection.')
      return
    }
    onCreateRoom(createPlayerName.trim())
  }

  const handleJoinRoom = () => {
    if (!joinPlayerName.trim()) {
      alert('Please enter your name')
      return
    }
    if (!joinRoomCode.trim()) {
      alert('Please enter a room code')
      return
    }
    if (!connected) {
      alert('Not connected to server. Please wait for connection.')
      return
    }
    onJoinRoom(joinRoomCode.trim().toUpperCase(), joinPlayerName.trim())
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Crown className="w-12 h-12 text-yellow-400" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Roast Royale
            </h1>
            <Crown className="w-12 h-12 text-yellow-400" />
          </div>
          
          <p className="text-xl text-white/80 font-medium">
            Think you know your friends? Think again.
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge className="bg-red-500/20 text-red-300 border-red-500/30 px-3 py-1">
              <Heart className="w-4 h-4 mr-1" />
              Multiple Choice Questions
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
              <Sparkles className="w-4 h-4 mr-1" />
              Trending Topics
            </Badge>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
              <Target className="w-4 h-4 mr-1" />
              Perfect for Streamers
            </Badge>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Room */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white text-2xl">Create Room</CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Start a new game and invite your friends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter your name"
                value={createPlayerName}
                onChange={(e) => setCreatePlayerName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg py-3"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
              />
              <Button
                onClick={handleCreateRoom}
                disabled={!connected || !createPlayerName.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Users className="w-5 h-5 mr-2" />
                Create Game Room
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white text-2xl">Join Room</CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Enter a room code to join an existing game
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter your name"
                value={joinPlayerName}
                onChange={(e) => setJoinPlayerName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg py-3"
              />
              <Input
                placeholder="Room code (e.g. ABC123)"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg py-3 font-mono"
                maxLength={6}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <Button
                onClick={handleJoinRoom}
                disabled={!connected || !joinPlayerName.trim() || !joinRoomCode.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Target className="w-5 h-5 mr-2" />
                Join Game
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Game Modes */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">Game Modes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl">1v1</div>
                <div className="text-white/70">Intense duels</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">2v2</div>
                <div className="text-white/70">Couple's therapy</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">3v3</div>
                <div className="text-white/70">Squad goals</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">4v4</div>
                <div className="text-white/70">Crew battles</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">5v5</div>
                <div className="text-white/70">Army warfare</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">FFA</div>
                <div className="text-white/70">Pure chaos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Battles */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">Team Battles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 text-center text-lg">
              1v1 to 5v5 epic showdowns
            </p>
          </CardContent>
        </Card>

        {/* Chaos Cards */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Chaos Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 text-center text-lg">
              Power-ups that change everything
            </p>
          </CardContent>
        </Card>

        {/* Connection Status */}
        {!connected && (
          <div className="text-center">
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-4 py-2">
              {connectionStatus === 'connecting' ? 'Connecting to server...' : 'Connection issues'}
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingPage

