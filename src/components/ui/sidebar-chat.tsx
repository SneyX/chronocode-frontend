
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Commit } from '@/types';
import { X, Send, Loader2, MessageCircle, HelpCircle, GitCommit } from 'lucide-react';
import { toast } from 'sonner';
import { useChat } from '@/contexts/chat-context';
import CommitModal from '@/components/ui/commit-modal';
import { queryCommits } from '@/services/github-service';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  relatedCommits?: string[];
  timestamp: Date;
}

interface SidebarChatProps {
  repoName?: string;
  repoId?: string;
  commits: Commit[];
  className?: string;
  isExample?: boolean;
}

// Predefined questions with their responses and related commits
const predefinedQuestions = [
  {
    question: "What motivated the authentication changes?",
    response: "The authentication changes were motivated by security concerns and the need to implement better user experience. The team identified several vulnerabilities in the previous implementation and decided to upgrade to JWT-based authentication with better password handling.",
    relatedCommits: ['2', '3', '6']
  },
  {
    question: "How did the performance optimizations improve the system?",
    response: "The performance improvements were focused on optimizing database queries and implementing caching mechanisms, which reduced load times by 65%. This was a response to user feedback about slow page rendering, especially on mobile devices.",
    relatedCommits: ['8']
  },
  {
    question: "What security improvements were made to the system?",
    response: "Security enhancements were implemented to address potential vulnerabilities, including XSS protection and better input validation. These changes were part of a broader security audit conducted in Q2.",
    relatedCommits: ['7']
  }
];

// Mock responses for demo purposes (in addition to predefined ones)
const mockResponses: Record<string, { response: string; relatedCommits: string[] }> = {
  'authentication': {
    response: 'The authentication changes were motivated by security concerns and the need to implement better user experience. The team identified several vulnerabilities in the previous implementation and decided to upgrade to JWT-based authentication with better password handling.',
    relatedCommits: ['2', '3', '6']
  },
  'performance': {
    response: 'The performance improvements were focused on optimizing database queries and implementing caching mechanisms to reduce load times. This was a response to user feedback about slow page rendering, especially on mobile devices.',
    relatedCommits: ['8']
  },
  'security': {
    response: 'Security enhancements were implemented to address potential vulnerabilities, including XSS protection and better input validation. These changes were part of a broader security audit conducted in Q2.',
    relatedCommits: ['7']
  },
  'release': {
    response: 'The v1.0.0 release marked the first stable production version after completing all core functionality and fixing critical bugs. It included final documentation updates and version bumps.',
    relatedCommits: ['9']
  },
  'setup': {
    response: 'The initial project setup established the foundational structure and dependencies needed for development. This included configuration files and basic project architecture.',
    relatedCommits: ['1']
  },
  'user': {
    response: 'The user management features were focused on creating a comprehensive profile system where users can manage their information and preferences. This was implemented based on user feedback requesting more control over their accounts.',
    relatedCommits: ['4']
  }
};

