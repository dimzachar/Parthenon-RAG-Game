import React, { useState } from 'react';
import { Play } from 'lucide-react';

const GamePreview = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    // Logic to actually start the video would go here
  };

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-cyan-400/30">
      {/* Fake browser chrome */}
      <div className="bg-gray-200 p-2 flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-grow bg-white rounded px-2 py-1 text-xs md:text-sm text-gray-600 truncate">
          
        </div>
      </div>
      
      {/* Game preview area */}
      <div className="relative bg-gray-900 aspect-video">
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 md:p-4 transition-colors duration-300 transform hover:scale-110 shadow-lg hover:shadow-blue-500/50"
            >
              <Play size={24} />
            </button>
          </div>
        )}
        {isPlaying ? (
          <video
            className="w-full h-full"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="assets/Parthenon.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src="assets/Parthenon.png?height=720&width=1280"
            alt="Game Preview"
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
};

export default GamePreview;