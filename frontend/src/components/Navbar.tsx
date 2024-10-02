import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 px-4 py-2">
      <div className="max-w-4xl mx-auto bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-full px-6 py-3 flex justify-between items-center border border-white border-opacity-20 shadow-lg">
        <div className="w-1/5">
          <div className="text-2xl font-bold text-white">GMOVE</div>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden md:flex space-x-8 justify-center w-3/5">
          <a href="#features" className="text-gray-300 hover:text-cyan-400 transition-colors">Features</a>
          <a href="#pricing" className="text-gray-300 hover:text-cyan-400 transition-colors">Pricing</a>
          <a href="#waitlist" className="text-gray-300 hover:text-cyan-400 transition-colors">Waitlist</a>
        </div>
        
        {/* Mobile menu button */}
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu />
        </button>
        
        <div className="w-1/5 flex justify-end">
          <Link href="/game" target="_blank" rel="noopener noreferrer">  
            <Button className="bg-yellow-500 text-black px-6 py-2 rounded-full text-sm font-semibold hover:bg-yellow-400 transition-all duration-300">
              LAUNCH GAME
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg mt-2 py-2 px-4 rounded-lg border border-white border-opacity-20 shadow-lg">
          <a href="#features" className="block py-2 text-gray-300 hover:text-cyan-400 transition-colors">Features</a>
          <a href="#pricing" className="block py-2 text-gray-300 hover:text-cyan-400 transition-colors">Pricing</a>
          <a href="#help" className="block py-2 text-gray-300 hover:text-cyan-400 transition-colors">Help Center</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;