const SidebarChat: React.FC<SidebarChatProps> = ({
  repoName,
  repoId,
  commits,
  className,
  isExample = false
}) => {
  const { isChatOpen, toggleChat, setHighlightedCommits, setCurrentQuestion, isLoading, setIsLoading } = useChat();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi! I'm your repository assistant. Ask me about commits or development decisions in ${repoName || 'this repository'}.`,
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommits, setSelectedCommits] = useState<string[]>([]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion(inputValue);
    setInputValue('');
    setIsLoading(true);
    
    // For real repositories with repoId, use the queryCommits API
    if (!isExample && repoId) {
      try {
        const response = await queryCommits({
          repository_id: repoId,
          query: userMessage.content,
          k: 5 // Default to 5 results
        });
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.response,
          sender: 'assistant',
          relatedCommits: response.relevant_commits,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setHighlightedCommits(response.relevant_commits);
        
        if (response.relevant_commits.length > 0) {
          toast.success('Found relevant commits!', {
            description: `Click 'View Commits' to see ${response.relevant_commits.length} related commits.`
          });
        }
      } catch (error) {
        console.error('Error querying commits:', error);
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `I encountered an error while processing your request. ${error instanceof Error ? error.message : 'Please try again later.'}`,
          sender: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
        setHighlightedCommits([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Use mock responses for example repositories
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Find the best matching mock response
      const lowerInput = inputValue.toLowerCase();
      let matchedResponse = null;
      let matchedTerm = '';
      
      for (const [term, data] of Object.entries(mockResponses)) {
        if (lowerInput.includes(term)) {
          // If we found a longer matching term, use it instead
          if (term.length > matchedTerm.length) {
            matchedResponse = data;
            matchedTerm = term;
          }
        }
      }
      
      if (matchedResponse) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: matchedResponse.response,
          sender: 'assistant',
          relatedCommits: matchedResponse.relatedCommits,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setHighlightedCommits(matchedResponse.relatedCommits);
        
        toast.success('Found relevant commits!', {
          description: `Click 'View Commits' to see ${matchedResponse.relatedCommits.length} related commits.`
        });
      } else {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `I couldn't find specific information about that in the repository. Try asking about authentication, performance, security, or user management features.`,
          sender: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setHighlightedCommits([]);
      }
      
      setIsLoading(false);
    }
  };

  const handleViewCommits = (commitIds: string[]) => {
    setSelectedCommits(commitIds);
    setIsModalOpen(true);
  };

  const handlePredefinedQuestion = async (question: string, response: string, relatedCommits: string[]) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: question,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion(question);
    setIsLoading(true);
    
    // For real repositories with repoId, use the queryCommits API instead of predefined responses
    if (!isExample && repoId) {
      try {
        const apiResponse = await queryCommits({
          repository_id: repoId,
          query: question,
          k: 5
        });
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: apiResponse.response,
          sender: 'assistant',
          relatedCommits: apiResponse.relevant_commits,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setHighlightedCommits(apiResponse.relevant_commits);
        
        if (apiResponse.relevant_commits.length > 0) {
          toast.success('Found relevant commits!', {
            description: `Click 'View Commits' to see ${apiResponse.relevant_commits.length} related commits.`
          });
        }
      } catch (error) {
        console.error('Error querying commits:', error);
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `I encountered an error while processing your request. ${error instanceof Error ? error.message : 'Please try again later.'}`,
          sender: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Use predefined responses for example repositories
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add assistant message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        relatedCommits: relatedCommits,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setHighlightedCommits(relatedCommits);
      
      toast.success('Found relevant commits!', {
        description: `Click 'View Commits' to see ${relatedCommits.length} related commits.`
      });
      
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isChatOpen) return null;

  return (
    <div className={cn(
      "sidebar-chat fixed z-50 bg-background border-l shadow-lg",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Repository Assistant</h3>
        <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Predefined Questions */}
      <div className="p-4 border-b bg-muted/30">
        <h4 className="text-sm font-medium mb-3 flex items-center">
          <HelpCircle className="h-4 w-4 mr-2 text-primary" />
          Ask me about:
        </h4>
        <div className="flex flex-col gap-2">
          {predefinedQuestions.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="justify-start text-left h-auto py-2 px-3"
              onClick={() => handlePredefinedQuestion(item.question, item.response, item.relatedCommits)}
              disabled={isLoading}
            >
              <MessageCircle className="h-4 w-4 mr-2 text-primary" />
              <span className="truncate">{item.question}</span>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Messages */}
      <ScrollArea className="sidebar-chat-messages">
        <div className="p-4 space-y-4">
          {messages.map(message => (
            <div 
              key={message.id}
              className={cn(
                "flex flex-col max-w-[80%] rounded-lg p-3",
                message.sender === 'user' 
                  ? "ml-auto bg-primary text-primary-foreground" 
                  : "mr-auto bg-muted"
              )}
            >
              <p className="text-sm">{message.content}</p>
              {message.relatedCommits && message.relatedCommits.length > 0 && (
                <div className="mt-2 flex items-center">
                  <span className="text-xs opacity-80 mr-2">
                    {message.relatedCommits.length} commit{message.relatedCommits.length > 1 ? 's' : ''}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => handleViewCommits(message.relatedCommits!)}
                  >
                    <GitCommit className="h-3 w-3 mr-1" />
                    View Commits
                  </Button>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this repository..."
            disabled={isLoading}
            className="flex-grow"
          />
          <Button 
            onClick={handleSend} 
            size="icon"
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* Modal for displaying commits */}
      <CommitModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        commits={commits}
        commitIds={selectedCommits}
        question={messages.find(m => m.relatedCommits === selectedCommits)?.content || null}
      />
    </div>
  );
};

export default SidebarChat;
