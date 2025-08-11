import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Users, Gamepad2, Zap, MessageCircle, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

const LandingPage = ({ gameState, onCreateRoom, onJoinRoom }) => {
  const navigate = useNavigate()
  const [createName, setCreateName] = useState('')
  const [joinName, setJoinName] = useState('')
  const [joinCode, setJoinCode] = useState('')

  // Navigate to lobby when room is created
  useEffect(() => {
    if (gameState.roomCode && gameState.roomData) {
      navigate(`/lobby/${gameState.roomCode}`)
    }
  }, [gameState.roomCode, gameState.roomData, navigate])

  const handleCreateRoom = () => {
    if (createName.trim()) {
      onCreateRoom(createName.trim())
    }
  }

  const handleJoinRoom = () => {
    if (joinName.trim() && joinCode.trim()) {
      onJoinRoom(joinCode.trim().toUpperCase(), joinName.trim())
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
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
          
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
              🎯 Family Feud meets Cards Against Humanity
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
              ✨ Trending memes & viral content
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
              📺 Perfect for streamers
            </Badge>
          </div>
        </motion.div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Room */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-400">
                  <UserPlus className="w-6 h-6" />
                  <span>Create Room</span>
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
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                />
                <Button
                  onClick={handleCreateRoom}
                  disabled={!createName.trim() || !gameState.isConnected}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
                >
                  Create Game Room
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Join Room */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-400">
                  <Users className="w-6 h-6" />
                  <span>Join Room</span>
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
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                />
                <Input
                  placeholder="Room code (e.g. ABC123)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
                <Button
                  onClick={handleJoinRoom}
                  disabled={!joinName.trim() || !joinCode.trim() || !gameState.isConnected}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold"
                >
                  Join Game
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
          <h2 className="text-3xl font-bold text-white">Game Modes</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { mode: '1v1', desc: 'Intense duels', color: 'bg-red-500' },
              { mode: '2v2', desc: "Couple's therapy", color: 'bg-orange-500' },
              { mode: '3v3', desc: 'Squad goals', color: 'bg-yellow-500' },
              { mode: '4v4', desc: 'Crew battles', color: 'bg-green-500' },
              { mode: '5v5', desc: 'Army warfare', color: 'bg-blue-500' },
              { mode: 'FFA', desc: 'Pure chaos', color: 'bg-purple-500' }
            ].map((item, index) => (
              <motion.div
                key={item.mode}
                className={`${item.color} text-white px-4 py-2 rounded-full font-bold`}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <div className="text-lg">{item.mode}</div>
                <div className="text-xs opacity-80">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {[
            {
              icon: <Users className="w-8 h-8 text-yellow-400" />,
              title: "Team Battles",
              desc: "1v1 to 5v5 epic showdowns"
            },
            {
              icon: <Zap className="w-8 h-8 text-yellow-400" />,
              title: "Chaos Cards",
              desc: "Power-ups that change everything"
            },
            {
              icon: <MessageCircle className="w-8 h-8 text-yellow-400" />,
              title: "Roast Mode",
              desc: "Friendly fire encouraged"
            },
            {
              icon: <Trophy className="w-8 h-8 text-yellow-400" />,
              title: "Viral Moments",
              desc: "Clip-worthy content guaranteed"
            }
          ].map((feature, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 text-white text-center">
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="font-bold text-lg">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center text-white/80 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <p className="text-lg">Perfect for Discord friend groups, Twitch streamers, and party nights</p>
          <p className="text-2xl">Get ready to discover who really knows who! 🔥</p>
        </motion.div>
      </div>
    </div>
  )
}

export default LandingPage

