
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatContextProps {
  isChatOpen: boolean;
  toggleChat: () => void;
  highlightedCommits: string[];
  setHighlightedCommits: (commits: string[]) => void;
  currentQuestion: string | null;
  setCurrentQuestion: (question: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  // Start with chat closed by default on all devices
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [highlightedCommits, setHighlightedCommits] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Set initial state based on device when component mounts
  useEffect(() => {
    // Use a small delay before initializing the chat state
    // to ensure components are fully rendered first
    const timer = setTimeout(() => {
      setIsChatOpen(!isMobile);
      setIsInitialized(true);
    }, 500); // 500ms delay before opening on desktop
    
    return () => clearTimeout(timer);
  }, [isMobile]);

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
    
    // Clear highlighted commits when closing the chat
    if (isChatOpen) {
      setHighlightedCommits([]);
      setCurrentQuestion(null);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        isChatOpen,
        toggleChat,
        highlightedCommits,
        setHighlightedCommits,
        currentQuestion,
        setCurrentQuestion,
        isLoading,
        setIsLoading
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
