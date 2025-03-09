
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ChatContextProps {
  isChatOpen: boolean;
  toggleChat: () => void;
  highlightedCommits: string[];
  setHighlightedCommits: (commits: string[]) => void;
  currentQuestion: string | null;
  setCurrentQuestion: (question: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  resetChat: () => void;
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
  // Set isChatOpen to true by default
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [highlightedCommits, setHighlightedCommits] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
    
    // Clear highlighted commits when closing the chat
    if (isChatOpen) {
      setHighlightedCommits([]);
      setCurrentQuestion(null);
    }
  };
  
  const resetChat = () => {
    setHighlightedCommits([]);
    setCurrentQuestion(null);
    setIsLoading(false);
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
        setIsLoading,
        resetChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
