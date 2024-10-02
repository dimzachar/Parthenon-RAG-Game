import React, { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
import MainScene from '@/components/MainScene';
import InitialPopup from '@/components/InitialPopup';
import InteractionPopup from '@/components/InteractionPopup';
import { IoMdVolumeHigh, IoMdVolumeOff } from 'react-icons/io';

interface GameProps {
  onNPCInteraction: (npcId: string) => void;
  isPaused: boolean;
  onQuit: () => void;
}

const Game: React.FC<GameProps> = ({ onNPCInteraction, isPaused, onQuit }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [showInitialPopup, setShowInitialPopup] = useState(false);
  const [showInteractionPopup, setShowInteractionPopup] = useState(false);
  const [npcData, setNpcData] = useState<{ npcId: string; npcInfo: { name: string; description: string } } | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        scale: {
          mode: Phaser.Scale.FIT,
          parent: 'game-container',
          width: 800,
          height: 600,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scene: [MainScene],
        input: {
          keyboard: {
            capture: []
          }
        },
        audio: {
          disableWebAudio: false
        }
      };

      gameRef.current = new Phaser.Game(config);

      const setupNPCInteraction = () => {
        const scene = gameRef.current?.scene.getScene('MainScene') as MainScene;
        if (scene) {
          scene.events.on('npcInteraction', (data: { npcId: string; npcInfo: { name: string; description: string } }) => {
            // console.log('NPC Interaction event received:', data);
            setNpcData(data);
            setShowInitialPopup(true);
            onNPCInteraction(data.npcId);
            scene.setInputEnabled(false);
          });
        }
      };

      gameRef.current.events.once('ready', setupNPCInteraction);

      return () => {
        if (gameRef.current) {
          const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
          scene?.events.off('npcInteraction');
          gameRef.current.destroy(true);
        }
      };
    }
  }, [onNPCInteraction]);

  useEffect(() => {
    const scene = gameRef.current?.scene.getScene('MainScene') as MainScene;
    if (scene) {
      if (isPaused) {
        scene.scene.pause();
        scene.toggleMusic(false);
      } else {
        scene.scene.resume();
        scene.toggleMusic(!isMuted);
      }
    }
  }, [isPaused, isMuted]);

  const handleExpandPopup = () => {
    setShowInitialPopup(false);
    setShowInteractionPopup(true);
    const scene = gameRef.current?.scene.getScene('MainScene') as MainScene;
    if (scene) {
      if (scene.scene.isActive()) {
        scene.scene.pause();
      }
      scene.setInputEnabled(false);
      scene.input.keyboard?.clearCaptures();
    }
  };

  const handleClosePopup = () => {
    setShowInitialPopup(false);
    setShowInteractionPopup(false);
    const scene = gameRef.current?.scene.getScene('MainScene') as MainScene;
    if (scene) {
      if (scene.scene.isPaused()) {
        scene.scene.resume();
      }
      scene.setInputEnabled(true);
      scene.input.keyboard?.addCapture('E');
    }
  };

  const handleMuteToggle = () => {
    const scene = gameRef.current?.scene.getScene('MainScene') as MainScene;
    if (scene) {
      if (isMuted) {
        scene.setMusicVolume(0.5);
      } else {
        scene.setMusicVolume(0);
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div id="game-container" className="w-full h-full bg-black" />
      <div className="absolute inset-0 pointer-events-none flex items-end justify-center">
        {showInitialPopup && npcData && (
          <InitialPopup
            npcId={npcData.npcId}
            npcInfo={npcData.npcInfo}
            onClose={handleClosePopup}
            onExpand={handleExpandPopup}
          />
        )}
      </div>
      {showInteractionPopup && npcData && (
        <InteractionPopup
          npcId={npcData.npcId}
          onClose={handleClosePopup}
        />
      )}
      <button
        onClick={handleMuteToggle}
        className="absolute top-4 left-4 z-50 bg-white bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all duration-200"
      >
        {isMuted ? <IoMdVolumeOff size={24} /> : <IoMdVolumeHigh size={24} />}
      </button>
    </div>
  );
};

export default Game;