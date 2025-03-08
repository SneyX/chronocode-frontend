
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, SendHorizontal, User, Bot, X, Filter, GitBranch, Zap, FileCode, Clock, Code, Clipboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat, ChatMessage } from '@/contexts/chat-context';

interface SidebarChatProps {
  repoName?: string;
  className?: string;
}

// Example questions for the sidebar
const exampleQuestions = [
  "What motivated the authentication changes?",
  "Tell me about performance optimizations",
  "How did the architecture evolve?",
  "Recent security improvements?",
  "Key features implemented?"
];

const SidebarChat: React.FC<SidebarChatProps> = ({ 
  repoName,
  className
}) => {
  const { 
    messages, 
    isOpen, 
    filteredCommitShas,
    setIsOpen, 
    handleUserMessage,
    clearFilteredCommits
  } = useChat();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    setInput('');
    
    try {
      await handleUserMessage(input);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuestionClick = (question: string) => {
    setInput(question);
  };

  const handleClearFilters = () => {
    clearFilteredCommits();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "chat-sidebar h-full",
      isOpen ? "" : "closed",
      className
    )}>
      <div 
        className={cn(
          "w-full md:w-96 h-full flex flex-col bg-gradient-to-br from-background/90 to-background/80 backdrop-blur-sm border-t md:border-l border-primary/10 shadow-lg",
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-primary/10 to-transparent backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center">
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
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="h-8 w-8"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Filtered Status */}
        {filteredCommitShas && filteredCommitShas.length > 0 && (
          <div className="px-4 py-2 bg-primary/5 border-b flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm">
                Showing {filteredCommitShas.length} related {filteredCommitShas.length === 1 ? 'commit' : 'commits'}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          </div>
        )}
        
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4 py-4 space-y-5 overflow-y-auto">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
          
          {isLoading && (
            <div className="flex justify-center animate-pulse">
              <div className="bg-primary/10 rounded-full p-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
        </ScrollArea>
        
        {/* Input Area */}
        <div className="border-t p-4 space-y-3 bg-gradient-to-b from-background/30 to-background/60 backdrop-blur-sm">
          {/* Suggested Questions */}
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
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const hasRelatedCommits = message.relatedCommits && message.relatedCommits.length > 0;
  
  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
    >
      <div
        className={`max-w-[90%] rounded-2xl p-3.5 shadow-sm ${
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
            
            {hasRelatedCommits && (
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[10px] py-0 h-5 bg-primary/5 border-primary/20">
                  <Clipboard className="h-3 w-3 mr-1" />
                  {message.relatedCommits!.length} related {message.relatedCommits!.length === 1 ? 'commit' : 'commits'}
                </Badge>
              </div>
            )}
            
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
  );
};

export default SidebarChat;
