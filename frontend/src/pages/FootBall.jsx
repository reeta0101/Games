import { useState, useEffect, useCallback, useRef } from 'react'
import './FootBall.css'

const TOTAL_ROUNDS = 5
const DIRECTIONS = ['left', 'center', 'right']

export default function FootBall() {
  const [playerScore, setPlayerScore] = useState(0)
  const [keeperScore, setKeeperScore] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  // Animation state
  const [kickerState, setKickerState] = useState('')       // '' | 'run-up' | 'kick'
  const [ballState, setBallState] = useState('')            // '' | 'shot-left' | 'shot-center' | 'shot-right' | 'goal-scored' | 'caught-*'
  const [gkState, setGkState] = useState('idle')            // 'idle' | 'ready' | 'dive-left' | 'dive-center' | 'dive-right'
  const [shotDirection, setShotDirection] = useState(null)
  const [gkHolding, setGkHolding] = useState(false)         // arms wrap around ball
  const [caughtDirection, setCaughtDirection] = useState(null)
  const [ballShooting, setBallShooting] = useState(false)
  const [catchFlash, setCatchFlash] = useState(null)        // { left, bottom } for the flash ring

  // Result overlay
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState({ icon: '', text: '', sub: '', isGoal: false })

  // Zone highlight
  const [highlightZone, setHighlightZone] = useState({ dir: '', type: '' }) // type: 'goal' | 'save'

  // Score pop
  const [popPlayer, setPopPlayer] = useState(false)
  const [popKeeper, setPopKeeper] = useState(false)

  // Crowd bar
  const [crowdActive, setCrowdActive] = useState(false)

  // Confetti
  const [confetti, setConfetti] = useState([])
  const confettiIdRef = useRef(0)

  // Particles (created once)
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 4 + Math.random() * 8,
      delay: Math.random() * 6,
      size: 2 + Math.random() * 3,
    }))
  )

  // Spawn confetti
  const spawnConfetti = useCallback((count = 25) => {
    const colors = ['#ffd700', '#ff3d5a', '#39ff14', '#00e5ff', '#ff6b2b', '#a855f7', '#f43f5e']
    const newConfetti = Array.from({ length: count }, () => {
      confettiIdRef.current += 1
      return {
        id: confettiIdRef.current,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 5 + Math.random() * 8,
        height: 5 + Math.random() * 8,
        radius: Math.random() > 0.5 ? '50%' : '2px',
        duration: 1.5 + Math.random() * 2,
        delay: Math.random() * 0.5,
      }
    })
    setConfetti(prev => [...prev, ...newConfetti])
    setTimeout(() => {
      setConfetti(prev => prev.filter(c => !newConfetti.find(n => n.id === c.id)))
    }, 4000)
  }, [])

  // Reset positions
  const resetPositions = useCallback(() => {
    setKickerState('')
    setShotDirection(null)
    setBallState('')
    setGkState('idle')
    setGkHolding(false)
    setCaughtDirection(null)
    setBallShooting(false)
    setHighlightZone({ dir: '', type: '' })
    setCatchFlash(null)
  }, [])

  // Shoot
  const shoot = useCallback((direction) => {
    if (isAnimating || gameOver) return
    setIsAnimating(true)
    setShotDirection(direction)

    const keeperDir = DIRECTIONS[Math.floor(Math.random() * 3)]

    // Keeper sets before reacting to the shot
    setGkState('ready')

    // Phase 1: run-up
    setKickerState('run-up')

    setTimeout(() => {
      // Phase 2: kick
      setKickerState('kick')

      setTimeout(() => {
        // Phase 3: ball flight
        setBallShooting(true)
        setBallState(`shot-${direction}`)

        setTimeout(() => {
          // Phase 4: keeper dive
          setGkState(`dive-${keeperDir}`)

          setTimeout(() => {
            // Phase 5: result
            const isGoal = direction !== keeperDir

            setHighlightZone({ dir: direction, type: isGoal ? 'goal' : 'save' })

            if (isGoal) {
              setBallState(`shot-${direction} goal-scored`)
              setPlayerScore(prev => prev + 1)
              setResultData({
                icon: '⚽🎉',
                text: 'GOAL!',
                sub: `You shot ${direction}, keeper dove ${keeperDir}`,
                isGoal: true,
              })
              setCrowdActive(true)
              setPopPlayer(true)
              setTimeout(() => setPopPlayer(false), 400)
              spawnConfetti()
            } else {
              // Phase 5b: Catch — ball snaps to keeper, arms wrap
              setKeeperScore(prev => prev + 1)

              // Flash ring position based on direction
              const flashPositions = {
                left:   { left: 'calc(50% - var(--fb-keeper-dive-x))', bottom: 'var(--fb-catch-side-y)' },
                center: { left: '50%', bottom: 'var(--fb-catch-center-y)' },
                right:  { left: 'calc(50% + var(--fb-keeper-dive-x))', bottom: 'var(--fb-catch-side-y)' },
              }

              // After a tiny beat, snap ball into keeper's body
              setTimeout(() => {
                setBallShooting(false)
                setBallState(`fb-caught caught-${direction}`)
                setCatchFlash(flashPositions[direction])
                setTimeout(() => setCatchFlash(null), 500)

                setTimeout(() => {
                  setCaughtDirection(direction)
                  setGkHolding(true)
                }, 80)
              }, 180)

              setResultData({
                icon: '🧤',
                text: 'SAVED!',
                sub: `Both went ${direction}! Great save!`,
                isGoal: false,
              })
              setPopKeeper(true)
              setTimeout(() => setPopKeeper(false), 400)
            }

            setTimeout(() => setShowResult(true), isGoal ? 0 : 1200)

            // Phase 6: reset
            setTimeout(() => {
              setShowResult(false)
              setCrowdActive(false)
              resetPositions()

              setCurrentRound(prev => {
                const next = prev + 1
                if (next > TOTAL_ROUNDS) {
                  setTimeout(() => setGameOver(true), 400)
                } else {
                  setIsAnimating(false)
                }
                return next
              })
            }, isGoal ? 1800 : 3300)
          }, 350)
        }, 100)
      }, 150)
    }, 300)
  }, [isAnimating, gameOver, resetPositions, spawnConfetti])

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (isAnimating || gameOver) return
      switch (e.key) {
        case 'ArrowLeft': case 'a': case 'A': shoot('left'); break
        case 'ArrowUp': case 'w': case 'W': shoot('center'); break
        case 'ArrowRight': case 'd': case 'D': shoot('right'); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shoot, isAnimating, gameOver])

  // Reset game
  const resetGame = () => {
    setPlayerScore(0)
    setKeeperScore(0)
    setCurrentRound(1)
    setIsAnimating(false)
    setGameOver(false)
    setShowResult(false)
    setCrowdActive(false)
    setConfetti([])
    resetPositions()
  }

  // Determine game over state
  const getGameOverState = () => {
    if (playerScore > keeperScore) return 'win'
    if (playerScore < keeperScore) return 'lose'
    return 'draw'
  }

  const gameResult = getGameOverState()

  return (
    <div className="fb-game-page">
      {/* Particles */}
      <div className="fb-particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="fb-particle"
            style={{
              left: `${p.left}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          />
        ))}
      </div>

      {/* Game Container */}
      <div className="fb-game-wrapper">
        {/* Scoreboard */}
        <header className="fb-scoreboard">
          <div className="fb-score-side">
            <span className="fb-score-label">YOU</span>
            <span className={`fb-score-value ${popPlayer ? 'fb-pop' : ''}`}>{playerScore}</span>
          </div>
          <div className="fb-score-divider">
            <span className="fb-round-info">Round {Math.min(currentRound, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}</span>
            <span className="fb-vs-text">VS</span>
          </div>
          <div className="fb-score-side">
            <span className="fb-score-label">KEEPER</span>
            <span className={`fb-score-value ${popKeeper ? 'fb-pop' : ''}`}>{keeperScore}</span>
          </div>
        </header>

        {/* Stadium */}
        <div className="fb-stadium">
          {/* Floodlights */}
          <div className="fb-floodlight fb-fl-left"></div>
          <div className="fb-floodlight fb-fl-right"></div>

          {/* Goal Frame */}
          <div className="fb-goal-frame">
            {/* Net */}
            <div className="fb-goal-net">
              {[20, 40, 60, 80].map(l => (
                <div key={`v${l}`} className="fb-net-line" style={{ left: `${l}%` }} />
              ))}
              {[25, 50, 75].map(t => (
                <div key={`h${t}`} className="fb-net-line-h" style={{ top: `${t}%` }} />
              ))}
            </div>

            {/* Goal Zones */}
            {DIRECTIONS.map(dir => (
              <div
                key={dir}
                className={`fb-goal-zone fb-zone-${dir} ${
                  highlightZone.dir === dir
                    ? highlightZone.type === 'goal'
                      ? 'fb-highlight-goal'
                      : 'fb-highlight-save'
                    : ''
                }`}
              />
            ))}

            {/* Posts */}
            <div className="fb-post fb-post-left" />
            <div className="fb-post fb-post-right" />
            <div className="fb-crossbar" />

            {/* Goalkeeper */}
            <div className={`fb-goalkeeper ${gkState === 'idle' ? 'fb-gk-idle' : ''} ${gkState === 'ready' ? 'fb-gk-ready' : ''} ${gkState.startsWith('dive') ? `fb-${gkState}` : ''} ${gkHolding ? 'fb-holding' : ''} ${caughtDirection ? `fb-catch-${caughtDirection}` : ''}`}>
              <div className="fb-gk-body">
                <div className="fb-gk-head" />
                <div className="fb-gk-torso" />
                <div className="fb-gk-arm fb-gk-arm-left" />
                <div className="fb-gk-arm fb-gk-arm-right" />
                {caughtDirection && (
                  <div className={`fb-gk-catch-pocket fb-gk-catch-pocket-${caughtDirection}`}>
                    <div className="fb-gk-catch-glove fb-gk-catch-glove-left" />
                    <div className={`fb-held-ball fb-held-ball-${caughtDirection}`}>
                      <div className="fb-ball-inner">
                        <div className="fb-ball-pattern" />
                      </div>
                    </div>
                    <div className="fb-gk-catch-glove fb-gk-catch-glove-right" />
                  </div>
                )}
                <div className="fb-gk-legs">
                  <div className="fb-gk-leg fb-gk-leg-left" />
                  <div className="fb-gk-leg fb-gk-leg-right" />
                </div>
              </div>
            </div>
          </div>

          {/* Ball */}
          <div className={`fb-ball ${ballState} ${ballShooting ? 'fb-shooting' : ''}`}>
            <div className="fb-ball-inner">
              <div className="fb-ball-pattern" />
            </div>
          </div>

          {/* Catch flash ring */}
          {catchFlash && (
            <div
              className="fb-catch-flash"
              style={{ left: catchFlash.left, bottom: catchFlash.bottom }}
            />
          )}

          {/* Kicker */}
          <div className={`fb-kicker ${shotDirection ? `fb-kicker-shot-${shotDirection}` : ''} ${kickerState === 'run-up' ? 'fb-run-up' : ''} ${kickerState === 'kick' ? 'fb-run-up fb-kick' : ''}`}>
            <div className="fb-kicker-body">
              <div className="fb-kicker-head" />
              <div className="fb-kicker-torso" />
              <div className="fb-kicker-arm fb-kicker-arm-left" />
              <div className="fb-kicker-arm fb-kicker-arm-right" />
              <div className="fb-kicker-legs">
                <div className="fb-kicker-leg fb-kicker-leg-left" />
                <div className="fb-kicker-leg fb-kicker-leg-right" />
              </div>
            </div>
          </div>

          {/* Pitch lines */}
          <div className="fb-pitch-lines">
            <div className="fb-penalty-spot" />
            <div className="fb-penalty-arc" />
          </div>
        </div>

        {/* Result Overlay */}
        <div className={`fb-result-overlay ${showResult ? 'fb-show' : ''}`}>
          <div className="fb-result-content">
            <span className="fb-result-icon">{resultData.icon}</span>
            <h2 className={`fb-result-text ${resultData.isGoal ? 'fb-goal' : 'fb-save'}`}>
              {resultData.text}
            </h2>
            <p className="fb-result-sub">{resultData.sub}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="fb-controls">
          <p className="fb-instruction">
            {isAnimating ? '⏳ Watch the action...' : 'Choose your shot direction!'}
          </p>
          <div className="fb-direction-buttons">
            <button
              className="fb-dir-btn fb-dir-left"
              id="fbBtnLeft"
              disabled={isAnimating || gameOver}
              onClick={() => shoot('left')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>LEFT</span>
            </button>
            <button
              className="fb-dir-btn fb-dir-center"
              id="fbBtnCenter"
              disabled={isAnimating || gameOver}
              onClick={() => shoot('center')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="12 6 12 18" />
                <polyline points="8 10 12 6 16 10" />
              </svg>
              <span>CENTER</span>
            </button>
            <button
              className="fb-dir-btn fb-dir-right"
              id="fbBtnRight"
              disabled={isAnimating || gameOver}
              onClick={() => shoot('right')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span>RIGHT</span>
            </button>
          </div>
        </div>

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="fb-gameover-overlay fb-show">
            <div className="fb-gameover-content">
              <div className="fb-trophy">
                {gameResult === 'win' ? '🏆' : gameResult === 'lose' ? '😢' : '🤝'}
              </div>
              <h1 className={`fb-gameover-title fb-${gameResult}`}>
                {gameResult === 'win' ? 'YOU WIN!' : gameResult === 'lose' ? 'YOU LOSE' : 'DRAW!'}
              </h1>
              <p className="fb-gameover-score">{playerScore} - {keeperScore}</p>
              <button className="fb-play-again-btn" id="fbPlayAgain" onClick={resetGame}>
                PLAY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Crowd Bar */}
      <div className={`fb-crowd-bar ${crowdActive ? 'fb-crowd-active' : ''}`}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="fb-crowd-segment" />
        ))}
      </div>

      {/* Confetti */}
      {confetti.map(c => (
        <div
          key={c.id}
          className="fb-confetti"
          style={{
            left: `${c.left}vw`,
            backgroundColor: c.color,
            width: `${c.width}px`,
            height: `${c.height}px`,
            borderRadius: c.radius,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
