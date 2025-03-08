
import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ChatDialog from './chat-dialog';

interface FloatingChatButtonProps {
  repoName?: string;
  className?: string;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  repoName,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="default"
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary to-primary/80 border border-primary-foreground/10",
          className
        )}
        aria-label="Open chat assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      <ChatDialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        repoName={repoName} 
      />
    </>
  );
};

export default FloatingChatButton;
