import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const ZONES = ["TL", "TC", "TR", "BL", "BC", "BR"];

// 3D position mappings for each zone
const ZONE_3D_POSITIONS = {
  TL: { x: -35, y: 28, z: -15, rotX: -45, rotY: 15, rotZ: -720 },
  TC: { x: 0, y: 30, z: -18, rotX: -50, rotY: 0, rotZ: 720 },
  TR: { x: 35, y: 28, z: -15, rotX: -45, rotY: -15, rotZ: 720 },
  BL: { x: -28, y: -10, z: -5, rotX: -20, rotY: 20, rotZ: -360 },
  BC: { x: 0, y: -8, z: -8, rotX: -25, rotY: 0, rotZ: 360 },
  BR: { x: 28, y: -10, z: -5, rotX: -20, rotY: -20, rotZ: 360 },
  start: { x: 0, y: -35, z: 0, rotX: 0, rotY: 0, rotZ: 0 },
};

const GK_3D_POSITIONS = {
  TL: { x: -25, y: 18, z: -8, rotX: -30, rotY: 25, rotZ: -60 },
  TC: { x: 0, y: 22, z: -10, rotX: -35, rotY: 0, rotZ: 0 },
  TR: { x: 25, y: 18, z: -8, rotX: -30, rotY: -25, rotZ: 60 },
  BL: { x: -20, y: -5, z: 0, rotX: -10, rotY: 30, rotZ: -80 },
  BC: { x: 0, y: -2, z: -2, rotX: -15, rotY: 0, rotZ: 0 },
  BR: { x: 20, y: -5, z: 0, rotX: -10, rotY: -30, rotZ: 80 },
  start: { x: 0, y: -8, z: 0, rotX: 0, rotY: 0, rotZ: 0 },
};

