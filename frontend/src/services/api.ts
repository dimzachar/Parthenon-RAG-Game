import axios from 'axios';

const API_URL = 'http://localhost:5000';  // Ensure this matches your backend URL

export interface QuestionResponse {
  conversation_id: string;
  answer: string;
}

export interface FeedbackResponse {
  message: string;
}

export interface FAQQuestion {
  text: string;
  document_id: string;
  chunk_id: string;
}

const feedbackSubmitted = new Set<string>();

export const askQuestion = async (question: string): Promise<QuestionResponse> => {
  try {
    // console.log('Sending question to backend:', question);
    const response = await axios.post<QuestionResponse>(`${API_URL}/question`, {
      question,
      selected_model: 'gpt-4o-mini',
    });
    // console.log('Received response from backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error asking question:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
    }
    throw new Error('Failed to fetch a response. Please try again later.');
  }
};

export const getFAQQuestions = async (): Promise<FAQQuestion[]> => {
  try {
    const response = await axios.get<{ faq_questions: FAQQuestion[] }>(`${API_URL}/faq`);
    return response.data.faq_questions;
  } catch (error) {
    console.error('Error fetching FAQ questions:', error);
    throw new Error('Failed to fetch FAQ questions. Please try again later.');
  }
};

export const submitFeedback = async (conversationId: string, feedback: number): Promise<FeedbackResponse> => {
  if (feedbackSubmitted.has(conversationId)) {

    // console.log('Feedback already submitted for this conversation');

    return { message: 'Feedback already submitted' };

  }

  try {
    console.log('Sending feedback to backend:', { conversationId, feedback });
    const response = await axios.post<FeedbackResponse>(`${API_URL}/feedback`, {
      conversation_id: conversationId,
      feedback: feedback,
    });
    
    // console.log('Received feedback response from backend:', response.data);
    feedbackSubmitted.add(conversationId);

    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
    }
    throw new Error('Failed to submit feedback. Please try again later.');
  }
};