import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { checkForNewCommits } from '@/services/github-service';

interface NewCommit {
  sha: string;
  message: string;
  author: string;
  author_avatar?: string;
  date: string;
}

interface RefreshButtonProps {
  repoName: string;
  onClick: () => Promise<void>;
  className?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  repoName,
  onClick,
  className
}) => {
  const [newCommits, setNewCommits] = useState<NewCommit[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkNewCommits = async () => {
      if (!repoName) return;
      
      setIsChecking(true);
      setError(null);
      
      try {
        // For now, we'll mock the response since the endpoint might not exist yet
        // In a real implementation, you would use:
        // const result = await checkForNewCommits(repoName);
        
        // Mock response for demonstration
        const mockResult = {
          new_commits: [
            {
              sha: '1234567890abcdef',
              message: 'Fix authentication bug',
              author: 'johndoe',
              author_avatar: 'https://github.com/johndoe.png',
              date: new Date().toISOString()
            },
            {
              sha: '0987654321fedcba',
              message: 'Add new feature',
              author: 'janedoe',
              author_avatar: 'https://github.com/janedoe.png',
              date: new Date().toISOString()
            }
          ]
        };
        
        setNewCommits(mockResult.new_commits);
      } catch (err) {
        console.error('Error checking for new commits:', err);
        setError('Failed to check for new commits');
      } finally {
        setIsChecking(false);
      }
    };
    
    checkNewCommits();
    
    // Set up a timer to check for new commits every 5 minutes
    const timer = setInterval(checkNewCommits, 5 * 60 * 1000);
    
    return () => clearInterval(timer);
  }, [repoName]);

  const handleClick = async () => {
    await onClick();
    // After refresh, clear the new commits list
    setNewCommits([]);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {newCommits.length > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button 
                  onClick={handleClick}
                  variant="outline"
                  className={cn(
                    "relative animate-fade-in",
                    newCommits.length > 0 && "pr-8",
                    className
                  )}
                  disabled={isChecking}
                >
                  <RefreshCw className={cn(
                    "mr-2 h-4 w-4",
                    isChecking && "animate-spin"
                  )} />
                  Refresh Analysis
                  
                  {newCommits.length > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {newCommits.length}
                    </span>
                  )}
                </Button>
              </HoverCardTrigger>
              
              <HoverCardContent 
                className="w-80 p-0 shadow-lg duration-75" 
                side="bottom" 
                align="end" 
                sideOffset={5}
              >
                <div className="p-3 border-b">
                  <h4 className="text-sm font-semibold">New Commits</h4>
                  <p className="text-xs text-muted-foreground">
                    {newCommits.length} new commit{newCommits.length !== 1 ? 's' : ''} since last refresh
                  </p>
                </div>
                <div className="max-h-[300px] overflow-auto">
                  {newCommits.map((commit) => (
                    <div key={commit.sha} className="flex items-start gap-3 p-3 border-b last:border-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={commit.author_avatar} alt={commit.author} />
                        <AvatarFallback>{commit.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{commit.author}</p>
                        <p className="text-xs text-muted-foreground truncate">{commit.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(commit.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <Button 
              onClick={handleClick}
              variant="outline"
              className={cn(
                "relative animate-fade-in",
                className
              )}
              disabled={isChecking}
            >
              <RefreshCw className={cn(
                "mr-2 h-4 w-4",
                isChecking && "animate-spin"
              )} />
              Refresh Analysis
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {newCommits.length > 0 
            ? `Refresh to analyze ${newCommits.length} new commit${newCommits.length !== 1 ? 's' : ''}`
            : 'Check for new commits and update analysis'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RefreshButton;