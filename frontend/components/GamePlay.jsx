import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Clock, Trophy, Zap, Target, Users, Crown, 
  CheckCircle, XCircle, Star, Flame, MessageCircle,
  RotateCcw, ArrowRight, Volume2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const GamePlay = ({ gameState, updateGameState }) => {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  
  // Game state
  const [currentRound, setCurrentRound] = useState(1)
  const [gamePhase, setGamePhase] = useState('question') // question, prediction, reveal, results
  const [timeLeft, setTimeLeft] = useState(30)
  const [teamAnswers, setTeamAnswers] = useState({})
  const [revealedAnswers, setRevealedAnswers] = useState([])
  const [scores, setScores] = useState({ team1: 0, team2: 0 })
  const [usedPowerUps, setUsedPowerUps] = useState([])
  
  // Mock current question - in real app this would come from backend
  const [currentQuestion] = useState({
    id: 1,
    type: 'family_feud',
    category: 'Gaming Culture',
    question: "What's the most annoying thing someone can do in a Discord voice chat?",
    answers: [
      { text: "Breathing loudly", points: 40, rank: 1 },
      { text: "Echo/feedback", points: 30, rank: 2 },
      { text: "Music playing", points: 25, rank: 3 },
      { text: "Eating sounds", points: 20, rank: 4 },
      { text: "Background noise", points: 15, rank: 5 },
      { text: "Not muting", points: 10, rank: 6 },
      { text: "Keyboard clicking", points: 5, rank: 7 },
      { text: "Bad microphone", points: 3, rank: 8 }
    ]
  })

  // Mock teams
  const teams = {
    team1: { 
      name: 'Team Chaos', 
      color: 'bg-red-500',
      players: [
        { id: 1, name: gameState.playerName || 'You', avatar: '👑' },
        { id: 2, name: 'Alex_Gaming', avatar: '🎮' }
      ]
    },
    team2: { 
      name: 'Team Mayhem', 
      color: 'bg-blue-500',
      players: [
        { id: 3, name: 'MemeLord420', avatar: '😂' },
        { id: 4, name: 'StreamQueen', avatar: '👸' }
      ]
    }
  }

  // Power-ups available
  const powerUps = [
    { id: 'double', name: 'Double Down', icon: '2️⃣', description: 'Double points for next answer' },
    { id: 'spy', name: 'Spy Mode', icon: '👁️', description: 'See other team\'s discussion' },
    { id: 'steal', name: 'Steal', icon: '💰', description: 'Steal points if they\'re wrong' },
    { id: 'chaos', name: 'Chaos Card', icon: '🎲', description: 'Random effect' }
  ]

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && gamePhase === 'prediction') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gamePhase === 'prediction') {
      setGamePhase('reveal')
    }
  }, [timeLeft, gamePhase])

  const submitAnswer = (teamKey, answer) => {
    setTeamAnswers(prev => ({ ...prev, [teamKey]: answer }))
  }

  const revealAnswer = (index) => {
    setRevealedAnswers(prev => [...prev, index])
    
    // Check if teams got this answer and award points
    const answer = currentQuestion.answers[index]
    Object.entries(teamAnswers).forEach(([teamKey, teamAnswer]) => {
      if (teamAnswer.toLowerCase().includes(answer.text.toLowerCase()) || 
          answer.text.toLowerCase().includes(teamAnswer.toLowerCase())) {
        setScores(prev => ({
          ...prev,
          [teamKey]: prev[teamKey] + answer.points
        }))
      }
    })
  }

  const nextRound = () => {
    if (currentRound < 5) {
      setCurrentRound(prev => prev + 1)
      setGamePhase('question')
      setTimeLeft(30)
      setTeamAnswers({})
      setRevealedAnswers([])
    } else {
      setGamePhase('final_results')
    }
  }

  const startPredictionPhase = () => {
    setGamePhase('prediction')
    setTimeLeft(30)
  }

  const usePowerUp = (powerUpId, teamKey) => {
    setUsedPowerUps(prev => [...prev, { powerUpId, teamKey, round: currentRound }])
    // Power-up effects would be implemented here
  }

  const getTeamKey = () => {
    const playerTeam = Object.entries(teams).find(([key, team]) => 
      team.players.some(p => p.name === gameState.playerName)
    )
    return playerTeam ? playerTeam[0] : 'team1'
  }

  const playerTeamKey = getTeamKey()
  const playerTeam = teams[playerTeamKey]

  if (gamePhase === 'final_results') {
    const winner = scores.team1 > scores.team2 ? teams.team1 : teams.team2
    const winnerKey = scores.team1 > scores.team2 ? 'team1' : 'team2'
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div 
          className="text-center space-y-8 max-w-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="space-y-4">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              {winner.name} Wins!
            </h1>
            <p className="text-2xl text-white">
              Final Score: {scores[winnerKey]} - {scores[winnerKey === 'team1' ? 'team2' : 'team1']}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(teams).map(([key, team]) => (
              <Card key={key} className={`bg-white/10 backdrop-blur-md border-white/20 text-white ${key === winnerKey ? 'ring-2 ring-yellow-400' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {key === winnerKey && <Crown className="w-6 h-6 text-yellow-400" />}
                    <span>{team.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">{scores[key]}</div>
                  <div className="text-sm text-white/70 text-center">points</div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold px-8 py-4"
          >
            Play Again
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with scores and round info */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
              Round {currentRound}/5
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
              {currentQuestion.category}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-6">
            {Object.entries(teams).map(([key, team]) => (
              <div key={key} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${team.color}`} />
                <span className="text-white font-medium">{team.name}</span>
                <span className="text-2xl font-bold text-white">{scores[key]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main game area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Question and answers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">
                    {currentQuestion.question}
                  </CardTitle>
                  {gamePhase === 'prediction' && (
                    <div className="flex items-center justify-center space-x-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-lg font-bold text-yellow-400">{timeLeft}s</span>
                      <Progress value={(timeLeft / 30) * 100} className="w-32" />
                    </div>
                  )}
                </CardHeader>
                
                {gamePhase === 'question' && (
                  <CardContent className="text-center">
                    <p className="text-white/80 mb-6">
                      Teams will predict the most popular answers from our survey!
                    </p>
                    <Button
                      onClick={startPredictionPhase}
                      size="lg"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <Target className="w-5 h-5 mr-2" />
                      Start Predictions
                    </Button>
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* Answers board */}
            {(gamePhase === 'reveal' || gamePhase === 'results') && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="w-6 h-6 text-yellow-400" />
                      <span>Survey Results</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {currentQuestion.answers.map((answer, index) => (
                        <motion.div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            revealedAnswers.includes(index) 
                              ? 'bg-green-500/20 border-green-500/30' 
                              : 'bg-white/5 border-white/20'
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {answer.rank}
                            </Badge>
                            <span className={revealedAnswers.includes(index) ? 'font-medium' : 'text-white/50'}>
                              {revealedAnswers.includes(index) ? answer.text : '???'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-yellow-400">
                              {revealedAnswers.includes(index) ? answer.points : '??'}
                            </span>
                            {!revealedAnswers.includes(index) && gamePhase === 'reveal' && (
                              <Button
                                size="sm"
                                onClick={() => revealAnswer(index)}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                Reveal
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {revealedAnswers.length === currentQuestion.answers.length && (
                      <div className="text-center mt-6">
                        <Button
                          onClick={nextRound}
                          size="lg"
                          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                        >
                          <ArrowRight className="w-5 h-5 mr-2" />
                          {currentRound < 5 ? 'Next Round' : 'Final Results'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Team panel */}
          <div className="space-y-6">
            {/* Your team */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${playerTeam.color}`} />
                    <span>{playerTeam.name}</span>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      Your Team
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {gamePhase === 'prediction' && (
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter your prediction..."
                        value={teamAnswers[playerTeamKey] || ''}
                        onChange={(e) => submitAnswer(playerTeamKey, e.target.value)}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      />
                      <Button
                        onClick={() => {/* Submit answer */}}
                        disabled={!teamAnswers[playerTeamKey]}
                        className="w-full bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Answer
                      </Button>
                    </div>
                  )}
                  
                  {teamAnswers[playerTeamKey] && (
                    <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Your answer:</span>
                      </div>
                      <p className="font-medium mt-1">{teamAnswers[playerTeamKey]}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-white/80">Team Members</h4>
                    {playerTeam.players.map(player => (
                      <div key={player.id} className="flex items-center space-x-2 text-sm">
                        <span>{player.avatar}</span>
                        <span>{player.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Power-ups */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>Chaos Cards</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {powerUps.map(powerUp => (
                    <Button
                      key={powerUp.id}
                      variant="outline"
                      size="sm"
                      onClick={() => usePowerUp(powerUp.id, playerTeamKey)}
                      disabled={usedPowerUps.some(used => used.powerUpId === powerUp.id && used.round === currentRound)}
                      className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      <span className="mr-2">{powerUp.icon}</span>
                      <div className="text-left">
                        <div className="font-medium">{powerUp.name}</div>
                        <div className="text-xs text-white/60">{powerUp.description}</div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Game stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span>Game Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Round Progress</span>
                    <span>{currentRound}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Your Score</span>
                    <span className="font-bold text-green-400">{scores[playerTeamKey]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Power-ups Used</span>
                    <span>{usedPowerUps.filter(p => p.teamKey === playerTeamKey).length}</span>
                  </div>
                  <Separator className="bg-white/20" />
                  <div className="text-center text-xs text-white/60">
                    Room: {roomCode}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GamePlay

