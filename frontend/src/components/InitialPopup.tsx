import React, { useState, useEffect, useRef, useCallback } from 'react';
import { askQuestion, getFAQQuestions, FAQQuestion } from '@/services/api';
import { Copy, ThumbsUp, Bookmark, Bot, X } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { FiRefreshCw } from "react-icons/fi";

interface InitialPopupProps {
  npcId: string;
  npcInfo?: {
    name: string;
    description: string;
  };
  onClose: () => void;
  onExpand: () => void;
  gameHashtag?: string;
}

const InitialPopup: React.FC<InitialPopupProps> = ({ npcId, npcInfo, onClose, onExpand, gameHashtag }) => {
  const [fact, setFact] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const faqQuestionsRef = useRef<FAQQuestion[]>([]);
  const usedQuestionsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);

  const fetchFAQQuestions = useCallback(async () => {
    if (faqQuestionsRef.current.length > 0) return;
    try {
      const questions = await getFAQQuestions();
      faqQuestionsRef.current = questions;
    } catch (error) {
      console.error('Error fetching FAQ questions:', error);
      setError('Failed to fetch FAQ questions. Using default topics.');
    }
  }, []);

  const getRandomQuestion = useCallback(() => {
    if (faqQuestionsRef.current.length === 0) {
      throw new Error('No FAQ questions available');
    }

    let availableQuestions = faqQuestionsRef.current.filter(q => !usedQuestionsRef.current.has(q.text));
    if (availableQuestions.length === 0) {
      usedQuestionsRef.current.clear();
      availableQuestions = faqQuestionsRef.current;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    usedQuestionsRef.current.add(selectedQuestion.text);
    return selectedQuestion;
  }, []);

  const fetchRandomFact = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchFAQQuestions();
      const question = getRandomQuestion();
      const response = await askQuestion(
        `Generate a short, witty and engaging tweet inspired by this FAQ question about the Movement ecosystem: "${question.text}". The tweet should be informative yet fun, showcasing the innovative nature of Movement. Include technical details if relevant, but keep it accessible. Always mention @movementlabsxyz, include #GMove and use a playful tone. Limit strictly max 250 characters.`
      );
      setFact(response.answer);
    } catch (error) {
      console.error('Error fetching fact:', error);
      setError('Failed to fetch a fact. Please try again later.');
      setFact('Hi, Hero is that you?');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFAQQuestions, getRandomQuestion]);

  useEffect(() => {
    if (!isInitializedRef.current) {
      fetchRandomFact();
      isInitializedRef.current = true;
    }
  }, [fetchRandomFact]);

  const handleTwitterShare = () => {
    const hashtag = gameHashtag ? ` #${gameHashtag}` : '';
    const tweetText = encodeURIComponent(`${fact}${hashtag}`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(fact).then(() => {
      alert('Fact copied to clipboard!');
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <div className="popup-container w-[90%] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-[#d2b48c] rounded-lg p-2 sm:p-3 border-2 sm:border-4 border-[#8b4513] shadow-md flex flex-col items-start pointer-events-auto overflow-auto mb-4">
      <div className="flex items-start w-full mb-2">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-2 flex-shrink-0">
          <img src="/assets/frame5.png" alt="AI portrait" className="w-full h-full object-cover" />
        </div>
        <div className="flex-grow">
          <p className="text-xs sm:text-sm font-bold mb-1 text-[#333333]">Assistant</p>
          {isLoading ? (
            <p className="text-xs text-red-500">Loading...</p>
          ) : error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : (
            <p className="text-xs mb-2 text-[#333333]">{fact}</p>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center w-full">
        <div className="flex space-x-1">
          <button
            onClick={handleTwitterShare}
            className="bg-[#1DA1F2] text-white p-1 rounded-full hover:bg-[#1a91da] transition-colors"
            title="Share on Twitter"
          >
            <FaXTwitter size={12} className="sm:w-3 sm:h-3" />
          </button>
          <button
            onClick={handleCopyToClipboard}
            className="bg-[#6e5c62] text-white p-1 rounded-full hover:bg-[#5d4d52] transition-colors"
            title="Copy to clipboard"
          >
            <Copy size={12} className="sm:w-3 sm:h-3" />
          </button>
          <button
            onClick={fetchRandomFact}
            className="bg-[#4CAF50] text-white p-1 rounded-full hover:bg-[#45a049] transition-colors"
            title="Get a new fact"
            disabled={isLoading}
          >
            <FiRefreshCw size={12} className={`sm:w-3 sm:h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {showButtons && (
            <>
              <button
                onClick={handleLike}
                className={`p-1 rounded-full transition-colors ${
                  isLiked ? 'bg-[#4CAF50] text-white' : 'bg-gray-200 text-gray-600'
                }`}
                title="Like this fact"
              >
                <ThumbsUp size={12} className="sm:w-3 sm:h-3" />
              </button>
              <button
                onClick={handleBookmark}
                className={`p-1 rounded-full transition-colors ${
                  isBookmarked ? 'bg-[#FFA000] text-white' : 'bg-gray-200 text-gray-600'
                }`}
                title="Bookmark this fact"
              >
                <Bookmark size={12} className="sm:w-3 sm:h-3" />
              </button>
            </>
          )}
        </div>
        <div className="flex space-x-1">
          <button
            onClick={onExpand}
            className="bg-[#4CAF50] text-white p-1 rounded-full hover:bg-[#45a049] transition-colors"
            title="Chat with Assistant"
          >
            <Bot size={12} className="sm:w-3 sm:h-3" />
          </button>
          <button
            onClick={onClose}
            className="bg-[#FF5722] text-white p-1 rounded-full hover:bg-[#f44336] transition-colors"
            title="Close"
          >
            <X size={12} className="sm:w-3 sm:h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialPopup;