import React from 'react';

const AnimatedBlob = () => {
  return (
    <div className="blob-container">
      <div className="blob"></div>
      <style jsx>{`
        .blob-container {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
          filter: blur(40px);
          opacity: 0.7;
        }
        .blob {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #00FFFF, #8A2BE2);
          border-radius: 50%;
          animation: blobAnimation 10s ease-in-out infinite;
        }
        @keyframes blobAnimation {
          0%, 100% { border-radius: 50%; }
          25% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          50% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
          75% { border-radius: 30% 70% 70% 30% / 70% 30% 30% 70%; }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBlob;