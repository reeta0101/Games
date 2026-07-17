import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const ZONES = ["TL", "TC", "TR", "BL", "BC", "BR"];

// 3D position mappings for each zone - enhanced for distance feel
const ZONE_3D_POSITIONS = {
  TL: { x: -38, y: 32, z: -18, rotX: -50, rotY: 18, rotZ: -720 },
  TC: { x: 0, y: 35, z: -22, rotX: -55, rotY: 0, rotZ: 720 },
  TR: { x: 38, y: 32, z: -18, rotX: -50, rotY: -18, rotZ: 720 },
  BL: { x: -30, y: -8, z: -8, rotX: -25, rotY: 22, rotZ: -360 },
  BC: { x: 0, y: -5, z: -12, rotX: -30, rotY: 0, rotZ: 360 },
  BR: { x: 30, y: -8, z: -8, rotX: -25, rotY: -22, rotZ: 360 },
  start: { x: 0, y: -42, z: 0, rotX: 0, rotY: 0, rotZ: 0 },
};

const GK_3D_POSITIONS = {
  TL: { x: -28, y: 20, z: -10, rotX: -35, rotY: 28, rotZ: -60 },
  TC: { x: 0, y: 25, z: -12, rotX: -40, rotY: 0, rotZ: 0 },
  TR: { x: 28, y: 20, z: -10, rotX: -35, rotY: -28, rotZ: 60 },
  BL: { x: -22, y: -3, z: -2, rotX: -15, rotY: 32, rotZ: -80 },
  BC: { x: 0, y: 0, z: -4, rotX: -20, rotY: 0, rotZ: 0 },
  BR: { x: 22, y: -3, z: -2, rotX: -15, rotY: -32, rotZ: 80 },
  start: { x: 0, y: -10, z: 0, rotX: 0, rotY: 0, rotZ: 0 },
};

// Zone positions for 2D target indicators (percentage-based for responsive design)
const ZONE_2D_POSITIONS = {
  TL: { top: "18%", left: "18%" },
  TC: { top: "12%", left: "50%" },
  TR: { top: "18%", right: "18%" },
  BL: { bottom: "22%", left: "20%" },
  BC: { bottom: "28%", left: "50%" },
  BR: { bottom: "22%", right: "20%" },
};

