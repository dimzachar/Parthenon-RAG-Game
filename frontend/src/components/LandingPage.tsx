import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, MessageSquare, Book, Sword, Wrench } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import AnimatedBlob from '@/components/AnimatedBlob';
import Link from 'next/link';
import GamePreview from '@/components/GamePreview';

const LandingPage = () => {
  const heroRef = useRef(null);
  const gamePreviewRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const gamePreviewY = useTransform(scrollYProgress, [0, 1], ["55%", "0%"]);
  useEffect(() => {

    const checkMobile = () => {

      setIsMobile(window.innerWidth < 768);

    };



    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);

  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-phudu">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[150vh] flex flex-col items-center justify-start pt-40 sm:pt-32 md:pt-40 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50" style={{ filter: 'url(#noiseFilter)' }}></div>
        <AnimatedBlob />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 mb-8 sm:mb-12 md:mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-10 sm:mb-8 md:mb-10 leading-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-shadow-glow"
          >
            STUDY. BATTLE. BUILD
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-white font-semibold text-shadow"
          >
            Master the Movement, Conquer the Chain
          </motion.p>
          <Link href="/game" target="_blank" rel="noopener noreferrer">    
            <Button className="bg-yellow-500 hover:bg-yellow-400 text-black transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg hover:shadow-yellow-400/50 mb-8 transform hover:scale-105">
              PLAY NOW
            </Button>
          </Link>
          
        </div>
        <motion.div 
          ref={gamePreviewRef}
          style={{ y: isMobile ? 0 : gamePreviewY }}

          className={`${isMobile ? 'relative' : 'absolute top-[22vh]'} left-0 right-0 w-full max-w-5xl mx-auto px-4 mt-8 md:mt-0`}
        >
          <GamePreview />
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 sm:mb-16 text-center">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <Book size={48} className="mx-auto mb-4 sm:mb-6 text-cyan-400" />
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Study</h3>
              <p className="text-gray-300 text-base sm:text-lg">Explore a vibrant, ever-evolving digital realm that mirrors the MovementLabs ecosystem.</p>
            </div>
            <div className="text-center">
              <Sword size={48} className="mx-auto mb-4 sm:mb-6 text-yellow-500" />
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Battle</h3>
              <p className="text-gray-300 text-base sm:text-lg">Encounter AI-powered NPCs and test your knowledge in exciting challenges.</p>
            </div>
            <div className="text-center">
              <Wrench size={48} className="mx-auto mb-4 sm:mb-6 text-green-500" />
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Build</h3>
              <p className="text-gray-300 text-base sm:text-lg">Become an active contributor to the MovementLabs community by creating and sharing your own content.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 md:py-24 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 sm:mb-16 text-center">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-lg p-6 sm:p-8 hover:shadow-lg transition-all duration-300 border border-gray-700 transform hover:scale-105">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Free</h3>
              <p className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">$0/month</p>
              <ul className="mb-6 sm:mb-8">
                <li className="mb-2">• Basic AI assistance</li>
              </ul>
              <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300">
                Start for free
              </Button>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 sm:p-8 hover:shadow-lg transition-all duration-300 border border-gray-700 transform hover:scale-105">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Basic</h3>
              <p className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">$TBA/month</p>
              <ul className="mb-6 sm:mb-8">
                <li className="mb-2">• TBA</li>
              </ul>
              <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300">
                Upgrade
              </Button>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 sm:p-8 hover:shadow-lg transition-all duration-300 border border-cyan-400 transform hover:scale-105 relative">
              <div className="absolute top-0 right-0 bg-cyan-400 text-black font-bold py-1 px-3 sm:px-4 text-xs sm:text-sm rounded-tr-lg rounded-bl-lg">
                RECOMMENDED
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Pro</h3>
              <p className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">$TBA/month</p>
              <ul className="mb-6 sm:mb-8">
                <li className="mb-2">• TBA</li>
              </ul>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-white transition-all duration-300">
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-2">GMOVE</h3>
              <p className="text-gray-400 text-sm">Your super smart knowledge hub.</p>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-4">QUICK LINKS</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">HOME</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">FEATURES</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">PRICING</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-4">LEGAL</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">TERMS OF SERVICE</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">PRIVACY POLICY</a></li>
              </ul>
            </div>
            <div id="waitlist" className="flex flex-col">
              <h4 className="text-base font-semibold mb-4">STAY CONNECTED</h4>
              <Link href="https://airtable.com/appD6ixDtN668yZg1/shruFO1JIRDN21uJJ" target="_blank" rel="noopener noreferrer">
                <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 text-sm mb-4 w-full sm:w-auto">
                  JOIN WAITLIST
                </Button>
              </Link>
              <div className="flex space-x-4 mt-2">
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors"><FaXTwitter size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors"><MessageSquare size={20} /></a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
            <p>&copy; 2024 GMOVE. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>

      {/* Noise Filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
          </filter>
        </defs>
      </svg>

      <style jsx global>{`
        .text-shadow-glow {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3);
        }
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;