export default function FootballGame() {
  const navigate = useNavigate();
  const fieldRef = useRef(null);
  const ballRef = useRef(null);
  const gkRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  const [score, setScore] = useState({ me: 0, opponent: 0 });
  const [round, setRound] = useState(1);
  // Rounds 1-5: Player is Striker, Rounds 6-10: Player is Goalkeeper
  const isMyTurn = round <= 5;
  const [gameStatus, setGameStatus] = useState("playing");
  const [animating, setAnimating] = useState(false);

  const [ballPos, setBallPos] = useState("start");
  const [gkPos, setGkPos] = useState("start");
  const [message, setMessage] = useState(
    "⚽ ROUND 1! YOU ARE STRIKER. Pick a target.",
  );
  const [ballTrajectory, setBallTrajectory] = useState(null);
  const [showGoalEffect, setShowGoalEffect] = useState(false);
  const [showSaveEffect, setShowSaveEffect] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [fieldParticles, setFieldParticles] = useState([]);

  // Initialize field particles
  useEffect(() => {
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.1,
      delay: Math.random() * 5,
    }));
    setFieldParticles(particles);
  }, []);

  // Animate field particles
  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame++;
      setFieldParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: p.y - p.speed < 0 ? 100 : p.y - p.speed,
          x: p.x + Math.sin(frame * 0.01 + p.id) * 0.1,
        })),
      );
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, []);

  // Camera shake effect
  const triggerCameraShake = useCallback(() => {
    setCameraShake(true);
    setTimeout(() => setCameraShake(false), 300);
  }, []);

  // Spawn confetti
  const spawnConfetti = useCallback(() => {
    const colors = [
      "#FFD700",
      "#FF3D5A",
      "#39FF14",
      "#00E5FF",
      "#FF6B2B",
      "#A855F7",
      "#F43F5E",
      "#FFFFFF",
    ];
    const newConfetti = Array.from({ length: 60 }, (_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 30,
      y: 30 + Math.random() * 20,
      vx: (Math.random() - 0.5) * 15,
      vy: -Math.random() * 10 - 5,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      shape: Math.random() > 0.5 ? "circle" : "square",
      life: 1,
      decay: Math.random() * 0.015 + 0.008,
    }));
    setConfetti((prev) => [...prev, ...newConfetti]);
  }, []);

  // Update confetti physics
  useEffect(() => {
    if (confetti.length === 0) return;
    const animate = () => {
      setConfetti((prev) => {
        const updated = prev
          .map((c) => ({
            ...c,
            x: c.x + c.vx * 0.02,
            y: c.y + c.vy * 0.02,
            vy: c.vy + 0.3, // gravity
            vx: c.vx * 0.99, // air resistance
            rotation: c.rotation + c.rotSpeed,
            life: c.life - c.decay,
          }))
          .filter((c) => c.life > 0 && c.y < 120);
        if (updated.length > 0) {
          requestAnimationFrame(animate);
        }
        return updated;
      });
    };
    animate();
  }, [confetti.length]);

  // Check win condition
  const checkWin = useCallback((newScore, currentRound, currentTurn) => {
    // Game ends after 10 rounds (5 as striker, 5 as goalkeeper)
    if (currentRound > 10 && !currentTurn) {
      if (newScore.me > newScore.opponent) {
        setGameStatus("won");
        setMessage("🏆 YOU WON THE SHOOTOUT!");
        return true;
      } else if (newScore.opponent > newScore.me) {
        setGameStatus("lost");
        setMessage("💔 YOU LOST THE SHOOTOUT.");
        return true;
      } else {
        // Sudden death
        setMessage("⚡ SUDDEN DEATH! Next goal wins!");
      }
    }

    if (currentRound <= 10) {
      const remainingShotsMe = currentTurn
        ? 11 - currentRound
        : 10 - currentRound;
      const remainingShotsOpp = 10 - currentRound;

      if (newScore.me > newScore.opponent + remainingShotsOpp) {
        setGameStatus("won");
        setMessage("🏆 YOU WON THE SHOOTOUT!");
        return true;
      }
      if (newScore.opponent > newScore.me + remainingShotsMe) {
        setGameStatus("lost");
        setMessage("💔 YOU LOST THE SHOOTOUT.");
        return true;
      }
    }
    return false;
  }, []);

  const handleZoneClick = useCallback(
    (zone) => {
      if (gameStatus !== "playing" || animating) return;
      setAnimating(true);

      const aiZone = ZONES[Math.floor(Math.random() * ZONES.length)];
      const isGoal = zone !== aiZone;

      // Set ball trajectory for 3D animation
      const targetPos = ZONE_3D_POSITIONS[zone];
      const startPos = ZONE_3D_POSITIONS.start;
      setBallTrajectory({ start: startPos, end: targetPos, progress: 0 });

      if (round <= 5) {
        // Rounds 1-5: User is Striker (shooting)
        setMessage("⚽ SHOOTING...");
        setGkPos(aiZone); // GK reacts

        // Animate ball along trajectory
        let progress = 0;
        const animateBall = () => {
          progress += 0.025;
          if (progress <= 1) {
            // Add arc to trajectory
            const arcHeight = Math.sin(progress * Math.PI) * 25;
            setBallTrajectory((prev) =>
              prev
                ? {
                    ...prev,
                    progress,
                    current: {
                      x: prev.start.x + (prev.end.x - prev.start.x) * progress,
                      y:
                        prev.start.y +
                        (prev.end.y - prev.start.y) * progress -
                        arcHeight,
                      z: prev.start.z + (prev.end.z - prev.start.z) * progress,
                      rotX:
                        prev.start.rotX +
                        (prev.end.rotX - prev.start.rotX) * progress,
                      rotY:
                        prev.start.rotY +
                        (prev.end.rotY - prev.start.rotY) * progress,
                      rotZ:
                        prev.start.rotZ +
                        (prev.end.rotZ - prev.start.rotZ) * progress,
                    },
                  }
                : null,
            );
            requestAnimationFrame(animateBall);
          } else {
            setBallPos(zone);
            setBallTrajectory(null);

            setTimeout(() => {
              const newScore = { ...score };
              if (isGoal) {
                newScore.me += 1;
                setMessage("🎉 GOOOOAAAALLL!!!");
                setShowGoalEffect(true);
                spawnConfetti();
                triggerCameraShake();
              } else {
                setMessage("🧤 INCREDIBLE SAVE!");
                setShowSaveEffect(true);
                triggerCameraShake();
              }
              setScore(newScore);

              const gameOver = checkWin(newScore, round, true);

              setTimeout(() => {
                setShowGoalEffect(false);
                setShowSaveEffect(false);
                if (!gameOver) {
                  setBallPos("start");
                  setGkPos("start");
                  if (round < 5) {
                    setMessage(`⚽ ROUND ${round + 1}! YOU ARE STRIKER.`);
                  } else {
                    setMessage("🧤 HALF TIME! NOW YOU ARE GOALKEEPER!");
                  }
                }
                setAnimating(false);
              }, 2000);
            }, 600);
          }
        };
        animateBall();
      } else {
        // Rounds 6-10: User is Goalkeeper (saving)
        setMessage("🧤 DIVING...");
        setGkPos(zone);

        // AI shoots after a brief delay
        setTimeout(() => {
          const aiTargetPos = ZONE_3D_POSITIONS[aiZone];
          setBallTrajectory({
            start: ZONE_3D_POSITIONS.start,
            end: aiTargetPos,
            progress: 0,
          });

          let progress = 0;
          const animateBall = () => {
            progress += 0.03;
            if (progress <= 1) {
              const arcHeight = Math.sin(progress * Math.PI) * 25;
              setBallTrajectory((prev) =>
                prev
                  ? {
                      ...prev,
                      progress,
                      current: {
                        x:
                          prev.start.x + (prev.end.x - prev.start.x) * progress,
                        y:
                          prev.start.y +
                          (prev.end.y - prev.start.y) * progress -
                          arcHeight,
                        z:
                          prev.start.z + (prev.end.z - prev.start.z) * progress,
                        rotX:
                          prev.start.rotX +
                          (prev.end.rotX - prev.start.rotX) * progress,
                        rotY:
                          prev.start.rotY +
                          (prev.end.rotY - prev.start.rotY) * progress,
                        rotZ:
                          prev.start.rotZ +
                          (prev.end.rotZ - prev.start.rotZ) * progress,
                      },
                    }
                  : null,
              );
              requestAnimationFrame(animateBall);
            } else {
              setBallPos(aiZone);
              setBallTrajectory(null);

              setTimeout(() => {
                const newScore = { ...score };
                if (isGoal) {
                  newScore.opponent += 1;
                  setMessage("⚽ GOAL... They scored.");
                  setShowGoalEffect(true);
                  triggerCameraShake();
                } else {
                  setMessage("🧤 WHAT A SAVE! YOU STOPPED IT!");
                  setShowSaveEffect(true);
                  spawnConfetti();
                  triggerCameraShake();
                }
                setScore(newScore);

                const gameOver = checkWin(newScore, round, false);

                setTimeout(() => {
                  setShowGoalEffect(false);
                  setShowSaveEffect(false);
                  if (!gameOver) {
                    setBallPos("start");
                    setGkPos("start");
                    if (round < 10) {
                      setRound((r) => r + 1);
                      setMessage(`🧤 ROUND ${round + 1}! YOU ARE GOALKEEPER.`);
                    }
                  }
                  setAnimating(false);
                }, 2000);
              }, 500);
            }
          };
          animateBall();
        }, 400);
      }
    },
    [
      gameStatus,
      animating,
      round,
      score,
      checkWin,
      spawnConfetti,
      triggerCameraShake,
    ],
  );

  const resetGame = useCallback(() => {
    setScore({ me: 0, opponent: 0 });
    setRound(1);
    setGameStatus("playing");
    setBallPos("start");
    setGkPos("start");
    setMessage("⚽ ROUND 1! YOU ARE STRIKER. Pick a target.");
    setBallTrajectory(null);
    setShowGoalEffect(false);
    setShowSaveEffect(false);
    setConfetti([]);
  }, []);

  // Get 3D transform string for ball
  const getBallTransform = useCallback(() => {
    if (ballTrajectory && ballTrajectory.current) {
      const { x, y, z, rotX, rotY, rotZ } = ballTrajectory.current;
      return `translate3d(${x}%, ${y}%, ${z}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
    }
    const pos = ZONE_3D_POSITIONS[ballPos];
    return `translate3d(${pos.x}%, ${pos.y}%, ${pos.z}px) rotateX(${pos.rotX}deg) rotateY(${pos.rotY}deg) rotateZ(${pos.rotZ}deg)`;
  }, [ballPos, ballTrajectory]);

  // Get 3D transform string for goalkeeper
  const getGkTransform = useCallback(() => {
    const pos = GK_3D_POSITIONS[gkPos];
    return `translate3d(${pos.x}%, ${pos.y}%, ${pos.z}px) rotateX(${pos.rotX}deg) rotateY(${pos.rotY}deg) rotateZ(${pos.rotZ}deg)`;
  }, [gkPos]);

  // Zone positions for 3D target indicators
  const getZonePosition = (zone) => {
    const positions = {
      TL: { top: "12%", left: "12%" },
      TC: { top: "10%", left: "50%" },
      TR: { top: "12%", right: "12%" },
      BL: { bottom: "18%", left: "15%" },
      BC: { bottom: "15%", left: "50%" },
      BR: { bottom: "18%", right: "15%" },
    };
    return positions[zone] || {};
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d2b1a] to-[#0a1628] overflow-hidden">
      {/* Background atmosphere */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.3) 0%, transparent 70%), radial-gradient(ellipse at 50% 100%, rgba(34,197,94,0.15) 0%, transparent 50%)",
        }}
      ></div>

      {/* Floating particles */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {fieldParticles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: "rgba(16,185,129,0.6)",
              opacity: p.opacity,
              filter: "blur(0.5px)",
              animation: `float ${8 + p.id * 0.1}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Confetti */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 50 }}
      >
        {confetti.map((c) => (
          <div
            key={c.id}
            className="absolute"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: `${c.size}px`,
              height: `${c.size}px`,
              background: c.color,
              borderRadius: c.shape === "circle" ? "50%" : "2px",
              transform: `rotate(${c.rotation}deg)`,
              opacity: c.life,
              filter: "drop-shadow(0 0 4px currentColor)",
            }}
          />
        ))}
      </div>

      {/* Main game container with 3D perspective */}
      <div
        className="relative flex flex-col items-center justify-center min-h-screen py-10 px-4"
        style={{
          zIndex: 10,
          perspective: "1000px",
          transformStyle: "preserve-3d",
          transform: cameraShake ? "translate3d(0, 0, 0)" : "none",
          animation: cameraShake
            ? "shake 0.3s cubic-bezier(.36,.07,.19,.97) both"
            : "none",
        }}
      >
        <style jsx global>{`
          @keyframes shake {
            10%,
            90% {
              transform: translate3d(-2px, 0, 0);
            }
            20%,
            80% {
              transform: translate3d(4px, 0, 0);
            }
            30%,
            50%,
            70% {
              transform: translate3d(-8px, 0, 0);
            }
            40%,
            60% {
              transform: translate3d(8px, 0, 0);
            }
          }
          @keyframes float {
            0% {
              transform: translateY(0) scale(1);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(-120vh) scale(0);
              opacity: 0;
            }
          }
          @keyframes goalFlash {
            0% {
              transform: scale(1);
              opacity: 0;
            }
            50% {
              transform: scale(1.5);
              opacity: 1;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          @keyframes saveFlash {
            0% {
              transform: scale(1);
              opacity: 0;
            }
            50% {
              transform: scale(1.3);
              opacity: 1;
            }
            100% {
              transform: scale(1.8);
              opacity: 0;
            }
          }
          @keyframes pulse {
            0%,
            100% {
              transform: scale(1);
              box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 40px rgba(16, 185, 129, 0.8);
            }
          }
        `}</style>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 mb-2 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            PENALTY SHOOTOUT
          </h1>
          <p className="text-lg md:text-xl font-bold text-slate-300/80 tracking-wider">
            VS AI OPPONENT
          </p>
        </div>

        {/* Scoreboard */}
        <div className="flex justify-between w-full max-w-3xl mb-6 text-white">
          <div className="text-center px-6 py-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 backdrop-blur-xl border border-emerald-400/30 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <p className="text-[10px] uppercase tracking-widest text-emerald-300 mb-1 font-bold">
              YOU
            </p>
            <p className="text-4xl md:text-5xl font-black text-emerald-300 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              {score.me}
            </p>
          </div>
          <div className="text-center px-6 py-4 bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-xl border border-slate-500/30 rounded-2xl flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 font-bold">
              ROUND {round} / 10
              {round <= 5
                ? ' <span className="text-emerald-400">(STRIKER)</span>'
                : ' <span className="text-blue-400">(GOALKEEPER)</span>'}
            </p>
            <p className="text-3xl md:text-4xl font-black text-slate-400">—</p>
          </div>
          <div className="text-center px-6 py-4 bg-gradient-to-br from-rose-500/20 to-red-500/10 backdrop-blur-xl border border-rose-400/30 rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.2)]">
            <p className="text-[10px] uppercase tracking-widest text-rose-300 mb-1 font-bold">
              COMPUTER
            </p>
            <p className="text-4xl md:text-5xl font-black text-rose-300 drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]">
              {score.opponent}
            </p>
          </div>
        </div>

        {/* Message display */}
        <div className="mb-6 text-center h-12">
          <p
            className={`text-xl md:text-2xl font-black uppercase tracking-widest transition-all duration-500 ${
              gameStatus === "won"
                ? "text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse"
                : gameStatus === "lost"
                  ? "text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                  : "text-slate-200/90"
            }`}
          >
            {message}
          </p>
        </div>

        {/* 3D Football Field / Goal Area */}
        <div
          ref={fieldRef}
          className="relative w-full max-w-3xl"
          style={{
            perspective: "1200px",
            transformStyle: "preserve-3d",
          }}
        >
          {/* 3D Goal Structure */}
          <div
            className="relative"
            style={{
              width: "100%",
              aspectRatio: "16/10",
              transformStyle: "preserve-3d",
              transform: "rotateX(-5deg) rotateY(0deg)",
            }}
          >
            {/* Field Surface - 3D Plane */}
            <div
              className="absolute inset-0"
              style={{
                transform: "translateZ(-20px) rotateX(-90deg)",
                transformOrigin: "center bottom",
                background:
                  "linear-gradient(180deg, #0f5132 0%, #14532d 50%, #166534 100%)",
                backgroundSize: "100px 100px",
                backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
                boxShadow:
                  "inset 0 0 100px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.4)",
                borderRadius: "20px 20px 0 0",
              }}
            >
              {/* Penalty spot */}
              <div
                className="absolute bottom-1/4 left-1/2 -translate-x-1/2"
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.6)",
                  boxShadow: "0 0 10px rgba(255,255,255,0.8)",
                  transform: "translateZ(1px)",
                }}
              ></div>

              {/* Goal line */}
              <div
                className="absolute top-0 left-0 right-0"
                style={{
                  height: "4px",
                  background: "rgba(255,255,255,0.8)",
                  boxShadow: "0 0 10px rgba(255,255,255,0.8)",
                  transform: "translateZ(1px)",
                }}
              ></div>
            </div>

            {/* Goal Posts - 3D */}
            {/* Left Post */}
            <div
              className="absolute top-0 left-0"
              style={{
                width: "8px",
                height: "100%",
                transform: "translateZ(-20px) translateX(-4px)",
                transformOrigin: "bottom center",
                background:
                  "linear-gradient(180deg, #e5e7eb 0%, #9ca3af 50%, #6b7280 100%)",
                boxShadow:
                  "inset -2px 0 4px rgba(0,0,0,0.3), inset 2px 0 4px rgba(255,255,255,0.2), 0 0 20px rgba(229,231,235,0.3)",
                borderRadius: "4px",
              }}
            >
              {/* Post top cap */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2"
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f3f4f6, #9ca3af)",
                  boxShadow: "0 -2px 10px rgba(229,231,235,0.5)",
                  transform: "translateZ(-8px) translateY(-8px)",
                }}
              ></div>
            </div>

            {/* Right Post */}
            <div
              className="absolute top-0 right-0"
              style={{
                width: "8px",
                height: "100%",
                transform: "translateZ(-20px) translateX(4px)",
                transformOrigin: "bottom center",
                background:
                  "linear-gradient(180deg, #e5e7eb 0%, #9ca3af 50%, #6b7280 100%)",
                boxShadow:
                  "inset -2px 0 4px rgba(0,0,0,0.3), inset 2px 0 4px rgba(255,255,255,0.2), 0 0 20px rgba(229,231,235,0.3)",
                borderRadius: "4px",
              }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2"
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f3f4f6, #9ca3af)",
                  boxShadow: "0 -2px 10px rgba(229,231,235,0.5)",
                  transform: "translateZ(-8px) translateY(-8px)",
                }}
              ></div>
            </div>

            {/* Crossbar */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: "8px",
                transform: "translateZ(-20px) translateY(-4px)",
                background:
                  "linear-gradient(180deg, #e5e7eb 0%, #9ca3af 50%, #6b7280 100%)",
                boxShadow:
                  "inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2), 0 0 20px rgba(229,231,235,0.3)",
                borderRadius: "4px",
              }}
            ></div>

            {/* Goal Net - 3D Mesh */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: "translateZ(-22px)",
                transformOrigin: "center top",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundImage: `
                  linear-gradient(45deg, rgba(255,255,255,0.15) 1px, transparent 1px),
                  linear-gradient(-45deg, rgba(255,255,255,0.15) 1px, transparent 1px)
                `,
                  backgroundSize: "30px 30px",
                  backgroundPosition: "0 0, 15px 15px",
                  opacity: 0.6,
                  borderRadius: "0 0 16px 16px",
                  boxShadow: "inset 0 0 60px rgba(0,0,0,0.3)",
                }}
              ></div>
              {/* Net depth layers */}
              {[1, 2, 3].map((layer, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
                    linear-gradient(45deg, rgba(255,255,255,${0.08 - i * 0.02}) 1px, transparent 1px),
                    linear-gradient(-45deg, rgba(255,255,255,${0.08 - i * 0.02}) 1px, transparent 1px)
                  `,
                    backgroundSize: "30px 30px",
                    backgroundPosition: "0 0, 15px 15px",
                    transform: `translateZ(-${10 + i * 8}px)`,
                    borderRadius: "0 0 16px 16px",
                  }}
                ></div>
              ))}
            </div>

            {/* Goalkeeper - 3D Model */}
            <div
              ref={gkRef}
              className="absolute transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{
                transformStyle: "preserve-3d",
                transform: getGkTransform(),
                zIndex: 20,
                pointerEvents: "none",
              }}
            >
              {/* GK Shadow on field */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{
                  width: "60px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.3)",
                  filter: "blur(4px)",
                  transform:
                    "translateZ(-19px) translateY(8px) rotateX(-90deg)",
                  opacity: 0.5,
                }}
              ></div>

              {/* GK Body - 3D */}
              <div
                className="relative"
                style={{
                  transformStyle: "preserve-3d",
                  width: "48px",
                  height: "80px",
                }}
              >
                {/* Legs */}
                <div
                  className="absolute bottom-0 left-1/2"
                  style={{
                    transform: "translateX(-50%) translateZ(0)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "28px",
                      background:
                        "linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)",
                      borderRadius: "6px 6px 0 0",
                      transform: "translateX(-12px) translateZ(0)",
                      boxShadow:
                        "inset -2px 0 4px rgba(0,0,0,0.3), 2px 0 4px rgba(255,255,255,0.1)",
                    }}
                  ></div>
                  <div
                    style={{
                      width: "14px",
                      height: "28px",
                      background:
                        "linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)",
                      borderRadius: "6px 6px 0 0",
                      transform: "translateX(12px) translateZ(0)",
                      boxShadow:
                        "inset -2px 0 4px rgba(0,0,0,0.3), 2px 0 4px rgba(255,255,255,0.1)",
                    }}
                  ></div>
                </div>

                {/* Torso */}
                <div
                  className="absolute bottom-28 left-1/2 -translate-x-1/2"
                  style={{
                    width: "36px",
                    height: "40px",
                    background:
                      "linear-gradient(180deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%)",
                    borderRadius: "8px",
                    boxShadow:
                      "inset -3px 0 6px rgba(0,0,0,0.3), inset 3px 0 6px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.4)",
                    transform: "translateZ(4px)",
                  }}
                >
                  {/* Jersey number */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      fontSize: "18px",
                      fontWeight: "900",
                      color: "rgba(255,255,255,0.9)",
                      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                      transform: "translateZ(2px)",
                    }}
                  >
                    1
                  </div>
                </div>

                {/* Arms - animated based on dive */}
                <div
                  className="absolute top-10 left-1/2"
                  style={{
                    transform: "translateX(-50%) translateZ(8px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Left arm */}
                  <div
                    style={{
                      width: "10px",
                      height: "36px",
                      background:
                        "linear-gradient(180deg, #1e40af 0%, #3b82f6 100%)",
                      borderRadius: "5px",
                      transform: "translateX(-22px) rotateZ(-20deg)",
                      boxShadow: "inset -1px 0 2px rgba(0,0,0,0.3)",
                    }}
                  ></div>
                  {/* Right arm */}
                  <div
                    style={{
                      width: "10px",
                      height: "36px",
                      background:
                        "linear-gradient(180deg, #1e40af 0%, #3b82f6 100%)",
                      borderRadius: "5px",
                      transform: "translateX(12px) rotateZ(20deg)",
                      boxShadow: "inset 1px 0 2px rgba(0,0,0,0.3)",
                    }}
                  ></div>
                </div>

                {/* Gloves */}
                <div
                  className="absolute top-46 left-1/2"
                  style={{
                    transform: "translateX(-50%) translateZ(10px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      background:
                        "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                      borderRadius: "50%",
                      transform: "translateX(-26px)",
                      boxShadow:
                        "inset -2px -2px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(251,191,36,0.4)",
                      border: "2px solid #d97706",
                    }}
                  ></div>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      background:
                        "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                      borderRadius: "50%",
                      transform: "translateX(10px)",
                      boxShadow:
                        "inset -2px -2px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(251,191,36,0.4)",
                      border: "2px solid #d97706",
                    }}
                  ></div>
                </div>

                {/* Head */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2"
                  style={{
                    width: "24px",
                    height: "24px",
                    background:
                      "linear-gradient(135deg, #fdba74 0%, #fb923c 100%)",
                    borderRadius: "50%",
                    boxShadow:
                      "inset -3px -3px 6px rgba(0,0,0,0.2), inset 3px 3px 6px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.3)",
                    border: "2px solid #f97316",
                    transform: "translateZ(16px)",
                  }}
                >
                  {/* Face */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: "16px",
                      height: "10px",
                      transform: "translateZ(2px)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "4px",
                        left: "3px",
                        width: "3px",
                        height: "3px",
                        background: "#1f2937",
                        borderRadius: "50%",
                      }}
                    ></div>
                    <div
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "3px",
                        width: "3px",
                        height: "3px",
                        background: "#1f2937",
                        borderRadius: "50%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* The Ball - 3D with physics */}
            <div
              ref={ballRef}
              className="absolute transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              style={{
                transformStyle: "preserve-3d",
                transform: getBallTransform(),
                zIndex: 30,
                pointerEvents: "none",
                filter: ballTrajectory
                  ? "drop-shadow(0 20px 15px rgba(0,0,0,0.4))"
                  : "drop-shadow(0 10px 10px rgba(0,0,0,0.3))",
              }}
            >
              {/* Ball Shadow */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{
                  width: "36px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.25)",
                  filter: "blur(3px)",
                  transform:
                    "translateZ(-22px) translateY(14px) rotateX(-90deg) scale(0.8)",
                  opacity: ballTrajectory ? 0.3 : 0.5,
                  transition: "opacity 0.3s, transform 0.3s",
                }}
              ></div>

              {/* 3D Soccer Ball */}
              <div
                className="relative"
                style={{
                  width: "40px",
                  height: "40px",
                  transformStyle: "preserve-3d",
                  animation: ballTrajectory
                    ? "ballSpin 0.4s linear infinite"
                    : "none",
                }}
              >
                <style jsx global>{`
                  @keyframes ballSpin {
                    0% {
                      transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
                    }
                    100% {
                      transform: rotateX(360deg) rotateY(720deg) rotateZ(360deg);
                    }
                  }
                `}</style>

                {/* Ball sphere - using multiple faces for 3D effect */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle at 30% 30%, #ffffff 0%, #f3f4f6 40%, #e5e7eb 70%, #d1d5db 100%)",
                    boxShadow:
                      "inset -4px -4px 12px rgba(0,0,0,0.2), inset 4px 4px 12px rgba(255,255,255,0.3), 0 0 20px rgba(255,255,255,0.2)",
                    border: "2px solid #9ca3af",
                    transform: "translateZ(0)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Pentagonal patches - classic soccer ball pattern */}
                  <div
                    style={{
                      position: "absolute",
                      top: "10%",
                      left: "10%",
                      width: "35%",
                      height: "35%",
                      background: "#1f2937",
                      clipPath:
                        "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                      transform: "translateZ(1px)",
                      filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      top: "10%",
                      right: "10%",
                      width: "35%",
                      height: "35%",
                      background: "#1f2937",
                      clipPath:
                        "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                      transform: "translateZ(1px) scaleX(-1)",
                      filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10%",
                      left: "50%",
                      transform: "translateX(-50%) translateZ(1px)",
                      width: "35%",
                      height: "35%",
                      background: "#1f2937",
                      clipPath:
                        "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                      transform:
                        "translateX(-50%) translateZ(1px) rotate(180deg)",
                      filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "5%",
                      transform:
                        "translateY(-50%) translateZ(1px) rotate(-90deg)",
                      width: "35%",
                      height: "35%",
                      background: "#1f2937",
                      clipPath:
                        "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                      filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "5%",
                      transform:
                        "translateY(-50%) translateZ(1px) rotate(90deg)",
                      width: "35%",
                      height: "35%",
                      background: "#1f2937",
                      clipPath:
                        "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                      filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
                    }}
                  ></div>
                  {/* Center pentagon */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%) translateZ(2px)",
                      width: "28%",
                      height: "28%",
                      background: "#1f2937",
                      clipPath:
                        "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                      filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.4))",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Target Zones - 3D Indicators */}
            {gameStatus === "playing" && !animating && (
              <>
                {ZONES.map((zone) => {
                  const pos = getZonePosition(zone);
                  const isTop = zone.startsWith("T");
                  const isUserStriker = round <= 5;
                  return (
                    <button
                      key={zone}
                      onClick={() => handleZoneClick(zone)}
                      disabled={animating}
                      className="absolute transition-all duration-300"
                      style={{
                        ...pos,
                        transform: isTop
                          ? "translate(-50%, -50%) translateZ(-15px)"
                          : "translate(-50%, 50%) translateZ(-15px)",
                        width: isUserStriker ? "55px" : "65px",
                        height: isUserStriker ? "55px" : "65px",
                        borderRadius: "50%",
                        background: isUserStriker
                          ? "radial-gradient(circle at 30% 30%, rgba(16,185,129,0.4) 0%, rgba(16,185,129,0.1) 60%, transparent 70%)"
                          : "radial-gradient(circle at 30% 30%, rgba(6,182,212,0.4) 0%, rgba(6,182,212,0.1) 60%, transparent 70%)",
                        border: isUserStriker
                          ? "2px dashed rgba(16,185,129,0.6)"
                          : "2px dashed rgba(6,182,212,0.6)",
                        boxShadow: isUserStriker
                          ? "0 0 20px rgba(16,185,129,0.3), inset 0 0 20px rgba(16,185,129,0.1)"
                          : "0 0 20px rgba(6,182,212,0.3), inset 0 0 20px rgba(6,182,212,0.1)",
                        cursor: "crosshair",
                        zIndex: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "pulse 2s ease-in-out infinite",
                      }}
                      aria-label={
                        isUserStriker ? `Shoot ${zone}` : `Dive ${zone}`
                      }
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: isUserStriker
                            ? "linear-gradient(135deg, #10b981, #059669)"
                            : "linear-gradient(135deg, #06b6d4, #0891b2)",
                          boxShadow: "0 0 10px currentColor",
                          animation: "pulse 1.5s ease-in-out infinite",
                        }}
                      ></div>
                    </button>
                  );
                })}
              </>
            )}

            {/* Goal Effect Overlay */}
            {showGoalEffect && (
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                style={{ zIndex: 60 }}
              >
                <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 animate-pulse drop-shadow-[0_0_40px_rgba(255,200,0,0.8)]">
                  GOAL!
                </div>
                <div
                  style={{
                    position: "absolute",
                    width: "200px",
                    height: "200px",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,165,0,0.2) 50%, transparent 70%)",
                    animation: "goalFlash 1s ease-out forwards",
                  }}
                ></div>
              </div>
            )}

            {/* Save Effect Overlay */}
            {showSaveEffect && (
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                style={{ zIndex: 60 }}
              >
                <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-400 to-teal-500 animate-pulse drop-shadow-[0_0_40px_rgba(6,182,212,0.8)]">
                  SAVE!
                </div>
                <div
                  style={{
                    position: "absolute",
                    width: "200px",
                    height: "200px",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(6,182,212,0.4) 0%, rgba(20,184,166,0.2) 50%, transparent 70%)",
                    animation: "saveFlash 1s ease-out forwards",
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 w-full max-w-md mt-8">
          {(gameStatus === "won" || gameStatus === "lost") && (
            <button
              onClick={resetGame}
              className="flex-1 relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 py-4 text-sm font-black uppercase tracking-[0.2em] text-black shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)] transition-all duration-300"
            >
              <span className="relative z-10">PLAY AGAIN</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
              <style jsx global>{`
                @keyframes shimmer {
                  100% {
                    transform: translateX(200%);
                  }
                }
              `}</style>
            </button>
          )}
          <button
            onClick={() => navigate("/games")}
            className="flex-1 relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-500/30 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-300 hover:bg-slate-700/50 hover:border-slate-400/50 hover:text-white transition-all duration-300 backdrop-blur-xl"
          >
            GAMES MENU
          </button>
        </div>
      </div>
    </div>
  );
}
