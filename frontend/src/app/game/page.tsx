'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RiFullscreenFill, RiFullscreenExitFill } from 'react-icons/ri';

const DynamicGame = dynamic(() => import('@/components/Game'), { ssr: false });

export default function GamePage() {
  const [isPaused, setIsPaused] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const router = useRouter();

  const handleNPCInteraction = (npcId: string) => {
    // console.log(`Interacting with NPC: ${npcId}`);
  };

  const handleQuit = () => {
    router.push('/');
  };

  const handleToggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullScreenChange);
    };
  }, []);

  return (
    <main className="relative">
      <div className="game-wrapper">
        <DynamicGame
          onNPCInteraction={handleNPCInteraction}
          isPaused={isPaused}
          onQuit={handleQuit}
        />
        <button
          onClick={handleToggleFullScreen}
          className="absolute top-4 right-4 z-50 bg-white bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all duration-200"
        >
          {isFullScreen ? <RiFullscreenExitFill size={24} /> : <RiFullscreenFill size={24} />}
        </button>
      </div>
    </main>
  );
}