import React, { useState, useRef, useEffect } from 'react';
import { askQuestion, submitFeedback, QuestionResponse, FeedbackResponse, getFAQQuestions, FAQQuestion } from '@/services/api';
import TextareaAutosize from 'react-textarea-autosize';
import { ArrowUp, Lightbulb, Brain, FlaskConical, Landmark, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import Attach from '@/components/Attach';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  speaker: 'user' | 'ai';
  text: string;
  timestamp: Date;
  conversationId?: string;
  feedback?: number;
  feedbackSubmitted?: boolean;
}

interface InteractionPopupProps {
  npcId: string;
  onClose: () => void;
}

const iconMap = [Lightbulb, Brain, FlaskConical, Landmark];

const defaultQuestions: FAQQuestion[] = [
  { text: "How do I start playing Infinite Seas?", document_id: "", chunk_id: "" },
  { text: "What are the main features of the game?", document_id: "", chunk_id: "" },
  { text: "How does trading work in Infinite Seas?", document_id: "", chunk_id: "" },
  { text: "Can I explore different islands?", document_id: "", chunk_id: "" },
];

const InteractionPopup: React.FC<InteractionPopupProps> = ({ npcId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [faqQuestions, setFaqQuestions] = useState<FAQQuestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFAQQuestions();
  }, []);

  const fetchFAQQuestions = async () => {
    try {
      const questions = await getFAQQuestions();
      if (questions.length > 0) {
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        setFaqQuestions(shuffled.slice(0, 4));
      } else {
        throw new Error('No FAQ questions received from server');
      }
    } catch (error) {
      console.error('Error fetching FAQ questions:', error);
      setFaqQuestions(defaultQuestions);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      speaker: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response: QuestionResponse = await askQuestion(inputText);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        speaker: 'ai',
        text: response.answer,
        timestamp: new Date(),
        conversationId: response.conversation_id,
        feedbackSubmitted: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        speaker: 'ai',
        text: "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFAQClick = (question: string) => {
    setInputText(question);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Optionally, you can add a toast notification here to indicate successful copy
  };

  const handleFeedback = async (messageId: string, feedbackValue: number) => {
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return;

    const message = messages[messageIndex];
    if (message.conversationId && !message.feedbackSubmitted) {
      try {
        const response: FeedbackResponse = await submitFeedback(message.conversationId, feedbackValue, 'interaction');
        console.log('Feedback submitted successfully:', response.message);
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === messageId ? { ...msg, feedback: feedbackValue, feedbackSubmitted: true } : msg
          )
        );
      } catch (error) {
        console.error('Error submitting feedback:', error);
      }
    }
  };

  const renderMessage = (text: string) => (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <div className="relative group">
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
              <button
                onClick={() => handleCopyCode(String(children))}
                className="absolute top-2 right-2 bg-gray-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Copy code"
              >
                <Copy size={16} />
              </button>
            </div>
          ) : (
            <code className={`${className} bg-gray-800 rounded px-1`} {...props}>
              {children}
            </code>
          );
        },
        strong: ({ node, ...props }) => <span className="font-bold text-yellow-400" {...props} />,
      }}
    >
      {text}
    </ReactMarkdown>
  );

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] text-white rounded-xl shadow-lg w-full max-w-5xl max-h-[100vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Talking to Assistant</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.speaker === 'user' ? 'justify-end' : 'justify-start'
              } mb-4`}
            >
              <div
                className={`max-w-[70%] ${
                  message.speaker === 'user' ? 'bg-blue-600' : 'bg-gray-700'
                } rounded-lg p-3 break-words`}
              >
                {renderMessage(message.text)}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400 mr-2">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(message.text)}
                      className="text-gray-400 hover:text-white p-1"
                      title="Copy message"
                    >
                      <Copy size={16} />
                    </button>
                    {message.speaker === 'ai' && (
                      <>
                        <button 
                          className={`text-gray-400 hover:text-white ${message.feedback === 1 ? 'text-green-500' : ''}`} 
                          title="Thumbs up"
                          onClick={() => handleFeedback(message.id, 1)}
                          disabled={message.feedbackSubmitted}
                        >
                          <ThumbsUp size={16} />
                        </button>
                        <button 
                          className={`text-gray-400 hover:text-white ${message.feedback === -1 ? 'text-red-500' : ''}`} 
                          title="Thumbs down"
                          onClick={() => handleFeedback(message.id, -1)}
                          disabled={message.feedbackSubmitted}
                        >
                          <ThumbsDown size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-700">
          <div className="relative mb-2 flex items-center w-full">
            <TextareaAutosize
              value={inputText}
              onChange={handleChange}
              onKeyUp={(e) => e.key === 'Enter' && !e.shiftKey && !isLoading && handleSendMessage()}
              placeholder="Ask a question..."
              className="flex-grow bg-[#2a2a2a] text-white border-none rounded-full py-3 pl-12 pr-12 focus:outline-none focus:ring-1 focus:ring-gray-500 resize-none"
              minRows={1}
              maxRows={4}
            />
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center">
              <Attach />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#3a3a3a] text-white rounded-full p-2 hover:bg-[#4a4a4a] transition duration-200 disabled:bg-[#2a2a2a] disabled:text-gray-500"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {faqQuestions.map((question, index) => {
              const Icon = iconMap[index];
              return (
                <button
                  key={index}
                  onClick={() => handleFAQClick(question.text)}
                  className="bg-[#2a2a2a] text-white p-3 rounded-md text-sm hover:bg-[#3a3a3a] transition duration-200 border border-gray-700 flex items-start space-x-3"
                >
                  <Icon className="w-6 h-6 flex-shrink-0 mt-1" />
                  <span className="text-left">{question.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractionPopup;