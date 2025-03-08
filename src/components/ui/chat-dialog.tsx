
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, SendHorizontal, User, Bot, Sparkles } from 'lucide-react';

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
  "What motivated the changes in the authentication system?",
  "Tell me about the performance optimization in the data fetching logic",
  "How did the project architecture evolve over time?",
  "What security improvements were made in the latest commits?",
  "What are the key features implemented in this project?"
];

// Mock responses for example repository
const mockResponses: Record<string, string> = {
  "What motivated the changes in the authentication system?": 
    "The authentication system changes were motivated by several factors: 1) Security vulnerabilities identified in the previous JWT implementation, 2) User feedback indicating login failures were too frequent (35% reduction after changes), and 3) The need to support social authentication providers. The changes were initiated after security audits conducted in March.",
  
  "Tell me about the performance optimization in the data fetching logic": 
    "The performance optimization in data fetching reduced load times by 65%. Key changes included implementing Redis-based caching with a 15-minute TTL for frequently accessed data, introducing pagination for large result sets, and optimizing database queries by adding indexes on commonly filtered fields. This was a direct response to user complaints about slow loading in the dashboard.",
  
  "How did the project architecture evolve over time?": 
    "The project began as a monolith and gradually evolved to a microservices approach. The first major architectural shift occurred 8 months ago when the authentication system was decoupled. This pattern continued with 5 more components becoming standalone services. The motivation was to improve scalability and team autonomy, allowing different teams to work on different services independently.",
  
  "What security improvements were made in the latest commits?": 
    "Recent security improvements include: 1) Fixing an XSS vulnerability in user input rendering, 2) Implementing CSP headers to prevent unauthorized script execution, 3) Adding rate limiting to prevent brute force attacks, and 4) Upgrading dependencies with known vulnerabilities. These changes were prioritized after a security audit identified these as high-risk issues.",
  
  "What are the key features implemented in this project?": 
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
      <DialogContent className="sm:max-w-[500px] p-0 h-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b bg-muted/30 flex items-center">
          <Bot className="h-5 w-5 text-primary mr-2" />
          <h2 className="font-semibold text-lg">Code Intelligence Chat</h2>
          <div className="ml-auto">
            {repoName && (
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                {repoName}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.role === 'assistant' && (
                    <Bot className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {isLoading && (
            <div className="flex justify-center">
              <div className="bg-muted rounded-full p-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs bg-primary/5 border-primary/20 text-muted-foreground"
                onClick={() => handleQuestionClick(question)}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {question.length > 30 ? question.substring(0, 30) + '...' : question}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your code history..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              className="flex-grow"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isLoading}
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
