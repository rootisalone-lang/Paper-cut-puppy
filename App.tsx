import React, { useState, useCallback, useRef } from 'react';
import { Puppy } from './components/Puppy';
import { Controls } from './components/Controls';
import { generatePuppyImage } from './services/geminiService';
import { removeWhiteBackground } from './services/imageProcessing';
import { Position, GenerationStatus } from './types';

const App: React.FC = () => {
  const [puppyImage, setPuppyImage] = useState<string | null>(null);
  const [targetPos, setTargetPos] = useState<Position>({ 
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, 
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 
  });
  
  const [genStatus, setGenStatus] = useState<GenerationStatus>({
    isGenerating: false,
    error: null
  });

  const handleGenerate = useCallback(async () => {
    setGenStatus({ isGenerating: true, error: null });
    try {
      const rawBase64Image = await generatePuppyImage();
      // Process the image to remove the white background
      const transparentImage = await removeWhiteBackground(rawBase64Image);
      setPuppyImage(transparentImage);
    } catch (err: any) {
      setGenStatus(prev => ({ 
        ...prev, 
        error: "Failed to generate puppy. Is your API Key set?" 
      }));
      console.error(err);
    } finally {
      setGenStatus(prev => ({ ...prev, isGenerating: false }));
    }
  }, []);

  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!puppyImage) return;

    // Get click coordinates relative to the viewport
    const x = e.clientX;
    const y = e.clientY;
    
    setTargetPos({ x, y });
    
    createRipple(x, y);
  };

  const createRipple = (x: number, y: number) => {
    const ripple = document.createElement('div');
    ripple.className = 'absolute w-4 h-4 bg-red-500/30 rounded-full animate-ping pointer-events-none';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden paper-texture select-none"
      onClick={handleStageClick}
    >
      {/* Background Decor: Traditional Chinese Window Pattern Hints */}
      <div className="absolute inset-0 pointer-events-none opacity-10 flex justify-between p-8">
        <div className="border-4 border-red-800 w-24 h-full rounded-full grid grid-rows-6 gap-2">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-red-800 w-full h-full rounded-full"></div>)}
        </div>
        <div className="border-4 border-red-800 w-24 h-full rounded-full grid grid-rows-6 gap-2">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-red-800 w-full h-full rounded-full"></div>)}
        </div>
      </div>

      <div className="absolute top-8 left-8 pointer-events-none">
        <h1 className="text-5xl text-red-700 font-['Zhi_Mang_Xing'] drop-shadow-sm">
          剪纸小狗
        </h1>
        <p className="text-red-900/60 font-serif mt-2 ml-1 text-sm tracking-widest uppercase">
          Paper Cut Puppy Interaction
        </p>
      </div>

      {/* Main Puppy Component */}
      {puppyImage && (
        <Puppy 
          imageSrc={puppyImage} 
          targetPosition={targetPos} 
        />
      )}

      {/* Controls */}
      <Controls 
        onGenerate={handleGenerate} 
        status={genStatus}
        hasPuppy={!!puppyImage}
      />

      {/* Empty State / Welcome */}
      {!puppyImage && !genStatus.isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center opacity-40">
            <div className="text-9xl mb-4">🐕</div>
            <p className="text-xl text-red-900">Waiting for a puppy to be cut...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;