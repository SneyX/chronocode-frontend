
import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChat } from '@/contexts/chat-context';

interface FloatingChatButtonProps {
  repoName?: string;
  className?: string;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  className,
}) => {
  const { toggleChat, isChatOpen } = useChat();

  return (
    <Button
      onClick={toggleChat}
      variant="default"
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 transition-all duration-300 hover:scale-105",
        isChatOpen ? "bg-primary/90 text-primary-foreground rotate-90" : "bg-gradient-to-br from-violet-500 to-purple-700 border-2 border-purple-300/20",
        className
      )}
      aria-label={isChatOpen ? "Close chat assistant" : "Open chat assistant"}
    >
      {isChatOpen ? (
        <X className="h-6 w-6 rotate-180" />
      ) : (
        <MessageCircle className="h-6 w-6" />
      )}
    </Button>
  );
};

export default FloatingChatButton;
