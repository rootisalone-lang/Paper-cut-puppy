import React, { useEffect, useState, useRef } from 'react';
import { Position } from '../types';

interface PuppyProps {
  targetPosition: Position;
  imageSrc: string;
}

const SPEED_PX_PER_SEC = 500;
const PUPPY_SIZE = 140;

export const Puppy: React.FC<PuppyProps> = ({ targetPosition, imageSrc }) => {
  // We use currentPos to control the CSS 'left' and 'top'
  const [currentPos, setCurrentPos] = useState<Position>({ 
    x: window.innerWidth / 2, 
    y: window.innerHeight / 2 
  });
  
  const [status, setStatus] = useState<'idle' | 'reacting' | 'moving'>('idle');
  const [facingRight, setFacingRight] = useState(true);
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [durationSec, setDurationSec] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  useEffect(() => {
    // 1. Capture current visual position to handle mid-animation interruptions smoothly
    let startX = currentPos.x;
    let startY = currentPos.y;

    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // rect is relative to viewport, which matches our coordinate system
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
    }

    // Clear any pending state changes from previous clicks
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];

    // 2. "Freeze" the puppy at its current actual visual location
    setTransitionEnabled(false);
    setCurrentPos({ x: startX, y: startY });
    
    // 3. Calculate distance to new target
    const dx = targetPosition.x - startX;
    const dy = targetPosition.y - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Ignore tiny movements
    if (distance < 10) return;

    // 4. Calculate new facing direction, but DO NOT apply it yet. 
    // We want the puppy to "notice" (react) first, THEN turn to run.
    const shouldFaceRight = dx > 0;
    const shouldFaceLeft = dx < 0;

    // 5. Start Reaction Phase
    setStatus('reacting');

    // 6. Schedule Movement Phase after reaction time
    const REACTION_TIME_MS = 500;
    
    const reactionTimeout = setTimeout(() => {
       // NOW we turn the puppy to face the destination, just before running
       if (shouldFaceRight) setFacingRight(true);
       if (shouldFaceLeft) setFacingRight(false);

       setStatus('moving');
       setTransitionEnabled(true);
       
       const moveDuration = distance / SPEED_PX_PER_SEC;
       setDurationSec(moveDuration);
       
       // Trigger the CSS transition to the new target
       setCurrentPos(targetPosition);

       // 7. Schedule Idle Phase after movement completes
       const idleTimeout = setTimeout(() => {
         setStatus('idle');
         setTransitionEnabled(false); 
       }, moveDuration * 1000);
       
       timeoutsRef.current.push(idleTimeout);

    }, REACTION_TIME_MS);

    timeoutsRef.current.push(reactionTimeout);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPosition]);

  return (
    <>
      <style>{`
        @keyframes puppyRun {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-20px) rotate(5deg) scale(1.05); }
          50% { transform: translateY(0) rotate(0deg) scale(1); }
          75% { transform: translateY(-15px) rotate(-5deg) scale(1.05); }
          100% { transform: translateY(0) rotate(0deg) scale(1); }
        }
        @keyframes puppyIdle {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.03, 0.97); }
        }
        @keyframes puppyReact {
          0% { transform: scale(1); }
          40% { transform: scale(1.2) translateY(-10px); }
          80% { transform: scale(0.95) translateY(0); }
          100% { transform: scale(1); }
        }
        @keyframes bubblePop {
          0% { transform: translate(-50%, 10px) scale(0); opacity: 0; }
          60% { transform: translate(-50%, -10px) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }
        .animate-puppy-run {
          animation: puppyRun 0.35s infinite linear;
        }
        .animate-puppy-idle {
          animation: puppyIdle 2.5s infinite ease-in-out;
        }
        .animate-puppy-react {
          animation: puppyReact 0.4s ease-out forwards;
        }
        .animate-bubble {
          animation: bubblePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      <div
        ref={containerRef}
        className="absolute z-10"
        style={{
          left: currentPos.x,
          top: currentPos.y,
          width: PUPPY_SIZE,
          height: PUPPY_SIZE,
          pointerEvents: 'none',
          // Only transition when actually moving to destination
          transition: transitionEnabled ? `left ${durationSec}s linear, top ${durationSec}s linear` : 'none',
          transform: `translate(-50%, -50%)`,
        }}
      >
        {/* Interaction Bubble */}
        {status === 'reacting' && (
             <div className="absolute -top-16 left-1/2 w-full flex justify-center animate-bubble z-20">
                <div className="bg-white border-4 border-red-600 rounded-full w-12 h-12 flex items-center justify-center shadow-lg relative">
                    <span className="text-red-600 font-extrabold text-2xl leading-none mt-1">!</span>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-red-600"></div>
                </div>
             </div>
        )}

        {/* Puppet Container for flipping */}
        <div 
          className="w-full h-full will-change-transform"
          style={{
            // Assuming image faces right by default (enforced in prompt).
            // If facingRight is true -> scaleX(1) (No flip)
            // If facingRight is false -> scaleX(-1) (Flip horizontally)
            transform: `${facingRight ? 'scaleX(1)' : 'scaleX(-1)'}`,
            transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Animation Container */}
          <div className={`w-full h-full origin-bottom 
            ${status === 'moving' ? 'animate-puppy-run' : ''} 
            ${status === 'idle' ? 'animate-puppy-idle' : ''}
            ${status === 'reacting' ? 'animate-puppy-react' : ''}
          `}>
            <img 
              src={imageSrc} 
              alt="Paper Cut Puppy" 
              className="w-full h-full object-contain filter drop-shadow-xl"
            />
          </div>
        </div>
      </div>
    </>
  );
};