export default function FootballGame() {
  const navigate = useNavigate();
  const ballRef = useRef(null);
  const gkRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [score, setScore] = useState({ me: 0, opponent: 0 });
  const [round, setRound] = useState(1);
  // Rounds 1-5: Player is Striker, Rounds 6-10: Player is Goalkeeper
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Zone positions for 2D target indicators
  const getZonePosition = (zone) => {
    return ZONE_2D_POSITIONS[zone] || {};
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#051018] via-[#081a10] to-[#051018] overflow-hidden">
      {/* Stadium atmosphere - distant lights */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 50% -20%, rgba(255,245,200,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 10%, rgba(255,200,100,0.08) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 15%, rgba(255,180,80,0.06) 0%, transparent 35%),
            linear-gradient(180deg, rgba(10,20,30,0.9) 0%, rgba(5,15,20,1) 100%)
          `,
        }}
      ></div>

      {/* Stadium crowd silhouette */}
      <div
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,0.02) 0px,
              rgba(255,255,255,0.02) 2px,
              transparent 2px,
              transparent 6px
            ),
            radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.1) 0%, transparent 60%)
          `,
          maskImage: "linear-gradient(180deg, black 0%, transparent 100%)",
        }}
      ></div>

      {/* Floating dust particles in stadium lights */}
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
              background: p.color || "rgba(255,245,200,0.6)",
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
          perspective: "1200px",
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
          @keyframes grassSway {
            0%,
            100% {
              transform: rotateZ(0deg);
            }
            50% {
              transform: rotateZ(1deg);
            }
          }
          @keyframes netRipple {
            0% {
              transform: translateX(0);
            }
            50% {
              transform: translateX(8px);
            }
            100% {
              transform: translateX(0);
            }
          }
          @keyframes crowdRoar {
            0%,
            100% {
              opacity: 0.3;
              transform: scaleY(1);
            }
            50% {
              opacity: 0.6;
              transform: scaleY(1.02);
            }
          }
        `}</style>

        {/* 3D FOOTBALL FIELD WITH PENALTY BOX */}
        <div
          className="relative"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(55deg) rotateZ(0deg) translateZ(-50px)",
          }}
        >
          {/* Field base - green grass with perspective */}
          <div
            className="absolute inset-0"
            style={{
              width: "100%",
              maxWidth: "500px",
              aspectRatio: "1 / 1.3",
              background: `
                linear-gradient(180deg,
                  #0d4d1a 0%,
                  #105820 20%,
                  #146b25 40%,
                  #1a7a2a 60%,
                  #1e8a2e 80%,
                  #229933 100%
                )`,
              borderRadius: "24px 24px 40px 40px",
              boxShadow: `
                0 0 0 4px rgba(34, 153, 51, 0.3),
                0 0 0 8px rgba(16, 88, 32, 0.2),
                0 20px 60px rgba(0, 0, 0, 0.5),
                inset 0 -20px 40px rgba(0, 0, 0, 0.3),
                inset 0 20px 40px rgba(255, 255, 255, 0.05)
              `,
              transform: "translateZ(-10px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Grass texture lines */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    rgba(255,255,255,0.02) 0px,
                    rgba(255,255,255,0.02) 1px,
                    transparent 1px,
                    transparent 20px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    rgba(255,255,255,0.01) 0px,
                    rgba(255,255,255,0.01) 1px,
                    transparent 1px,
                    transparent 30px
                  )
                `,
                pointerEvents: "none",
              }}
            ></div>

            {/* Center line */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "5%",
                right: "5%",
                height: "2px",
                background: "rgba(255,255,255,0.4)",
                transform: "translateY(-50%)",
                boxShadow: "0 0 8px rgba(255,255,255,0.6)",
              }}
            ></div>

            {/* Center circle */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "120px",
                height: "120px",
                border: "2px solid rgba(255,255,255,0.4)",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                boxShadow:
                  "0 0 12px rgba(255,255,255,0.3), inset 0 0 12px rgba(255,255,255,0.1)",
              }}
            ></div>

            {/* Center spot */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "8px",
                height: "8px",
                background: "rgba(255,255,255,0.6)",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 6px rgba(255,255,255,0.8)",
              }}
            ></div>

            {/* PENALTY BOX - The 18-yard box */}
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "50%",
                width: "70%",
                height: "38%",
                border: "3px solid rgba(255,255,255,0.5)",
                borderBottom: "none",
                borderRadius: "0 0 20px 20px",
                transform: "translateX(-50%)",
                boxShadow: `
                  inset 0 0 40px rgba(255,255,255,0.05),
                  0 0 30px rgba(255,255,255,0.1)
                `,
                background: `
                  linear-gradient(180deg,
                    rgba(255,255,255,0.02) 0%,
                    transparent 50%,
                    rgba(0,0,0,0.1) 100%
                  )
                `,
              }}
            >
              {/* Penalty spot */}
              <div
                style={{
                  position: "absolute",
                  bottom: "28%",
                  left: "50%",
                  width: "10px",
                  height: "10px",
                  background: "rgba(255,255,255,0.8)",
                  borderRadius: "50%",
                  transform: "translateX(-50%)",
                  boxShadow:
                    "0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.5)",
                }}
              ></div>

              {/* Penalty arc (D) */}
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "50%",
                  width: "100px",
                  height: "100px",
                  border: "3px solid rgba(255,255,255,0.5)",
                  borderBottom: "none",
                  borderRadius: "50px 50px 0 0",
                  transform: "translateX(-50%) translateY(-50%)",
                  boxShadow: "0 0 15px rgba(255,255,255,0.2)",
                }}
              ></div>
            </div>

            {/* GOAL AREA - 6-yard box */}
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "50%",
                width: "35%",
                height: "18%",
                border: "3px solid rgba(255,255,255,0.6)",
                borderBottom: "none",
                borderRadius: "0 0 12px 12px",
                transform: "translateX(-50%)",
                boxShadow: `
                  inset 0 0 30px rgba(255,255,255,0.08),
                  0 0 20px rgba(255,255,255,0.15)
                `,
              }}
            ></div>

            {/* GOAL POSTS - 3D structure */}
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "50%",
                width: "28%",
                height: "14%",
                transform: "translateX(-50%) translateY(2px)",
                transformStyle: "preserve-3d",
                pointerEvents: "none",
              }}
            >
              {/* Goal net */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `
                    repeating-linear-gradient(
                      45deg,
                      rgba(255,255,255,0.08) 0px,
                      rgba(255,255,255,0.08) 1px,
                      transparent 1px,
                      transparent 12px
                    ),
                    repeating-linear-gradient(
                      -45deg,
                      rgba(255,255,255,0.06) 0px,
                      rgba(255,255,255,0.06) 1px,
                      transparent 1px,
                      transparent 12px
                    ),
                    radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%)
                  `,
                  borderRadius: "8px 8px 0 0",
                  transform: "translateZ(-30px) rotateX(-10deg)",
                  transformStyle: "preserve-3d",
                  animation: showGoalEffect
                    ? "netRipple 0.5s ease-out 3"
                    : "none",
                }}
              ></div>

              {/* Crossbar */}
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  right: "0",
                  height: "6px",
                  background:
                    "linear-gradient(90deg, #fff 0%, #ddd 50%, #fff 100%)",
                  borderRadius: "3px",
                  boxShadow: `
                    0 0 10px rgba(255,255,255,0.8),
                    0 4px 8px rgba(0,0,0,0.4),
                    inset 0 -2px 4px rgba(0,0,0,0.3)
                  `,
                  transform: "translateZ(0px)",
                }}
              ></div>

              {/* Left post */}
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "6px",
                  height: "100%",
                  background:
                    "linear-gradient(180deg, #fff 0%, #ddd 50%, #fff 100%)",
                  borderRadius: "3px",
                  boxShadow: `
                    0 0 10px rgba(255,255,255,0.8),
                    4px 0 8px rgba(0,0,0,0.4),
                    inset -2px 0 4px rgba(0,0,0,0.3)
                  `,
                  transform: "translateZ(0px)",
                }}
              ></div>

              {/* Right post */}
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  width: "6px",
                  height: "100%",
                  background:
                    "linear-gradient(180deg, #fff 0%, #ddd 50%, #fff 100%)",
                  borderRadius: "3px",
                  boxShadow: `
                    0 0 10px rgba(255,255,255,0.8),
                    -4px 0 8px rgba(0,0,0,0.4),
                    inset 2px 0 4px rgba(0,0,0,0.3)
                  `,
                  transform: "translateZ(0px)",
                }}
              ></div>

              {/* Goal depth - back stanchions */}
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "6px",
                  height: "100%",
                  background:
                    "linear-gradient(180deg, #ccc 0%, #999 50%, #ccc 100%)",
                  borderRadius: "3px",
                  transform: "translateZ(-30px)",
                  opacity: 0.7,
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  width: "6px",
                  height: "100%",
                  background:
                    "linear-gradient(180deg, #ccc 0%, #999 50%, #ccc 100%)",
                  borderRadius: "3px",
                  transform: "translateZ(-30px)",
                  opacity: 0.7,
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  right: "0",
                  height: "6px",
                  background:
                    "linear-gradient(90deg, #ccc 0%, #999 50%, #ccc 100%)",
                  borderRadius: "3px",
                  transform: "translateZ(-30px)",
                  opacity: 0.7,
                }}
              ></div>
            </div>

            {/* Distance marker - penalty spot indicator */}
            <div
              style={{
                position: "absolute",
                bottom: "38%",
                left: "50%",
                transform: "translateX(-50%)",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: "2px",
                  height: "60px",
                  background:
                    "linear-gradient(180deg, transparent, rgba(255,255,255,0.4))",
                  margin: "0 auto",
                }}
              ></div>
              <div
                style={{
                  width: "40px",
                  height: "2px",
                  background: "rgba(255,255,255,0.4)",
                  margin: "4px auto 0",
                }}
              ></div>
              <div
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.4)",
                  textAlign: "center",
                  marginTop: "2px",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                12 YDS
              </div>
            </div>
          </div>

          {/* Stadium stands - behind goal */}
          <div
            style={{
              position: "absolute",
              top: "-15%",
              left: "5%",
              right: "5%",
              height: "25%",
              background: `
                linear-gradient(180deg,
                  rgba(30,30,40,0.8) 0%,
                  rgba(20,20,30,0.9) 50%,
                  rgba(10,10,20,1) 100%
                )
              `,
              borderRadius: "20px 20px 0 0",
              transform: "translateZ(-80px) rotateX(-20deg)",
              boxShadow: `
                0 -20px 40px rgba(0,0,0,0.5),
                inset 0 20px 40px rgba(255,255,255,0.02)
              `,
              overflow: "hidden",
            }}
          >
            {/* Crowd rows */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `
                  repeating-linear-gradient(
                    180deg,
                    rgba(255,255,255,0.03) 0px,
                    rgba(255,255,255,0.03) 2px,
                    transparent 2px,
                    transparent 8px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    rgba(255,255,255,0.02) 0px,
                    rgba(255,255,255,0.02) 4px,
                    transparent 4px,
                    transparent 16px
                  )
                `,
                animation: "crowdRoar 3s ease-in-out infinite",
              }}
            ></div>
            {/* Stadium lights */}
            <div
              style={{
                position: "absolute",
                top: "10%",
                left: "10%",
                right: "10%",
                height: "4px",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,245,200,0.3), transparent)",
                borderRadius: "2px",
                boxShadow:
                  "0 0 20px rgba(255,245,200,0.5), 0 0 40px rgba(255,245,200,0.3)",
              }}
            ></div>
          </div>

          {/* Side stands */}
          <div
            style={{
              position: "absolute",
              top: "-10%",
              left: "-8%",
              width: "12%",
              height: "120%",
              background: `
                linear-gradient(90deg,
                  rgba(30,30,40,0.6) 0%,
                  rgba(20,20,30,0.8) 50%,
                  rgba(10,10,20,0.9) 100%
                )
              `,
              borderRadius: "0 0 15px 15px",
              transform: "translateZ(-60px) rotateY(15deg) rotateX(-10deg)",
              boxShadow: `
                -20px 0 40px rgba(0,0,0,0.4),
                inset 20px 0 40px rgba(255,255,255,0.01)
              `,
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              top: "-10%",
              right: "-8%",
              width: "12%",
              height: "120%",
              background: `
                linear-gradient(270deg,
                  rgba(30,30,40,0.6) 0%,
                  rgba(20,20,30,0.8) 50%,
                  rgba(10,10,20,0.9) 100%
                )
              `,
              borderRadius: "0 0 15px 15px",
              transform: "translateZ(-60px) rotateY(-15deg) rotateX(-10deg)",
              boxShadow: `
                20px 0 40px rgba(0,0,0,0.4),
                inset -20px 0 40px rgba(255,255,255,0.01)
              `,
            }}
          ></div>
        </div>

        {/* Header */}
        <div className="text-center mb-6 relative z-20">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 mb-2 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            PENALTY SHOOTOUT
          </h1>
          <p className="text-lg md:text-xl font-bold text-slate-300/80 tracking-wider">
            VS AI OPPONENT
          </p>
        </div>

        {/* Scoreboard */}
        <div className="flex justify-between w-full max-w-3xl mb-6 text-white relative z-20">
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
        <div className="mb-6 text-center h-12 relative z-20">
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

        {/* 3D Scene Container - Ball, GK, Targets */}
        <div
          className="relative"
          style={{
            width: "100%",
            maxWidth: "500px",
            aspectRatio: "1 / 1.3",
            transformStyle: "preserve-3d",
            transform: "rotateX(55deg) translateZ(-50px)",
            pointerEvents: "auto",
          }}
        >
          {/* Ball */}
          <div
            ref={ballRef}
            className="absolute"
            style={{
              transform: getBallTransform(),
              transformStyle: "preserve-3d",
              filter: ballTrajectory
                ? "drop-shadow(0 20px 30px rgba(0,0,0,0.4))"
                : "drop-shadow(0 10px 20px rgba(0,0,0,0.3))",
              transition: "filter 0.3s",
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            {/* Ball Shadow on field */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              style={{
                width: "36px",
                height: "12px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.3)",
                filter: "blur(3px)",
                transform:
                  "translateZ(-22px) translateY(14px) rotateX(-90deg) scale(0.8)",
                opacity: ballTrajectory ? 0.2 : 0.5,
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

              {/* Ball sphere - classic soccer ball pattern */}
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
                    transform: "translateY(-50%) translateZ(1px) rotate(90deg)",
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

          {/* Goalkeeper */}
          <div
            ref={gkRef}
            className="absolute"
            style={{
              transform: getGkTransform(),
              transformStyle: "preserve-3d",
              zIndex: 40,
              pointerEvents: "none",
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* GK Shadow */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              style={{
                width: "40px",
                height: "14px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.25)",
                filter: "blur(3px)",
                transform: "translateZ(-2px) translateY(18px) rotateX(-90deg)",
                opacity: 0.4,
              }}
            ></div>

            {/* 3D Goalkeeper */}
            <div
              className="relative"
              style={{
                width: "36px",
                height: "56px",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Body */}
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  left: "50%",
                  transform: "translateX(-50%) translateZ(0)",
                  width: "28px",
                  height: "36px",
                  background:
                    "linear-gradient(180deg, #1e40af 0%, #1e3a8a 50%, #172554 100%)",
                  borderRadius: "14px 14px 8px 8px",
                  boxShadow: `
                    inset -2px -2px 6px rgba(0,0,0,0.3),
                    inset 2px 2px 6px rgba(255,255,255,0.1),
                    0 4px 12px rgba(0,0,0,0.4)
                  `,
                  border: "1px solid #3b82f6",
                }}
              ></div>

              {/* Arms - diving position */}
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  left: "-10px",
                  width: "14px",
                  height: "32px",
                  background:
                    "linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%)",
                  borderRadius: "7px",
                  transform: "rotateZ(-30deg) translateZ(-2px)",
                  boxShadow:
                    "inset -1px -1px 4px rgba(0,0,0,0.3), 2px 2px 6px rgba(0,0,0,0.3)",
                  border: "1px solid #3b82f6",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "-10px",
                  width: "14px",
                  height: "32px",
                  background:
                    "linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%)",
                  borderRadius: "7px",
                  transform: "rotateZ(30deg) translateZ(-2px)",
                  boxShadow:
                    "inset 1px -1px 4px rgba(0,0,0,0.3), -2px 2px 6px rgba(0,0,0,0.3)",
                  border: "1px solid #3b82f6",
                }}
              ></div>

              {/* Head */}
              <div
                style={{
                  position: "absolute",
                  top: "-10px",
                  left: "50%",
                  transform: "translateX(-50%) translateZ(2px)",
                  width: "20px",
                  height: "20px",
                  background:
                    "linear-gradient(180deg, #fde0c0 0%, #f5c6a0 100%)",
                  borderRadius: "50%",
                  boxShadow: `
                    inset -1px -1px 4px rgba(0,0,0,0.2),
                    inset 1px 1px 4px rgba(255,255,255,0.2),
                    0 3px 8px rgba(0,0,0,0.3)
                  `,
                  border: "1px solid #e8c5a0",
                }}
              >
                {/* Helmet/Cap */}
                <div
                  style={{
                    position: "absolute",
                    top: "-3px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "22px",
                    height: "10px",
                    background:
                      "linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%)",
                    borderRadius: "11px 11px 4px 4px",
                    border: "1px solid #3b82f6",
                  }}
                ></div>
              </div>

              {/* Gloves */}
              <div
                style={{
                  position: "absolute",
                  top: "36px",
                  left: "-14px",
                  width: "16px",
                  height: "16px",
                  background:
                    "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)",
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  transform: "rotateZ(-30deg) translateZ(1px)",
                  boxShadow:
                    "inset -1px -1px 3px rgba(0,0,0,0.2), 2px 2px 6px rgba(0,0,0,0.3)",
                  border: "1px solid #f59e0b",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "36px",
                  right: "-14px",
                  width: "16px",
                  height: "16px",
                  background:
                    "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)",
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  transform: "rotateZ(30deg) translateZ(1px)",
                  boxShadow:
                    "inset 1px -1px 3px rgba(0,0,0,0.2), -2px 2px 6px rgba(0,0,0,0.3)",
                  border: "1px solid #f59e0b",
                }}
              ></div>
            </div>
          </div>

          {/* Target Zones - 3D Indicators on the field */}
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
              style={{ zIndex: 60, transform: "translateZ(50px)" }}
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
              style={{ zIndex: 60, transform: "translateZ(50px)" }}
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

        {/* Controls */}
        <div className="flex gap-4 w-full max-w-md mt-8 relative z-20">
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
