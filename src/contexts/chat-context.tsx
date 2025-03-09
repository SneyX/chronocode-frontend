
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useMobile } from '@/hooks/use-mobile';

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
  const isMobile = useMobile();
  
  // Set isChatOpen based on device - closed by default on mobile, open on desktop
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [highlightedCommits, setHighlightedCommits] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set initial state based on device when component mounts
  useEffect(() => {
    setIsChatOpen(!isMobile);
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
