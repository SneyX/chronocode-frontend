
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Commit } from '@/types';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  relatedCommits?: string[]; // Array of commit SHAs that are related to this message
}

interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  filteredCommitShas: string[] | null;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setIsOpen: (isOpen: boolean) => void;
  clearFilteredCommits: () => void;
  handleUserMessage: (content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Mock responses for example repository with related commits
const mockResponses: Record<string, { content: string; relatedCommits: string[] }> = {
  "authentication changes": {
    content: "The authentication system changes were motivated by several factors: 1) Security vulnerabilities identified in the previous JWT implementation, 2) User feedback indicating login failures were too frequent (35% reduction after changes), and 3) The need to support social authentication providers. The changes were initiated after security audits conducted in March.",
    relatedCommits: ['2', '3', '6'] // These are the SHAs of authentication-related commits
  },
  "performance optimizations": {
    content: "The performance optimization in data fetching reduced load times by 65%. Key changes included implementing Redis-based caching with a 15-minute TTL for frequently accessed data, introducing pagination for large result sets, and optimizing database queries by adding indexes on commonly filtered fields. This was a direct response to user complaints about slow loading in the dashboard.",
    relatedCommits: ['8']
  },
  "architecture evolve": {
    content: "The project began as a monolith and gradually evolved to a microservices approach. The first major architectural shift occurred 8 months ago when the authentication system was decoupled. This pattern continued with 5 more components becoming standalone services. The motivation was to improve scalability and team autonomy, allowing different teams to work on different services independently.",
    relatedCommits: ['1', '9']
  },
  "security improvements": {
    content: "Recent security improvements include: 1) Fixing an XSS vulnerability in user input rendering, 2) Implementing CSP headers to prevent unauthorized script execution, 3) Adding rate limiting to prevent brute force attacks, and 4) Upgrading dependencies with known vulnerabilities. These changes were prioritized after a security audit identified these as high-risk issues.",
    relatedCommits: ['7', '5']
  },
  "features implemented": {
    content: "The key features implemented include: 1) User authentication with multiple providers, 2) Real-time data synchronization, 3) Advanced search capabilities with filters, 4) Data visualization dashboards, and 5) Role-based access control. The most recent feature addition was the advanced search capability, which was requested by users to help them find information more efficiently.",
    relatedCommits: ['2', '4', '6', '8']
  }
};

// Find the most relevant response based on user query
const findRelevantResponse = (query: string): { content: string; relatedCommits: string[] } => {
  const lowercaseQuery = query.toLowerCase();
  
  // Check for exact matches in the mockResponses keys
  for (const [key, response] of Object.entries(mockResponses)) {
    if (lowercaseQuery.includes(key)) {
      return response;
    }
  }
  
  // If no exact match, check for partial matches
  for (const [key, response] of Object.entries(mockResponses)) {
    const keywords = key.split(' ');
    for (const keyword of keywords) {
      if (lowercaseQuery.includes(keyword) && keyword.length > 3) {
        return response;
      }
    }
  }
  
  // Default response if no match found
  return {
    content: "I don't have specific information about that in my current data. As more commits are analyzed, I'll be able to provide more insights about this topic.",
    relatedCommits: []
  };
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      content: "Hi there! I'm Chronocode's AI assistant. I can answer questions about your code history and architecture. What would you like to know?",
      role: 'assistant',
      timestamp: new Date(),
      relatedCommits: []
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCommitShas, setFilteredCommitShas] = useState<string[] | null>(null);

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // If this is an assistant message with related commits, update filtered commits
    if (message.role === 'assistant' && message.relatedCommits && message.relatedCommits.length > 0) {
      setFilteredCommitShas(message.relatedCommits);
    }
  };

  const clearFilteredCommits = () => {
    setFilteredCommitShas(null);
  };

  const handleUserMessage = async (content: string) => {
    // Add user message
    addMessage({
      content,
      role: 'user'
    });
    
    // Simulate AI response with a delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const { content: responseContent, relatedCommits } = findRelevantResponse(content);
        
        addMessage({
          content: responseContent,
          role: 'assistant',
          relatedCommits
        });
        
        resolve();
      }, 1000);
    });
  };

  return (
    <ChatContext.Provider value={{
      messages,
      isOpen,
      filteredCommitShas,
      addMessage,
      setIsOpen,
      clearFilteredCommits,
      handleUserMessage
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
