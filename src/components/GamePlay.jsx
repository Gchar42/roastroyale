import React, { useState, useEffect } from 'react';

const GamePlay = ({ 
  gameState, 
  roomData, 
  onSubmitAnswer, 
  onUseChaosCard, 
  onNextRound, 
  onBackToHome,
  socketService 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = gameState?.currentQuestion || {};
  const currentRound = gameState?.currentRound || 1;
  const totalRounds = gameState?.totalRounds || 5;
  const players = roomData?.players || [];
  const currentSocketId = socketService?.socket?.id;
  const currentPlayer = players.find(p => p.sid === currentSocketId);
  const isHost = currentPlayer?.is_host || false;

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !hasSubmitted && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !hasSubmitted) {
      handleSubmitAnswer(null); // Auto-submit with no answer
    }
  }, [timeLeft, hasSubmitted, showResults]);

  const handleSubmitAnswer = (answerIndex) => {
    if (hasSubmitted) return;
    
    setSelectedAnswer(answerIndex);
    setHasSubmitted(true);
    
    if (onSubmitAnswer) {
      onSubmitAnswer({
        questionId: currentQuestion.id,
        answer: answerIndex,
        timeRemaining: timeLeft
      });
    }
  };

  const handleUseChaosCard = (cardType) => {
    if (onUseChaosCard) {
      onUseChaosCard(cardType);
    }
  };

  const getTimerColor = () => {
    if (timeLeft > 20) return '#00ff88';
    if (timeLeft > 10) return '#fbbf24';
    return '#ef4444';
  };

  const getPlayerStatus = (player) => {
    if (player.hasAnswered) return { text: 'Answered', color: '#00ff88' };
    if (player.sid === currentSocketId && hasSubmitted) return { text: 'Answered', color: '#00ff88' };
    return { text: 'Thinking...', color: '#fbbf24' };
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      color: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(0, 255, 136, 0.05) 0%, transparent 50%)
      `,
      zIndex: 1,
    },
    content: {
      position: 'relative',
      zIndex: 2,
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: 'rgba(42, 42, 42, 0.8)',
      border: '1px solid #333333',
      borderRadius: '8px',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    roundInfo: {
      textAlign: 'center',
      flex: 1,
    },
    roundText: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#a1a1aa',
      marginBottom: '0.5rem',
    },
    roundNumber: {
      fontSize: '2rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    timer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'rgba(42, 42, 42, 0.8)',
      border: '3px solid',
      fontSize: '1.5rem',
      fontWeight: '800',
      transition: 'all 0.3s ease',
    },
    questionSection: {
      textAlign: 'center',
      marginBottom: '3rem',
      padding: '2rem',
      background: 'rgba(42, 42, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid #333333',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    questionCategory: {
      display: 'inline-block',
      padding: '0.5rem 1rem',
      background: 'rgba(139, 92, 246, 0.2)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#8b5cf6',
      marginBottom: '1.5rem',
    },
    questionText: {
      fontSize: '1.75rem',
      fontWeight: '700',
      lineHeight: '1.4',
      color: '#ffffff',
      marginBottom: '1rem',
    },
    questionSubtext: {
      fontSize: '1rem',
      color: '#a1a1aa',
      lineHeight: '1.5',
    },
    answersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    answerButton: {
      padding: '1.5rem',
      background: 'rgba(42, 42, 42, 0.8)',
      border: '2px solid #333333',
      borderRadius: '12px',
      color: '#ffffff',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textAlign: 'left',
      lineHeight: '1.5',
      position: 'relative',
      overflow: 'hidden',
    },
    answerButtonHover: {
      borderColor: '#00d4ff',
      background: 'rgba(0, 212, 255, 0.1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 212, 255, 0.2)',
    },
    answerButtonSelected: {
      borderColor: '#00ff88',
      background: 'rgba(0, 255, 136, 0.2)',
      boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
    },
    answerButtonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
      transform: 'none',
    },
    answerIndex: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: 'rgba(0, 212, 255, 0.2)',
      color: '#00d4ff',
      fontSize: '0.875rem',
      fontWeight: '700',
      marginRight: '1rem',
    },
    playersSection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    playerCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      background: 'rgba(42, 42, 42, 0.8)',
      border: '1px solid #333333',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
    },
    playerAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#ffffff',
    },
    playerInfo: {
      flex: 1,
    },
    playerName: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '0.25rem',
    },
    playerStatus: {
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    chaosCardsSection: {
      marginBottom: '2rem',
    },
    chaosCardsTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: '1rem',
      textAlign: 'center',
    },
    chaosCardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    },
    chaosCard: {
      padding: '1rem',
      background: 'rgba(139, 92, 246, 0.1)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '8px',
      color: '#8b5cf6',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'center',
    },
    chaosCardHover: {
      background: 'rgba(139, 92, 246, 0.2)',
      borderColor: '#8b5cf6',
      transform: 'translateY(-2px)',
    },
    resultsSection: {
      textAlign: 'center',
      padding: '2rem',
      background: 'rgba(42, 42, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid #333333',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    nextButton: {
      padding: '1rem 2rem',
      background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
      border: 'none',
      borderRadius: '8px',
      color: '#0a0a0a',
      fontSize: '1.125rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '1.5rem',
    },
    nextButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 255, 136, 0.4)',
    },
  };

  if (showResults) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        <div style={styles.content}>
          <div style={styles.resultsSection}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>
              Round {currentRound} Results
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#a1a1aa', marginBottom: '2rem' }}>
              Great answers everyone! Let's see how you did...
            </p>
            
            {isHost && (
              <button
                onClick={onNextRound}
                style={styles.nextButton}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.nextButtonHover)}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {currentRound >= totalRounds ? '🏆 View Final Results' : '➡️ Next Round'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      <div style={styles.content}>
        <div style={styles.header}>
          <button
            onClick={onBackToHome}
            style={styles.backButton}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              e.target.style.borderColor = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(42, 42, 42, 0.8)';
              e.target.style.borderColor = '#333333';
            }}
          >
            ← Back to Home
          </button>
          
          <div style={styles.roundInfo}>
            <div style={styles.roundText}>Round</div>
            <div style={styles.roundNumber}>{currentRound} / {totalRounds}</div>
          </div>
          
          <div 
            style={{
              ...styles.timer,
              borderColor: getTimerColor(),
              color: getTimerColor(),
              boxShadow: `0 0 20px ${getTimerColor()}33`,
            }}
          >
            {timeLeft}
          </div>
        </div>

        <div style={styles.questionSection}>
          <div style={styles.questionCategory}>
            {currentQuestion.category || 'General'}
          </div>
          <h2 style={styles.questionText}>
            {currentQuestion.question || 'Loading question...'}
          </h2>
          {currentQuestion.subtext && (
            <p style={styles.questionSubtext}>
              {currentQuestion.subtext}
            </p>
          )}
        </div>

        <div style={styles.answersGrid}>
          {(currentQuestion.options || []).map((option, index) => (
            <button
              key={index}
              onClick={() => handleSubmitAnswer(index)}
              disabled={hasSubmitted}
              style={{
                ...styles.answerButton,
                ...(selectedAnswer === index && styles.answerButtonSelected),
                ...(hasSubmitted && styles.answerButtonDisabled),
              }}
              onMouseEnter={(e) => {
                if (!hasSubmitted) {
                  Object.assign(e.target.style, styles.answerButtonHover);
                }
              }}
              onMouseLeave={(e) => {
                if (!hasSubmitted) {
                  e.target.style.borderColor = selectedAnswer === index ? '#00ff88' : '#333333';
                  e.target.style.background = selectedAnswer === index 
                    ? 'rgba(0, 255, 136, 0.2)' 
                    : 'rgba(42, 42, 42, 0.8)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = selectedAnswer === index 
                    ? '0 0 20px rgba(0, 255, 136, 0.3)' 
                    : 'none';
                }
              }}
            >
              <span style={styles.answerIndex}>{String.fromCharCode(65 + index)}</span>
              {option}
            </button>
          ))}
        </div>

        <div style={styles.playersSection}>
          {players.map((player, index) => {
            const status = getPlayerStatus(player);
            return (
              <div key={player.sid || index} style={styles.playerCard}>
                <div style={styles.playerAvatar}>
                  {player.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={styles.playerInfo}>
                  <div style={styles.playerName}>
                    {player.name}
                    {player.sid === currentSocketId && ' (You)'}
                    {player.is_host && ' 👑'}
                  </div>
                  <div style={{ ...styles.playerStatus, color: status.color }}>
                    {status.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {roomData?.settings?.chaosCards && (
          <div style={styles.chaosCardsSection}>
            <h3 style={styles.chaosCardsTitle}>🎴 Chaos Cards</h3>
            <div style={styles.chaosCardsGrid}>
              <div 
                style={styles.chaosCard}
                onClick={() => handleUseChaosCard('double_points')}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.chaosCardHover)}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
                <div style={{ fontWeight: '600' }}>Double Points</div>
              </div>
              <div 
                style={styles.chaosCard}
                onClick={() => handleUseChaosCard('time_freeze')}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.chaosCardHover)}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>❄️</div>
                <div style={{ fontWeight: '600' }}>Time Freeze</div>
              </div>
              <div 
                style={styles.chaosCard}
                onClick={() => handleUseChaosCard('steal_points')}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.chaosCardHover)}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💰</div>
                <div style={{ fontWeight: '600' }}>Steal Points</div>
              </div>
            </div>
          </div>
        )}

        {hasSubmitted && (
          <div style={styles.resultsSection}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
              Answer Submitted! 
            </h3>
            <p style={{ color: '#a1a1aa' }}>
              Waiting for other players to finish...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePlay;
