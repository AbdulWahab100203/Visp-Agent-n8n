import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  isTyping: boolean;
  createNewConversation: () => void;
  selectConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('chatConversations');
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      const conversationsWithDates = parsed.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      setConversations(conversationsWithDates);
    }
  }, []);

  // Save conversations to localStorage whenever conversations change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('chatConversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
  };

  const selectConversation = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (currentConversation?.id === id) {
      setCurrentConversation(null);
    }
  };

  const updateConversationTitle = (conversation: Conversation, firstMessage: string) => {
    // Generate a title from the first message (first 30 characters)
    const title = firstMessage.length > 30 
      ? firstMessage.substring(0, 30) + '...' 
      : firstMessage;
    
    return { ...conversation, title };
  };

  const sendMessage = async (content: string) => {
    if (!currentConversation || isLoading) return;

    setIsLoading(true);
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    let updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
      updatedAt: new Date(),
    };

    // Update title if this is the first message
    if (currentConversation.messages.length === 0) {
      updatedConversation = updateConversationTitle(updatedConversation, content);
    }

    setCurrentConversation(updatedConversation);
    setConversations(prev => 
      prev.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );

    try {
      setIsTyping(true);
      
      // Call n8n API service
      const response = await callApiService(content);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        updatedAt: new Date(),
      };

      setCurrentConversation(finalConversation);
      setConversations(prev => 
        prev.map(conv => 
          conv.id === finalConversation.id ? finalConversation : conv
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Add error handling UI
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // API call to n8n backend
  const callApiService = async (message: string): Promise<string> => {
    const { ApiService, isApiConfigured } = await import('@/config/api');
    
    console.log('🔍 Checking API configuration...');
    console.log('📡 API configured:', isApiConfigured());
    
    // Check if API is configured
    if (!isApiConfigured()) {
      console.log('⚠️ API not configured, using demo response');
      // Return demo response if API is not configured
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const responses = [
        "I understand your question. Let me provide you with a comprehensive answer that addresses the key points you've raised.",
        "That's an interesting perspective! Here's what I think about that topic based on current knowledge.",
        "I can help you with that. Let me break this down into clear, actionable steps.",
        "Thank you for your question. Here's a detailed response that should cover what you're looking for.",
        "Great question! This is actually a complex topic, so let me explain it thoroughly.",
      ];
      
      return responses[Math.floor(Math.random() * responses.length)] + 
        "\n\n**Note:** This is a demo response. To connect to your n8n backend, please configure your API URL in the .env file. See the README for setup instructions.";
    }
    
    try {
      console.log('🌐 Making API call to n8n webhook...');
      // Use the configured API service
      const response = await ApiService.sendMessage(message, currentConversation?.id);
      
      console.log('📨 Raw API response:', response);
      
      // Handle the nested response structure from your n8n webhook
      if (response && typeof response === 'object') {
        // Look for the nested output in the response structure
        const findOutput = (obj: any): string | null => {
          for (const key in obj) {
            if (typeof obj[key] === 'string' && key === 'output') {
              return obj[key];
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              const result = findOutput(obj[key]);
              if (result) return result;
            }
          }
          return null;
        };
        
        const output = findOutput(response);
        if (output) {
          console.log('✅ Found output in response:', output);
          return output;
        }
      }
      
      console.log('⚠️ No output found, using fallback response handling');
      // Fallback to original response handling
      return response.message || response.response || response.text || 'Sorry, I could not process your request.';
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to get response from AI assistant. Please check your n8n endpoint configuration.');
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        isLoading,
        isTyping,
        createNewConversation,
        selectConversation,
        sendMessage,
        deleteConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};