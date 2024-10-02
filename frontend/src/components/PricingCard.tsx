import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react'; // Import the Zap icon for the title

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ title, price, features, buttonText, popular }) => {
  return (
    <div className={`bg-gray-800 rounded-2xl p-6 flex flex-col ${popular ? 'border-2 border-blue-500' : 'border border-gray-700'}`}>
      <div className="flex items-center mb-4">
        <Zap className={`mr-2 ${popular ? 'text-blue-500' : 'text-gray-400'}`} size={24} />
        <h3 className="text-2xl font-bold">{title}</h3>
      </div>
      <p className="text-4xl font-bold mb-6">{price}</p>
      <Button 
        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 mb-6"
      >
        {buttonText}
      </Button>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PricingCard;