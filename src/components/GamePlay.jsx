import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Clock, 
  Zap, 
  Trophy, 
  ArrowLeft, 
  Home,
  CheckCircle,
  Circle,
  Star,
  Target
} from 'lucide-react'
import socketService from '@/services/socket'

const GamePlay = ({ gameState, onSubmitAnswer, onUseChaosCard, onRevealAnswer, onNextRound }) => {
  const navigate = useNavigate()
  const params = useParams()
  const roomCode = params?.roomCode || gameState?.roomCode || ''
  
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [showResults, setShowResults] = useState(false)

  // Safe access to gameState properties
  const gameData = gameState?.gameData || {}
  const currentQuestion = gameData.current_question || {}
  const currentRound = gameData.current_round || 1
  const totalRounds = gameData.total_rounds || 5
  const players = gameData.players || []
  const scores = gameData.scores || {}
  const currentSocketId = socketService.socket?.id
  const isHost = players.find(p => p.sid === currentSocketId)?.is_host || false

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !hasSubmitted && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !hasSubmitted) {
      handleSubmitAnswer(null)
    }
  }, [timeLeft, hasSubmitted, showResults])

  // Reset state when new question arrives
  useEffect(() => {
    if (currentQuestion.id) {
      setSelectedAnswer(null)
      setHasSubmitted(false)
      setTimeLeft(30)
      setShowResults(false)
    }
  }, [currentQuestion.id])

  // Show results when all players have answered
  useEffect(() => {
    if (gameData.show_results) {
      setShowResults(true)
    }
  }, [gameData.show_results])

  const handleBackToHome = () => {
    try {
      if (socketService.socket && roomCode) {
        socketService.socket.emit('leave_room', { room_code: roomCode })
      }
      navigate('/', { replace: true })
      setTimeout(() => {
        if (window.location.pathname !== '/') {
          window.location.href = '/'
        }
      }, 100)
    } catch (error) {
      console.error('Error leaving game:', error)
      window.location.href = '/'
    }
  }

  const handleAnswerSelect = (answerIndex) => {
    if (hasSubmitted || showResults) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = (answer = selectedAnswer) => {
    if (hasSubmitted) return
    
    setHasSubmitted(true)
    const answerData = {
      question_id: currentQuestion.id,
      answer_index: answer,
      answer_text: answer !== null ? currentQuestion.options?.[answer] || 'No answer' : 'No answer'
    }
    
    console.log('Submitting answer:', answerData)
    if (onSubmitAnswer) {
      onSubmitAnswer(answerData)
    }
  }

  const handleNextRound = () => {
    if (!isHost) return
    if (onNextRound) {
      onNextRound()
    }
  }

  const handleUseChaosCard = (cardType) => {
    if (onUseChaosCard) {
      onUseChaosCard(cardType)
    }
  }

  // Sample multiple choice questions if none provided
  const sampleQuestion = {
    id: 'sample_1',
    question: "What's the most annoying thing someone can do in a Discord voice chat?",
    category: "Gaming Culture",
    options: [
      "Leave their mic on while eating chips",
      "Play music without asking",
      "Have echo because they don't use headphones",
      "Breathe heavily into the mic",
      "Talk to people in their room",
      "Join and immediately go AFK",
      "Use voice changer constantly",
      "Interrupt everyone mid-sentence"
    ]
  }

  const displayQuestion = currentQuestion.question ? currentQuestion : sampleQuestion
  const progress = (currentRound / totalRounds) * 100

  // Game ended screen
  if (gameState?.gameEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-4xl w-full text-center space-y-8 relative z-10">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
            🏆 Game Over! 🏆
          </h1>
          
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Final Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(scores).map(([playerId, score], index) => {
                  const player = players.find(p => p.sid === playerId)
                  return (
                    <div key={playerId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎮'}
                        </span>
                        <span className="text-white font-medium">{player?.name || 'Unknown'}</span>
                      </div>
                      <span className="text-white font-bold text-xl">{score}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleBackToHome}
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 text-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
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
          onClick={handleBackToHome}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Leave Game
        </Button>
      </div>

      {/* Game Info */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          Round {currentRound}/{totalRounds}
        </Badge>
        <Badge className={`${timeLeft > 10 ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
          <Clock className="w-4 h-4 mr-1" />
          {timeLeft}s
        </Badge>
      </div>

      <div className="max-w-6xl w-full space-y-8 relative z-10">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-white/70 text-sm">
            <span>Game Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/10" />
        </div>

        {/* Question Card */}
        <div className="space-y-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Badge variant="secondary" className="w-fit mx-auto mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
                {displayQuestion.category || 'General'}
              </Badge>
              <CardTitle className="text-white text-2xl md:text-3xl font-bold leading-tight">
                {displayQuestion.question}
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                {showResults ? 'Results are in!' : hasSubmitted ? 'Waiting for other players...' : 'Choose your answer!'}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Multiple Choice Options */}
          <div className="grid md:grid-cols-2 gap-4">
            {displayQuestion.options?.map((option, index) => (
              <div key={index}>
                <Button
                  variant="outline"
                  onClick={() => handleAnswerSelect(index)}
                  disabled={hasSubmitted || showResults}
                  className={`w-full p-6 h-auto text-left justify-start transition-all duration-200 ${
                    selectedAnswer === index
                      ? 'bg-purple-500/20 border-purple-400 text-white'
                      : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                  } ${
                    hasSubmitted || showResults ? 'cursor-not-allowed opacity-60' : 'hover:border-purple-400/50'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0">
                      {selectedAnswer === index ? (
                        <CheckCircle className="w-5 h-5 text-purple-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-base leading-relaxed">
                        {option}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-white/40 font-mono text-sm">
                      {String.fromCharCode(65 + index)}
                    </div>
                  </div>
                </Button>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          {!hasSubmitted && !showResults && (
            <div className="flex justify-center">
              <Button
                onClick={() => handleSubmitAnswer()}
                disabled={selectedAnswer === null}
                size="lg"
                className={`font-bold py-4 px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-300 ${
                  selectedAnswer !== null
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                    : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                }`}
              >
                <Target className="w-5 h-5 mr-2" />
                Submit Answer
              </Button>
            </div>
          )}

          {/* Waiting Message */}
          {hasSubmitted && !showResults && (
            <div className="text-center">
              <div className="text-white/70 text-lg">
                ⏳ Waiting for other players to answer...
              </div>
            </div>
          )}

          {/* Results and Next Round */}
          {showResults && isHost && (
            <div className="flex justify-center">
              <Button
                onClick={handleNextRound}
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 text-lg"
              >
                <Star className="w-5 h-5 mr-2" />
                Next Round
              </Button>
            </div>
          )}

          {showResults && !isHost && (
            <div className="text-center">
              <div className="text-white/70 text-lg">
                🎮 Waiting for host to start next round...
              </div>
            </div>
          )}
        </div>

        {/* Player Status */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Players ({players.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {players.map((player) => (
                  <div key={player.sid} className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-white">{player.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/70">{scores[player.sid] || 0}</span>
                      {gameData.answered_players?.includes(player.sid) ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chaos Cards */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Chaos Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUseChaosCard('double_points')}
                  className="w-full bg-yellow-500/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
                >
                  ⚡ Double Points
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUseChaosCard('steal_points')}
                  className="w-full bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
                >
                  🎯 Steal Points
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUseChaosCard('extra_time')}
                  className="w-full bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                >
                  ⏰ Extra Time
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default GamePlay

