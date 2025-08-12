import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Shuffle, Play, Users, Crown, Sword, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TeamFormation = ({ gameState, updateGameState }) => {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  
  // Mock players - in real app this would come from gameState
  const [players] = useState([
    { id: 1, name: gameState.playerName || 'You', isHost: true, avatar: '👑' },
    { id: 2, name: 'Alex_Gaming', isHost: false, avatar: '🎮' },
    { id: 3, name: 'MemeLord420', isHost: false, avatar: '😂' },
    { id: 4, name: 'StreamQueen', isHost: false, avatar: '👸' },
  ])

  const [teams, setTeams] = useState({
    team1: { name: 'Team Chaos', color: 'bg-red-500', players: [] },
    team2: { name: 'Team Mayhem', color: 'bg-blue-500', players: [] }
  })

  const [teamNames, setTeamNames] = useState({
    team1: 'Team Chaos',
    team2: 'Team Mayhem'
  })

  const teamColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
    'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
  ]

  const funnyTeamNames = [
    'The Roast Masters', 'Chaos Agents', 'Meme Lords', 'Friendship Destroyers',
    'The Savage Squad', 'Viral Villains', 'Discord Demons', 'Stream Snipers',
    'The Cringe Crew', 'Toxic Legends', 'Salt Miners', 'Drama Queens',
    'The Trolls', 'Keyboard Warriors', 'Rage Quitters', 'The Memers'
  ]

  useEffect(() => {
    // Auto-assign players to teams initially
    autoAssignTeams()
  }, [])

  const autoAssignTeams = () => {
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5)
    const playersPerTeam = Math.ceil(shuffledPlayers.length / 2)
    
    const newTeams = {
      team1: {
        ...teams.team1,
        players: shuffledPlayers.slice(0, playersPerTeam)
      },
      team2: {
        ...teams.team2,
        players: shuffledPlayers.slice(playersPerTeam)
      }
    }
    
    setTeams(newTeams)
  }

  const randomizeTeamNames = () => {
    const shuffledNames = [...funnyTeamNames].sort(() => Math.random() - 0.5)
    setTeamNames({
      team1: shuffledNames[0],
      team2: shuffledNames[1]
    })
    setTeams(prev => ({
      team1: { ...prev.team1, name: shuffledNames[0] },
      team2: { ...prev.team2, name: shuffledNames[1] }
    }))
  }

  const updateTeamName = (teamKey, newName) => {
    setTeamNames(prev => ({ ...prev, [teamKey]: newName }))
    setTeams(prev => ({
      ...prev,
      [teamKey]: { ...prev[teamKey], name: newName }
    }))
  }

  const movePlayer = (playerId, fromTeam, toTeam) => {
    const player = teams[fromTeam].players.find(p => p.id === playerId)
    if (!player) return

    setTeams(prev => ({
      ...prev,
      [fromTeam]: {
        ...prev[fromTeam],
        players: prev[fromTeam].players.filter(p => p.id !== playerId)
      },
      [toTeam]: {
        ...prev[toTeam],
        players: [...prev[toTeam].players, player]
      }
    }))
  }

  const startGame = () => {
    updateGameState({
      teams,
      gamePhase: 'playing'
    })
    navigate(`/play/${roomCode}`)
  }

  const isHost = players.find(p => p.name === gameState.playerName)?.isHost
  const allTeamsHavePlayers = teams.team1.players.length > 0 && teams.team2.players.length > 0

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-6">
        {/* Header */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Team Formation
          </h1>
          <p className="text-white/80 text-lg">
            Time to pick sides! May the best team win... or at least survive the roasting 🔥
          </p>
          
          <div className="flex justify-center space-x-4">
            {isHost && (
              <>
                <Button
                  onClick={autoAssignTeams}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Shuffle Teams
                </Button>
                <Button
                  onClick={randomizeTeamNames}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Random Names
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Teams */}
        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(teams).map(([teamKey, team], index) => (
            <motion.div
              key={teamKey}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className={`bg-white/10 backdrop-blur-md border-white/20 text-white relative overflow-hidden`}>
                <div className={`absolute top-0 left-0 right-0 h-2 ${team.color}`} />
                
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {index === 0 ? <Sword className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                    <div className="flex-1">
                      {isHost ? (
                        <Input
                          value={teamNames[teamKey]}
                          onChange={(e) => updateTeamName(teamKey, e.target.value)}
                          className="bg-transparent border-none text-xl font-bold p-0 h-auto focus:ring-0"
                          placeholder="Team Name"
                        />
                      ) : (
                        <span className="text-xl font-bold">{team.name}</span>
                      )}
                    </div>
                    <Badge variant="secondary" className={`${team.color} text-white border-none`}>
                      {team.players.length} players
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    {index === 0 ? 'Ready to dominate!' : 'Prepared for battle!'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <AnimatePresence>
                    {team.players.map((player, playerIndex) => (
                      <motion.div
                        key={player.id}
                        className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: playerIndex * 0.1 }}
                        onClick={() => {
                          if (isHost) {
                            const otherTeam = teamKey === 'team1' ? 'team2' : 'team1'
                            movePlayer(player.id, teamKey, otherTeam)
                          }
                        }}
                      >
                        <span className="text-2xl">{player.avatar}</span>
                        <span className="flex-1 font-medium">{player.name}</span>
                        {player.isHost && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                        {isHost && (
                          <span className="text-xs text-white/50">Click to move</span>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {team.players.length === 0 && (
                    <motion.div
                      className="flex items-center justify-center p-8 border-2 border-dashed border-white/20 rounded-lg"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="text-center text-white/50">
                        <Users className="w-8 h-8 mx-auto mb-2" />
                        <p>No players assigned</p>
                        <p className="text-xs">Click shuffle or move players here</p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Game Preview */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Game Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/70">Game Mode:</span>
                  <span className="ml-2 font-medium">{gameState.gameMode || '2v2'}</span>
                </div>
                <div>
                  <span className="text-white/70">Total Players:</span>
                  <span className="ml-2 font-medium">{players.length}</span>
                </div>
                <div>
                  <span className="text-white/70">Rounds:</span>
                  <span className="ml-2 font-medium">5 + Final</span>
                </div>
                <div>
                  <span className="text-white/70">Features:</span>
                  <span className="ml-2 font-medium">Chaos Cards, Roasts</span>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  Trending Topics ✨
                </Badge>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  Friend Knowledge 🧠
                </Badge>
                <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                  Viral Moments 📹
                </Badge>
                <Badge variant="outline" className="border-red-500/30 text-red-400">
                  Friendship Tests 💀
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Start Game Button */}
        {isHost && (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={startGame}
              disabled={!allTeamsHavePlayers}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-8 py-4 text-lg"
            >
              <Play className="w-6 h-6 mr-2" />
              Start the Roast Battle!
            </Button>
            {!allTeamsHavePlayers && (
              <p className="text-white/60 text-sm mt-2">
                Both teams need at least one player
              </p>
            )}
          </motion.div>
        )}

        {/* Fun Facts */}
        <motion.div 
          className="text-center text-white/60 text-sm space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>💡 Pro tip: Balanced teams make for the best games!</p>
          <p>🔥 Remember: It's all fun and games until someone gets roasted</p>
          <p>📱 Perfect for streaming - your audience will love the drama!</p>
        </motion.div>
      </div>
    </div>
  )
}

export default TeamFormation

