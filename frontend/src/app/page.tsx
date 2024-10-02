'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LandingPage from '@/components/LandingPage'
import dynamic from 'next/dynamic'

const DynamicGame = dynamic(() => import('@/components/Game'), { ssr: false })

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const router = useRouter()

  const handleNPCInteraction = (npcId: string) => {
    console.log(`Interacting with NPC: ${npcId}`)
    // Add your interaction logic here
  }

  const handlePlayNow = () => {
    router.push('/game')
  }

  const handleQuit = () => {
    setGameStarted(false);
  };

  if (!gameStarted) {
    return <LandingPage onPlayNow={handlePlayNow} />
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 bg-gradient-to-b from-background to-accent">
      <h1 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">Athens Adventure</h1>
      <div className="w-full max-w-4xl aspect-square mb-4 game-container">
        <div className="game-overlay"></div>
        <DynamicGame 
          onNPCInteraction={handleNPCInteraction} 
          isPaused={isPaused} 
          onQuit={handleQuit}
        />
      </div>
      <button 
        onClick={() => setIsPaused(!isPaused)}
        className="px-6 py-3 bg-secondary text-foreground rounded-full hover:bg-opacity-80 transition-colors duration-200 font-semibold"
      >
        {isPaused ? 'Resume Game' : 'Pause Game'}
      </button>
    </main>
  )
}