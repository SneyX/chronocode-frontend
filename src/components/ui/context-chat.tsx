
import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, SendHorizontal, User, Bot, Sparkles, X, Filter, Clock, GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Commit } from '@/types';
import { useChatContext, ChatContextFilter } from '@/hooks/use-chat-context';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  relatedCommits?: string[];
}

interface ContextChatProps {
  commits: Commit[];
  repoName?: string;
  onFilterChange: (filter: ChatContextFilter | null) => void;
  onClose: () => void;
  className?: string;
}

// Mock questions for example repository
const exampleQuestions = [
  "What motivated the authentication changes?",
  "Tell me about performance optimizations",
  "How did the architecture evolve?",
  "Recent security improvements?",
  "Key features implemented?"
];

// Mock responses for example repository
const mockResponses: Record<string, string> = {
  "What motivated the authentication changes?": 
    "The authentication system changes were motivated by several factors: 1) Security vulnerabilities identified in the previous JWT implementation, 2) User feedback indicating login failures were too frequent (35% reduction after changes), and 3) The need to support social authentication providers. The changes were initiated after security audits conducted in March.",
  
  "Tell me about performance optimizations": 
    "The performance optimization in data fetching reduced load times by 65%. Key changes included implementing Redis-based caching with a 15-minute TTL for frequently accessed data, introducing pagination for large result sets, and optimizing database queries by adding indexes on commonly filtered fields. This was a direct response to user complaints about slow loading in the dashboard.",
  
  "How did the architecture evolve?": 
    "The project began as a monolith and gradually evolved to a microservices approach. The first major architectural shift occurred 8 months ago when the authentication system was decoupled. This pattern continued with 5 more components becoming standalone services. The motivation was to improve scalability and team autonomy, allowing different teams to work on different services independently.",
  
  "Recent security improvements?": 
    "Recent security improvements include: 1) Fixing an XSS vulnerability in user input rendering, 2) Implementing CSP headers to prevent unauthorized script execution, 3) Adding rate limiting to prevent brute force attacks, and 4) Upgrading dependencies with known vulnerabilities. These changes were prioritized after a security audit identified these as high-risk issues.",
  
  "Key features implemented?": 
    "The key features implemented include: 1) User authentication with multiple providers, 2) Real-time data synchronization, 3) Advanced search capabilities with filters, 4) Data visualization dashboards, and 5) Role-based access control. The most recent feature addition was the advanced search capability, which was requested by users to help them find information more efficiently."
};

const ContextChat: React.FC<ContextChatProps> = ({ 
  commits,
  repoName,
  onFilterChange,
  onClose,
  className
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      content: `Hi there! I'm Chronocode's AI assistant. I can answer questions about ${repoName || 'your code'} history and architecture. What would you like to know?`,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { processQuestion, clearContextFilter } = useChatContext();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Process the question to find related commits
    const hasRelatedCommits = processQuestion(input, commits);
    
    // Simulate AI response with a delay
    setTimeout(() => {
      const responseContent = mockResponses[input.trim()] || 
        "I don't have specific information about that in my current data. As more commits are analyzed, I'll be able to provide more insights about this topic.";
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
      // Update filter context based on the question
      if (hasRelatedCommits) {
        onFilterChange({
          commitShas: [],  // Already set by the processQuestion function
          highlight: true,
          filterReason: `Related to: "${input}"`
        });
      }
    }, 1000);
  };
  
  const handleQuestionClick = (question: string) => {
    setInput(question);
  };

  const handleClearFilter = () => {
    clearContextFilter();
    onFilterChange(null);
  };

  return (
    <Card className={`border shadow-lg max-w-md flex flex-col h-full ${className}`}>
      <CardHeader className="bg-muted/30 border-b p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Bot className="mr-2 h-5 w-5 text-primary" />
            Code Intelligence
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {repoName && (
          <p className="text-xs text-muted-foreground">{repoName}</p>
        )}
      </CardHeader>
      
      <ScrollArea className="flex-grow">
        <CardContent className="p-3 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/60'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === 'assistant' && (
                    <Bot className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                  )}
                  <div>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-[10px] opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <User className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {isLoading && (
            <div className="flex justify-center animate-pulse">
              <div className="bg-primary/10 rounded-full p-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
        </CardContent>
      </ScrollArea>
      
      <CardFooter className="border-t p-3 flex-shrink-0 flex flex-col gap-3">
        {/* Filtering indicator, if active */}
        <div className="w-full">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {exampleQuestions.map((question, index) => {
              const IconComponent = [GitBranch, Clock, Filter, Clock, Filter][index % 5];
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs py-1 h-7 bg-primary/5 border-primary/20 text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => handleQuestionClick(question)}
                >
                  <IconComponent className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{question.length > 30 ? question.substring(0, 30) + '...' : question}</span>
                </Button>
              );
            })}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Ask about code history..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              className="flex-grow bg-background/70 backdrop-blur-sm border-primary/20 focus-visible:ring-primary/30 rounded-lg"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isLoading}
              size="icon"
              className="bg-primary hover:bg-primary/90 flex-shrink-0"
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ContextChat;
