import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Users, Gamepad2, Zap, MessageCircle, Trophy, Home, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

const LandingPage = ({ gameState, onCreateRoom, onJoinRoom }) => {
  const navigate = useNavigate()
  const [createName, setCreateName] = useState('')
  const [joinName, setJoinName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Navigate to lobby when room is created
  useEffect(() => {
    if (gameState.roomCode && gameState.roomData) {
      navigate(`/lobby/${gameState.roomCode}`)
    }
  }, [gameState.roomCode, gameState.roomData, navigate])

  const handleCreateRoom = async () => {
    if (createName.trim() && !isLoading) {
      setIsLoading(true)
      try {
        await onCreateRoom(createName.trim())
      } catch (error) {
        console.error('Error creating room:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleJoinRoom = async () => {
    if (joinName.trim() && joinCode.trim() && !isLoading) {
      setIsLoading(true)
      try {
        await onJoinRoom(joinCode.trim().toUpperCase(), joinName.trim())
      } catch (error) {
        console.error('Error joining room:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Back to Home Button - Always visible */}
      <motion.div 
        className="absolute top-4 left-4 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <Home className="w-4 h-4 mr-2" />
          Home
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
          className="text-center space-y-6"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            👑 Roast Royale 👑
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium">
            Think you know your friends? Think again.
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              🎯 Multiple Choice Questions
            </Badge>
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              ✨ Trending Topics
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              📺 Perfect for Streamers
            </Badge>
          </div>
        </motion.div>

        {/* Game Creation/Join Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Room Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-green-400" />
                  Create Room
                </CardTitle>
                <CardDescription className="text-white/70">
                  Start a new game and invite your friends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter your name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleCreateRoom)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  maxLength={20}
                />
                <Button 
                  onClick={handleCreateRoom}
                  disabled={!createName.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold"
                >
                  {isLoading ? "Creating..." : "Create Game Room"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Join Room Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Join Room
                </CardTitle>
                <CardDescription className="text-white/70">
                  Enter a room code to join an existing game
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter your name"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  maxLength={20}
                />
                <Input
                  placeholder="Room code (e.g. ABC123)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => handleKeyPress(e, handleJoinRoom)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  maxLength={6}
                />
                <Button 
                  onClick={handleJoinRoom}
                  disabled={!joinName.trim() || !joinCode.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                >
                  {isLoading ? "Joining..." : "Join Game"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Game Modes */}
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">Game Modes</h2>
          
          {/* Team Size Badges */}
          <div className="flex flex-wrap justify-center gap-3">
            <Badge className="bg-red-500 text-white px-4 py-2 text-sm font-bold">
              1v1 <span className="text-xs ml-1">Intense duels</span>
            </Badge>
            <Badge className="bg-orange-500 text-white px-4 py-2 text-sm font-bold">
              2v2 <span className="text-xs ml-1">Couple's therapy</span>
            </Badge>
            <Badge className="bg-yellow-500 text-white px-4 py-2 text-sm font-bold">
              3v3 <span className="text-xs ml-1">Squad goals</span>
            </Badge>
            <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-bold">
              4v4 <span className="text-xs ml-1">Crew battles</span>
            </Badge>
            <Badge className="bg-blue-500 text-white px-4 py-2 text-sm font-bold">
              5v5 <span className="text-xs ml-1">Army warfare</span>
            </Badge>
            <Badge className="bg-purple-500 text-white px-4 py-2 text-sm font-bold">
              FFA <span className="text-xs ml-1">Pure chaos</span>
            </Badge>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-center">
            <CardContent className="p-6">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Team Battles</h3>
              <p className="text-white/70 text-sm">1v1 to 5v5 epic showdowns</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-center">
            <CardContent className="p-6">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Chaos Cards</h3>
              <p className="text-white/70 text-sm">Power-ups that change everything</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-center">
            <CardContent className="p-6">
              <MessageCircle className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Multiple Choice</h3>
              <p className="text-white/70 text-sm">No more typing - just click!</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-center">
            <CardContent className="p-6">
              <Trophy className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Viral Moments</h3>
              <p className="text-white/70 text-sm">Clip-worthy content guaranteed</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center text-white/70 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <p>Perfect for Discord friend groups, Twitch streamers, and party nights</p>
          <p className="text-lg font-semibold text-white">
            Get ready to discover who really knows who! 🔥
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default LandingPage

