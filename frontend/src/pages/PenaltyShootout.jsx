import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const ZONES = ['TL', 'TC', 'TR', 'BL', 'BC', 'BR'];

// 3D position mappings for each zone - using consistent coordinate space
// The field goes from Y=0 (bottom/user) to Y=-100 (top/goal)
// X goes from -50 (left) to +50 (right)
// Z is height from ground (0) to air (100)

// Physics are calculated dynamically based on container size

export default function PenaltyShootout() {
  const navigate = useNavigate();
  const animationFrameRef = useRef(null);

  const [score, setScore] = useState({ me: 0, opponent: 0 });
  const [round, setRound] = useState(1);
  const [gameStatus, setGameStatus] = useState('playing');
  const [animating, setAnimating] = useState(false);

  const [ballPos, setBallPos] = useState('start');
  const [gkPos, setGkPos] = useState('start');
  const [message, setMessage] = useState('⚽ ROUND 1! YOU ARE STRIKER. Pick a target.');
  const [ballTrajectory, setBallTrajectory] = useState(null);
  
  const [showGoalEffect, setShowGoalEffect] = useState(false);
  const [showSaveEffect, setShowSaveEffect] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);

  const pitchRef = useRef(null);
  const [pitchSize, setPitchSize] = useState({ width: 600, height: 750 });

  useEffect(() => {
    if (!pitchRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setPitchSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(pitchRef.current);
    return () => observer.disconnect();
  }, []);

  const getDynamicPositions = () => {
    const pW = pitchSize.width;

    // Real world anchor: 1 yard
    // We display 24 yards of width to make the Goal large (1/3 of screen) while keeping exact 1:1 realism.
    const yard = pW / 24; 

    // Real World Proportions (in yards)
    const goalW = 8 * yard;
    const goalH = 2.66 * yard; // 8 feet
    const goalAreaW = 20 * yard;
    const goalAreaD = 6 * yard;
    const penSpotD = 12 * yard;
    const penAreaW = 44 * yard;
    const penAreaD = 18 * yard;
    const netDepth = 3 * yard;

    const targetX = (goalW / 2) * 0.8; 
    
    const topZ = goalH * 0.85;
    const bottomZ = goalH * 0.15;
    const depthY = -netDepth;
    
    const startY = penSpotD;

    const ZONE_POS = {
      TL: { x: -targetX, y: depthY, z: topZ, rotX: -20, rotY: 15, rotZ: -720 },
      TC: { x: 0, y: depthY, z: topZ, rotX: -25, rotY: 0, rotZ: 720 },
      TR: { x: targetX, y: depthY, z: topZ, rotX: -20, rotY: -15, rotZ: 720 },
      BL: { x: -targetX, y: depthY, z: bottomZ, rotX: -10, rotY: 10, rotZ: -360 },
      BC: { x: 0, y: depthY, z: bottomZ, rotX: -15, rotY: 0, rotZ: 360 },
      BR: { x: targetX, y: depthY, z: bottomZ, rotX: -10, rotY: -10, rotZ: 360 },
      start: { x: 0, y: startY, z: 0, rotX: 0, rotY: 0, rotZ: 0 },
    };

    const gkTargetX = (goalW / 2) * 0.7;
    const gkTopZ = goalH * 0.7;
    const gkBottomZ = goalH * 0.15;

    const GK_POS = {
      TL: { x: -gkTargetX, y: 10, z: gkTopZ, rotZ: -75 },
      TC: { x: 0, y: 10, z: gkTopZ + (yard * 0.5), rotZ: 0 },
      TR: { x: gkTargetX, y: 10, z: gkTopZ, rotZ: 75 },
      BL: { x: -gkTargetX, y: 10, z: gkBottomZ, rotZ: -85 },
      BC: { x: 0, y: 10, z: gkBottomZ, rotZ: 0 },
      BR: { x: gkTargetX, y: 10, z: gkBottomZ, rotZ: 85 },
      start: { x: 0, y: 0, z: 0, rotZ: 0 },
    };
    
    return { 
      ZONE_POS, GK_POS, 
      layout: { goalW, goalH, goalAreaW, goalAreaD, penSpotD, penAreaW, penAreaD, netDepth, yard } 
    };
  };

  const { ZONE_POS, GK_POS, layout } = getDynamicPositions();
  const [confetti, setConfetti] = useState([]);
  const [dustParticles, setDustParticles] = useState([]);
  const [showFlashes, setShowFlashes] = useState(false);
  const [activeTarget, setActiveTarget] = useState(null);

  const [flashes] = useState(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 200 + 50}px`,
      height: `${Math.random() * 200 + 50}px`,
      delay: `${Math.random() * 2.5}s`,
    }));
  });

  // Camera Shake
  const triggerCameraShake = useCallback(() => {
    setCameraShake(true);
    setTimeout(() => setCameraShake(false), 400);
  }, []);

  // Particle Physics: Dust
  const spawnDust = useCallback(() => {
    const newDust = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i + 1000,
      x: (Math.random() - 0.5) * 40,
      y: layout.penSpotD,
      z: 0,
      vx: (Math.random() - 0.5) * 15,
      vy: Math.random() * 5 + 2, // move slightly backwards
      vz: Math.random() * 15 + 5, // kick up
      size: Math.random() * 8 + 4,
      life: 1,
    }));
    setDustParticles(newDust);
  }, [layout.penSpotD]);

  useEffect(() => {
    if (dustParticles.length === 0) return;
    const animate = () => {
      setDustParticles(prev => {
        const updated = prev.map(d => ({
          ...d,
          x: d.x + d.vx * 0.1,
          y: d.y + d.vy * 0.1,
          z: d.z + d.vz * 0.1,
          vz: d.z > 0 ? d.vz - 0.5 : 0, // gravity, stop bouncing
          vx: d.vx * 0.95,
          life: d.life - 0.02,
        })).filter(d => d.life > 0);
        if (updated.length > 0) {
          requestAnimationFrame(animate);
        }
        return updated;
      });
    };
    animate();
  }, [dustParticles.length]);

  // Particle Physics: Confetti
  const spawnConfetti = useCallback(() => {
    const colors = ['#FFD700', '#FF3D5A', '#39FF14', '#00E5FF', '#FF6B2B', '#A855F7'];
    const newConfetti = Array.from({ length: 80 }, (_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 40,
      y: 20 + Math.random() * 20,
      vx: (Math.random() - 0.5) * 15,
      vy: -Math.random() * 15 - 5,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      life: 1,
    }));
    setConfetti(prev => [...prev, ...newConfetti]);
  }, []);

  useEffect(() => {
    if (confetti.length === 0) return;
    const animate = () => {
      setConfetti(prev => {
        const updated = prev.map(c => ({
          ...c,
          x: c.x + c.vx * 0.03,
          y: c.y + c.vy * 0.03,
          vy: c.vy + 0.4, // gravity
          vx: c.vx * 0.98, // air friction
          rotation: c.rotation + c.rotSpeed,
          life: c.life - 0.015,
        })).filter(c => c.life > 0 && c.y < 120);
        if (updated.length > 0) {
          requestAnimationFrame(animate);
        }
        return updated;
      });
    };
    animate();
  }, [confetti.length]);

  const checkWin = useCallback((newScore, currentRound, currentTurn) => {
    if (currentRound > 10 && !currentTurn) {
      if (newScore.me > newScore.opponent) {
        setGameStatus('won');
        setMessage('🏆 YOU WON THE SHOOTOUT!');
        return true;
      } else if (newScore.opponent > newScore.me) {
        setGameStatus('lost');
        setMessage('💔 YOU LOST THE SHOOTOUT.');
        return true;
      } else {
        setMessage('⚡ SUDDEN DEATH!');
      }
    }

    if (currentRound <= 10) {
      const remainingShotsMe = currentTurn ? 11 - currentRound : 10 - currentRound;
      const remainingShotsOpp = 10 - currentRound;
      if (newScore.me > newScore.opponent + remainingShotsOpp) {
        setGameStatus('won');
        setMessage('🏆 YOU WON THE SHOOTOUT!');
        return true;
      }
      if (newScore.opponent > newScore.me + remainingShotsMe) {
        setGameStatus('lost');
        setMessage('💔 YOU LOST THE SHOOTOUT.');
        return true;
      }
    }
    return false;
  }, []);

  const easeLinear = (t) => t;

  const handleZoneClick = useCallback((zone) => {
    if (gameStatus !== 'playing' || animating) return;
    setAnimating(true);

    const aiZone = ZONES[Math.floor(Math.random() * ZONES.length)];
    const isGoal = zone !== aiZone;
    const isStriker = round <= 5;
    const targetZone = isStriker ? zone : aiZone;

    setActiveTarget(targetZone);

    const startPos = ZONE_POS.start;
    
    if (isStriker) {
      setMessage('⚽ SHOOTING...');
      setGkPos(aiZone);
    } else {
      setMessage('🧤 DIVING...');
      setGkPos(zone);
    }

    const shotDelay = isStriker ? 0 : 500;

    setTimeout(() => {
      spawnDust();
      let progress = 0;
      let targetPos = ZONE_POS[isStriker ? zone : aiZone];
      
      if (!isGoal) {
        // Intercept ball exactly at Goalkeeper's hands
        const gkTarget = GK_POS[isStriker ? zone : aiZone];
        
        // Calculate offset based on Goalkeeper's rotation to hit their upper body/hands
        // GK Height is layout.yard * 2. Let's aim 70% up the body -> 1.4 * yard
        const aimHeight = layout.yard * 1.4;
        const rotRad = gkTarget.rotZ * (Math.PI / 180);
        
        targetPos = {
          ...targetPos,
          x: gkTarget.x + (Math.sin(rotRad) * aimHeight),
          y: gkTarget.y, // Intercept exactly on GK's depth plane
          z: gkTarget.z + (Math.cos(rotRad) * aimHeight)
        };
      }

      setBallTrajectory({ start: startPos, end: targetPos, progress: 0 });

      let outcomeTriggered = false;

      const triggerOutcome = () => {
        const newScore = { ...score };
        if (isGoal) {
          if (isStriker) {
            newScore.me += 1;
            setMessage('🎉 GOOOOAAAALLL!!!');
            spawnConfetti();
          } else {
            newScore.opponent += 1;
            setMessage('⚽ GOAL... They scored.');
          }
          setShowGoalEffect(true);
          triggerCameraShake();
        } else {
          if (isStriker) {
            setMessage('🧤 INCREDIBLE SAVE!');
          } else {
            setMessage('🧤 WHAT A SAVE! YOU STOPPED IT!');
            spawnConfetti();
          }
          setShowSaveEffect(true);
          triggerCameraShake();
        }
        setScore(newScore);

        const gameOver = checkWin(newScore, round, isStriker);

        setTimeout(() => {
          setShowGoalEffect(false);
          setShowSaveEffect(false);
          setShowFlashes(false);
          setActiveTarget(null);
          if (!gameOver) {
            setBallPos('start');
            setGkPos('start');
            setBallTrajectory(null);
            if (isStriker && round < 5) {
              setMessage("⚽ ROUND " + (round + 1) + "! YOU ARE STRIKER.");
            } else if (isStriker && round === 5) {
              setMessage('🧤 HALF TIME! NOW YOU ARE GOALKEEPER!');
            } else {
              setRound(r => r + 1);
              setMessage("🧤 ROUND " + (round + 1) + "! YOU ARE GOALKEEPER.");
            }
          }
          setAnimating(false);
        }, 3500); // Extended Basking Time
      };

      let hitStopFrames = 0;

      const animateBall = () => {
        if (isGoal && progress >= 1 && hitStopFrames < 10) {
           // HIT-STOP effect!
           if (!outcomeTriggered) {
             outcomeTriggered = true;
             setShowFlashes(true);
             triggerOutcome();
           }
           hitStopFrames++;
           animationFrameRef.current = requestAnimationFrame(animateBall);
           return;
        }

        progress += 0.02; // Speed of ball
        
        if (progress <= 1) {
          const linearProgress = easeLinear(progress);
          
          // Parabolic height calculation
          const arcHeight = Math.sin(linearProgress * Math.PI) * 15;
          
          setBallTrajectory(prev => prev ? {
            ...prev,
            progress: linearProgress,
            current: {
              x: prev.start.x + (prev.end.x - prev.start.x) * linearProgress,
              y: prev.start.y + (prev.end.y - prev.start.y) * linearProgress,
              z: prev.start.z + (prev.end.z - prev.start.z) * linearProgress + arcHeight,
              rotX: prev.start.rotX + (prev.end.rotX - prev.start.rotX) * linearProgress,
              rotY: prev.start.rotY + (prev.end.rotY - prev.start.rotY) * linearProgress,
              rotZ: prev.start.rotZ + (prev.end.rotZ - prev.start.rotZ) * linearProgress,
            }
          } : null);
          animationFrameRef.current = requestAnimationFrame(animateBall);
        } else if (!isGoal && progress <= 1.5) {
          // Bounce off the goalkeeper!
          if (!outcomeTriggered) {
             outcomeTriggered = true;
             triggerOutcome();
          }
          const bounceProgress = (progress - 1) * 2; // 0 to 1
          setBallTrajectory(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              current: {
                x: prev.end.x + (prev.end.x > 0 ? 50 : -50) * bounceProgress, // bounce outwards
                y: prev.end.y + 120 * bounceProgress, // bounce back towards player
                z: Math.max(0, prev.end.z - (prev.end.z * bounceProgress)), // fall to ground
                rotX: prev.current.rotX + 15,
                rotY: prev.current.rotY + 15,
                rotZ: prev.current.rotZ + 15,
              }
            };
          });
          animationFrameRef.current = requestAnimationFrame(animateBall);
        } else if (isGoal && progress <= 1.5) {
          // Fall to ground after Hit-Stop!
          const dropProgress = (progress - 1) * 2;
          setBallTrajectory(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              current: {
                ...prev.end,
                y: prev.end.y + 30 * dropProgress,
                z: Math.max(0, prev.end.z - (prev.end.z * dropProgress)),
                rotX: prev.end.rotX + (180 * dropProgress),
              }
            };
          });
          animationFrameRef.current = requestAnimationFrame(animateBall);
        } else {
          // Animation fully finished
          if (!outcomeTriggered) {
             outcomeTriggered = true;
             setShowFlashes(true);
             triggerOutcome();
          }
        }
      };
      animateBall();
    }, shotDelay);
  }, [gameStatus, animating, round, score, checkWin, spawnConfetti, triggerCameraShake, ZONE_POS, GK_POS, layout.yard, spawnDust]);

  const resetGame = () => {
    setScore({ me: 0, opponent: 0 });
    setRound(1);
    setGameStatus('playing');
    setBallPos('start');
    setGkPos('start');
    setMessage('⚽ ROUND 1! YOU ARE STRIKER. Pick a target.');
    setBallTrajectory(null);
    setShowGoalEffect(false);
    setShowSaveEffect(false);
    setConfetti([]);
  };

  const getBallStyle = () => {
    const pos = ballTrajectory ? ballTrajectory.current : ZONE_POS[ballPos];
    return {
      transform: `translateX(-50%) translate3d(${pos.x}px, ${pos.y}px, ${pos.z + (layout.yard / 2)}px) rotateX(-60deg) rotateX(${pos.rotX}deg) rotateY(${pos.rotY}deg) rotateZ(${pos.rotZ}deg)`
    };
  };

  const getGkStyle = () => {
    const pos = GK_POS[gkPos];
    return {
      transform: `translateX(-50%) translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotateX(-60deg) rotateZ(${pos.rotZ}deg)`
    };
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col font-sans overflow-hidden select-none">
      <style>{"\
        @keyframes netRipple {\
          0% { transform: scale(1) translateZ(0); }\
          50% { transform: scale(1.05) translateZ(-10px); }\
          100% { transform: scale(1) translateZ(0); }\
        }\
        @keyframes pulseGlow {\
          0%, 100% { box-shadow: 0 0 15px currentColor; transform: scale(1); }\
          50% { box-shadow: 0 0 30px currentColor; transform: scale(1.1); }\
        }\
        @keyframes cameraShake {\
          0%, 100% { transform: translate3d(0, 0, 0); }\
          25% { transform: translate3d(-5px, 3px, 0) rotate(1deg); }\
          50% { transform: translate3d(5px, -3px, 0) rotate(-1deg); }\
          75% { transform: translate3d(-3px, 5px, 0) rotate(0deg); }\
        }\
        @keyframes flashGoal {\
          0% { opacity: 0; transform: scale(0.5); }\
          20% { opacity: 1; transform: scale(1.2); }\
          100% { opacity: 0; transform: scale(2); }\
        }\
        @keyframes flashSave {\
          0% { opacity: 0; transform: scale(0.5); }\
          20% { opacity: 1; transform: scale(1.2); }\
          100% { opacity: 0; transform: scale(2); }\
        }\
        @keyframes spin3D {\
          100% { transform: rotateX(360deg) rotateY(720deg) rotateZ(360deg); }\
        }\
        @keyframes gkBounce {\
          0%, 100% { transform: translateY(0) scaleY(1); }\
          50% { transform: translateY(-5px) scaleY(0.95); }\
        }\
        @keyframes flashBurst {\
          0% { opacity: 0; transform: scale(0.5); }\
          20% { opacity: 1; transform: scale(1.5); }\
          100% { opacity: 0; transform: scale(1); }\
        }\
        @keyframes scorePop {\
          0% { transform: scale(1); color: white; }\
          30% { transform: scale(1.8); color: #FFD700; text-shadow: 0 0 20px #FFD700; }\
          70% { transform: scale(0.9); }\
          100% { transform: scale(1); color: white; }\
        }\
        .preserve-3d {\
          transform-style: preserve-3d;\
        }\
        .polygon-pentagon {\
          clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);\
        }\
      "}</style>

      {/* Stadium Camera Flashes */}
      {showFlashes && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {flashes.map((flash) => (
            <div 
              key={flash.id}
              className="absolute rounded-full mix-blend-overlay"
              style={{
                top: flash.top,
                left: flash.left,
                width: flash.width,
                height: flash.height,
                background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(200,220,255,0) 70%)',
                animation: `flashBurst 0.3s ease-out forwards`,
                animationDelay: flash.delay,
                opacity: 0,
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Header UI - Top 20% */}
      <div className="h-[20%] w-full flex flex-col items-center justify-center pt-4 z-50">
        <div className="flex gap-4 sm:gap-10 items-center">
          <div className="bg-emerald-900/40 border border-emerald-500/30 px-6 py-3 rounded-2xl backdrop-blur-md text-center">
            <div className="text-emerald-400 text-xs font-bold tracking-widest mb-1">YOU</div>
            <div className="text-3xl font-black text-white" style={{ animation: (showGoalEffect && round <= 5) ? 'scorePop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none' }}>{score.me}</div>
          </div>
          
          <div className="text-center bg-slate-800/40 border border-slate-600/30 px-8 py-3 rounded-2xl backdrop-blur-md">
            <div className="text-slate-400 text-xs font-bold tracking-widest mb-1">ROUND {round}/10</div>
            <div className="text-xl font-black text-white">
              {round <= 5 ? <span className="text-emerald-400">STRIKER</span> : <span className="text-cyan-400">GOALKEEPER</span>}
            </div>
          </div>
          
          <div className="bg-rose-900/40 border border-rose-500/30 px-6 py-3 rounded-2xl backdrop-blur-md text-center">
            <div className="text-rose-400 text-xs font-bold tracking-widest mb-1">CPU</div>
            <div className="text-3xl font-black text-white" style={{ animation: (showGoalEffect && round > 5) ? 'scorePop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none' }}>{score.opponent}</div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className={"text-lg md:text-2xl font-black tracking-widest uppercase transition-colors duration-300 " + (showGoalEffect ? 'text-yellow-400' : showSaveEffect ? 'text-cyan-400' : 'text-slate-200')}>
            {message}
          </p>
        </div>
      </div>

      {/* 3D Scene - Responsive Flexible Size */}
      <div 
        className="flex-grow flex items-center justify-center overflow-hidden perspective-[800px]" 
        style={{ 
          perspectiveOrigin: (animating && activeTarget) ? `50% ${activeTarget.includes('T') ? '50%' : '80%'}` : '50% -20%',
          transition: 'perspective-origin 1.2s ease-in-out'
        }}
      >
        <div 
          ref={pitchRef}
          className={"relative w-full max-w-[800px] h-[70%] max-h-[800px] preserve-3d transition-transform duration-[1200ms] ease-in-out " + (cameraShake ? 'animate-[cameraShake_0.4s_ease-in-out]' : '')}
          style={{ 
            transform: (animating && activeTarget)
              ? `rotateX(60deg) translateY(40%) translateX(${activeTarget.includes('L') ? '25%' : activeTarget.includes('R') ? '-25%' : '0%'}) scale(1.7)`
              : 'rotateX(60deg) translateY(10%) scale(0.9)' 
          }}
        >
          {/* Infinite Grass Plane */}
          <div 
            className="absolute -inset-[2000px] bg-[#14532d]"
            style={{ 
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${layout.yard * 6}px, rgba(0,0,0,0.1) ${layout.yard * 6}px, rgba(0,0,0,0.1) ${layout.yard * 12}px)`,
            }}
          ></div>

          {/* Goal Line (White Line stretching across field) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[4000px] h-[4px] bg-white/60 shadow-[0_0_5px_rgba(255,255,255,0.3)] pointer-events-none"></div>

          {/* Pitch Lines Wrapper */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Penalty Area Lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 border-4 border-white/60 border-t-0 shadow-[0_0_5px_rgba(255,255,255,0.3)]" style={{ width: layout.penAreaW, height: layout.penAreaD }}></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 border-4 border-white/60 border-t-0 shadow-[0_0_5px_rgba(255,255,255,0.3)]" style={{ width: layout.goalAreaW, height: layout.goalAreaD }}></div>
            {/* Penalty Spot */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" style={{ transform: `translateY(${layout.penSpotD}px)` }}></div>
            {/* D Arc */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 border-4 border-white/60 rounded-b-full border-t-0 shadow-[0_0_5px_rgba(255,255,255,0.3)]" style={{ width: layout.yard * 20, height: layout.yard * 10, transform: `translateY(${layout.penAreaD}px)` }}></div>
          </div>

          {/* True 3D Goal Structure */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 preserve-3d origin-bottom" style={{ width: layout.goalW, height: layout.goalH, transform: 'rotateX(-60deg)' }}>
            
            {/* Crossbar (Thick Cylindrical) */}
            <div className="absolute top-0 left-0 w-full h-[16px] preserve-3d z-20">
               <div className="absolute inset-0 shadow-[0_5px_15px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(to bottom, #d4d4d4, #ffffff 40%, #ffffff 60%, #a3a3a3)' }}></div>
               <div className="absolute top-full left-0 w-full h-[16px] origin-top" style={{ background: 'linear-gradient(to bottom, #a3a3a3, #e5e5e5 50%, #d4d4d4)', transform: 'rotateX(-90deg)' }}></div>
            </div>

            {/* Left Post (Thick Cylindrical) */}
            <div className="absolute top-0 left-0 w-[16px] h-full preserve-3d z-20">
               <div className="absolute inset-0 shadow-[5px_0_15px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(to right, #d4d4d4, #ffffff 40%, #ffffff 60%, #a3a3a3)' }}></div>
               <div className="absolute top-0 left-full w-[16px] h-full origin-left" style={{ background: 'linear-gradient(to right, #a3a3a3, #e5e5e5 50%, #d4d4d4)', transform: 'rotateY(90deg)' }}></div>
            </div>

            {/* Right Post (Thick Cylindrical) */}
            <div className="absolute top-0 right-0 w-[16px] h-full preserve-3d z-20">
               <div className="absolute inset-0 shadow-[-5px_0_15px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(to left, #d4d4d4, #ffffff 40%, #ffffff 60%, #a3a3a3)' }}></div>
               <div className="absolute top-0 right-full w-[16px] h-full origin-right" style={{ background: 'linear-gradient(to left, #a3a3a3, #e5e5e5 50%, #d4d4d4)', transform: 'rotateY(-90deg)' }}></div>
            </div>

            {/* Ground Back Supports (White Lines on ground) */}
            <div className="absolute bottom-0 left-0 h-[6px] bg-white/50 origin-left" style={{ width: layout.netDepth, transform: 'rotateY(90deg) rotateX(90deg)' }}></div>
            <div className="absolute bottom-0 right-0 h-[6px] bg-white/50 origin-right" style={{ width: layout.netDepth, transform: 'rotateY(-90deg) rotateX(90deg)' }}></div>
            <div className="absolute bottom-0 left-0 w-full h-[6px] bg-white/50" style={{ transform: `translateZ(-${layout.netDepth * 0.85}px) rotateX(90deg)` }}></div>

            {/* Back Net (Sagging backwards, heavily shadowed) */}
            <div 
              className="absolute top-0 left-0 w-full h-full preserve-3d opacity-90 border-2 border-white/20 shadow-[inset_0_0_50px_rgba(0,0,0,0.9)] origin-top"
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)', // Ambient Occlusion
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(120,120,120,0.6) 10px, rgba(120,120,120,0.6) 12px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(120,120,120,0.6) 10px, rgba(120,120,120,0.6) 12px)',
                transform: `translateZ(-${layout.netDepth}px) rotateX(10deg)`,
                animation: showGoalEffect ? 'netRipple 0.5s ease-out' : 'none'
              }}
            ></div>
            
            {/* Top Net */}
            <div className="absolute top-0 left-0 w-full preserve-3d origin-top shadow-[inset_0_-20px_30px_rgba(0,0,0,0.7)]" style={{ height: layout.netDepth, transform: 'rotateX(-90deg)' }}>
              <div 
                className="w-full h-full opacity-70"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(200,200,200,0.7) 10px, rgba(200,200,200,0.7) 12px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(200,200,200,0.7) 10px, rgba(200,200,200,0.7) 12px)',
                  animation: showGoalEffect ? 'netRipple 0.5s ease-out' : 'none'
                }}
              ></div>
            </div>
            
            {/* Left Side Net (Tapered) */}
            <div className="absolute top-0 left-0 h-full preserve-3d origin-left shadow-[inset_0_0_30px_rgba(0,0,0,0.7)]" style={{ width: layout.netDepth, transform: 'rotateY(90deg)' }}>
              <div 
                className="w-full h-full opacity-70"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(200,200,200,0.7) 10px, rgba(200,200,200,0.7) 12px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(200,200,200,0.7) 10px, rgba(200,200,200,0.7) 12px)',
                  clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
                  animation: showGoalEffect ? 'netRipple 0.5s ease-out' : 'none'
                }}
              ></div>
            </div>
            
            {/* Right Side Net (Tapered) */}
            <div className="absolute top-0 right-0 h-full preserve-3d origin-right shadow-[inset_0_0_30px_rgba(0,0,0,0.7)]" style={{ width: layout.netDepth, transform: 'rotateY(-90deg)' }}>
              <div 
                className="w-full h-full opacity-70"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(200,200,200,0.7) 10px, rgba(200,200,200,0.7) 12px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(200,200,200,0.7) 10px, rgba(200,200,200,0.7) 12px)',
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 15% 100%)',
                  animation: showGoalEffect ? 'netRipple 0.5s ease-out' : 'none'
                }}
              ></div>
            </div>
          </div>

          {/* Target Zones Overlay */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 preserve-3d origin-bottom" style={{ width: layout.goalW, height: layout.goalH, transform: 'rotateX(-60deg)' }}>
            {gameStatus === 'playing' && !animating && ZONES.map(zone => {
              const isTop = zone.startsWith('T');
              const isLeft = zone.endsWith('L');
              const isCenter = zone.endsWith('C');
              const isUserStriker = round <= 5;
              
              let leftPos = '50%';
              if (isLeft) leftPos = '10%';
              else if (!isCenter) leftPos = '90%';
              
              let topPos = isTop ? '20%' : '80%';

              return (
                <button
                  key={zone}
                  onClick={() => handleZoneClick(zone)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full cursor-pointer hover:scale-125 transition-transform duration-200 z-50 flex items-center justify-center"
                  style={{
                    left: leftPos,
                    top: topPos,
                    border: isUserStriker ? '3px dashed rgba(16,185,129,0.8)' : '3px dashed rgba(6,182,212,0.8)',
                    backgroundColor: isUserStriker ? 'rgba(16,185,129,0.2)' : 'rgba(6,182,212,0.2)',
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-white animate-[pulseGlow_1.5s_infinite]" style={{ color: isUserStriker ? '#10b981' : '#06b6d4' }}></div>
                </button>
              );
            })}
          </div>

          {/* Goalkeeper Entity */}
          <div 
            className="absolute bottom-full left-1/2 preserve-3d transition-transform duration-500 cubic-bezier(0.2, 0.8, 0.2, 1) origin-bottom z-30"
            style={{ 
              width: layout.yard * 0.8, // Shoulders
              height: layout.yard * 2, // ~6 feet tall
              transform: getGkStyle().transform,
            }}
          >
            {/* GK Shadow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60px] h-[15px] bg-black/50 rounded-full blur-[4px]" style={{ transform: 'rotateX(90deg)' }}></div>
            
             <div 
               className="w-full h-full relative preserve-3d"
               style={{
                 animation: (!animating && gameStatus === 'playing') ? 'gkBounce 1s ease-in-out infinite' : 'none',
                 transform: animating ? 'scaleX(1.1) scaleY(1.15)' : 'scale(1)',
                 transition: 'transform 0.3s ease-out'
               }}
             >
                {/* GK Body */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-900 rounded-[20px] border-2 border-blue-400 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] flex flex-col items-center justify-start pt-2">
                   {/* Head */}
                   <div className="w-[25px] h-[25px] rounded-full bg-orange-200 border-2 border-orange-300 -mt-6"></div>
                   {/* Number */}
                   <div className="text-white font-bold text-xl mt-1">1</div>
                </div>
                {/* Gloves */}
                <div className="absolute top-[30%] -left-[10px] w-[15px] h-[20px] bg-yellow-400 rounded-lg transform -rotate-12"></div>
                <div className="absolute top-[30%] -right-[10px] w-[15px] h-[20px] bg-yellow-400 rounded-lg transform rotate-12"></div>
             </div>
          </div>

          {/* Ball Entity */}
          <div 
            className="absolute bottom-full left-1/2 preserve-3d z-40 origin-center"
            style={{ 
              width: Math.max(12, layout.yard),
              height: Math.max(12, layout.yard),
              transform: getBallStyle().transform,
              transition: ballTrajectory ? 'none' : 'transform 0.5s ease-out'
            }}
          >
             {/* Ball Shadow */}
            <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-[25px] h-[8px] bg-black/60 rounded-full blur-[2px]" style={{ transform: 'rotateX(90deg) translateZ(-5px)' }}></div>
            
            {/* The Ball Itself (With Spin & Trail) */}
            <div 
              className="w-full h-full rounded-full relative overflow-hidden"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #fff, #ddd 60%, #333)',
                boxShadow: (animating && ballTrajectory) ? '0 0 20px rgba(255,255,255,0.8), -10px -10px 30px rgba(255,255,255,0.4)' : 'inset -5px -5px 10px rgba(0,0,0,0.5)',
                animation: (animating && ballTrajectory) ? 'spin3D 0.4s linear infinite' : 'none'
              }}
            >
              {/* Ball Patches */}
              <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-black/80 rounded-[40%] transform rotate-12"></div>
              <div className="absolute bottom-[20%] right-[20%] w-[35%] h-[35%] bg-black/80 rounded-[40%] transform -rotate-45"></div>
              <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-black/80 rounded-[40%] transform rotate-[70deg]"></div>
            </div>
          </div>
          
          {/* Dust Particles */}
          {dustParticles.map(d => (
            <div 
              key={d.id}
              className="absolute bottom-full left-1/2 rounded-full bg-[#8b5a2b] preserve-3d"
              style={{
                width: d.size,
                height: d.size,
                transform: `translateX(-50%) translate3d(${d.x}px, ${d.y}px, ${d.z}px)`,
                opacity: d.life * 0.8,
              }}
            ></div>
          ))}
        </div>

        {/* Goal Effect Flash */}
        {showGoalEffect && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
            <div className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-600 animate-[flashGoal_1s_ease-out_forwards] drop-shadow-[0_0_30px_rgba(255,165,0,0.8)]">
              GOAL!
            </div>
          </div>
        )}

        {/* Save Effect Flash */}
        {showSaveEffect && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
            <div className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 animate-[flashSave_1s_ease-out_forwards] drop-shadow-[0_0_30px_rgba(6,182,212,0.8)]">
              SAVE!
            </div>
          </div>
        )}

        {/* Confetti */}
        {confetti.map(c => (
          <div
            key={c.id}
            className="absolute z-50"
            style={{
              left: c.x + '%',
              top: c.y + '%',
              width: c.size + 'px',
              height: c.size + 'px',
              backgroundColor: c.color,
              transform: "rotate(" + c.rotation + "deg)",
              opacity: c.life,
              borderRadius: '2px',
            }}
          />
        ))}
      </div>

      {/* Controls - Bottom 15% */}
      <div className="h-[15%] w-full flex items-center justify-center gap-6 z-50 pb-4">
        {(gameStatus === 'won' || gameStatus === 'lost') && (
          <button
            onClick={resetGame}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-300"
          >
            PLAY AGAIN
          </button>
        )}
        <button
          onClick={() => navigate('/games')}
          className="px-8 py-4 bg-slate-800/80 rounded-xl text-slate-300 font-bold uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-colors border border-slate-600 backdrop-blur-md"
        >
          GAMES MENU
        </button>
      </div>
    </div>
  );
}
