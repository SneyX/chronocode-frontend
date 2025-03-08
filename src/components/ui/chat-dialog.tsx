
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, SendHorizontal, User, Bot, Sparkles, MessagesSquare, Code, FileCode, Zap, Clock, GitBranch } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  repoName?: string;
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

const ChatDialog: React.FC<ChatDialogProps> = ({ 
  isOpen, 
  onClose, 
  repoName 
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
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);
  
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
    }, 1000);
  };
  
  const handleQuestionClick = (question: string) => {
    setInput(question);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 h-[600px] max-h-[80vh] overflow-hidden flex flex-col bg-gradient-to-br from-background/90 to-background/80 backdrop-blur-sm border border-primary/10 shadow-lg rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-primary/10 to-transparent backdrop-blur-md flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mr-3 shadow-inner">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg tracking-tight">Code Intelligence</h2>
            {repoName && (
              <p className="text-xs text-muted-foreground opacity-80">{repoName}</p>
            )}
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 bg-background/20">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-primary/90 to-primary/80 text-primary-foreground'
                    : 'bg-gradient-to-br from-muted/60 to-muted/40 dark:from-muted/30 dark:to-muted/20 border border-border/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.role === 'assistant' && (
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                      <Bot className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className="text-[10px] opacity-70 mt-1.5">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 border border-primary-foreground/30">
                      <User className="h-3.5 w-3.5 text-primary-foreground flex-shrink-0" />
                    </div>
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
        </div>
        
        {/* Input Area */}
        <div className="border-t p-4 space-y-3 bg-gradient-to-b from-background/30 to-background/60 backdrop-blur-sm">
          {/* Suggested Questions - More compact design */}
          <div className="flex flex-wrap gap-1.5">
            {exampleQuestions.map((question, index) => {
              const IconComponent = [GitBranch, Zap, FileCode, Clock, Code][index % 5];
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs py-1 h-7 bg-primary/5 border-primary/20 text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => handleQuestionClick(question)}
                >
                  <IconComponent className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{question}</span>
                </Button>
              );
            })}
          </div>
          
          {/* Message Input */}
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
              className="flex-grow bg-background/70 backdrop-blur-sm border-primary/20 focus-visible:ring-primary/30 rounded-full pl-4 pr-12 h-10"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 h-10 w-10 rounded-full p-0 flex items-center justify-center shadow-md"
              size="icon"
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
