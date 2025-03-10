
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Commit, CommitType } from '@/types';
import { formatDate } from '@/utils/date-utils';
import { getCommitTypeColor, getEpicColor } from '@/utils/filter-utils';
import { ExternalLink, GitCommit, Book, Lightbulb, Sparkles, Bug, AlertTriangle, Trophy, Wrench, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommitCardProps {
  commit: Commit;
  className?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  id?: string;
}

const CommitCard: React.FC<CommitCardProps> = ({
  commit,
  className,
  isExpanded = false,
  onToggleExpand,
  id,
}) => {
  // Handle both property names for backward compatibility
  const analyses = commit.commit_analyses || commit.commit_analises || [];
  const analysis = analyses && analyses.length > 0 ? analyses[0] : null;
  
  const commitType = analysis?.type || 'CHORE';
  const epic = analysis?.epic;
  
  const TypeIcon = {
    'FEATURE': Sparkles,
    'WARNING': AlertTriangle,
    'MILESTONE': Trophy,
    'BUG': Bug,
    'CHORE': Wrench,
  }[commitType] || Wrench; // Provide a fallback

  return (
    <Card 
      id={id}
      className={cn(
        'w-full overflow-hidden transition-all duration-300 border',
        'hover:shadow-lg glass-morphism',
        isExpanded ? 'scale-100' : 'scale-98 hover:scale-100',
        className
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 border">
              <AvatarImage src={`https://github.com/${commit.author}.png`} alt={commit.author} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {commit.author.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                <a 
                  href={commit.author_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {commit.author}
                </a>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(commit.date, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {epic && (
              <Badge className={cn(
                'flex items-center space-x-1 px-2 py-1',
                getEpicColor(epic)
              )}>
                <Layers className="h-3 w-3 mr-1" />
                {epic}
              </Badge>
            )}
            {analysis && (
              <Badge className={cn(
                'flex items-center space-x-1 px-2 py-1',
                getCommitTypeColor(analysis.type)
              )}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {analysis.type}
              </Badge>
            )}
          </div>
        </div>
        
        <CardTitle className="mt-3 text-lg font-semibold">
          {analysis?.title || commit.message}
        </CardTitle>
        
        <CardDescription className="mt-1 line-clamp-2">
          {analysis?.idea || commit.description}
        </CardDescription>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-4 pt-2 animate-fade-in">
          <Separator className="mb-3" />
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold flex items-center">
                <GitCommit className="h-4 w-4 mr-2 text-primary" />
                Original Commit
              </h4>
              <p className="mt-1 text-sm text-muted-foreground px-6">
                {commit.message}
              </p>
            </div>
            
            {analysis?.description && (
              <div>
                <h4 className="text-sm font-semibold flex items-center">
                  <Book className="h-4 w-4 mr-2 text-primary" />
                  Analysis
                </h4>
                <p className="mt-1 text-sm text-muted-foreground px-6">
                  {analysis.description}
                </p>
              </div>
            )}
            
            {analysis?.idea && (
              <div>
                <h4 className="text-sm font-semibold flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-primary" />
                  Core Idea
                </h4>
                <p className="mt-1 text-sm text-muted-foreground px-6">
                  {analysis.idea}
                </p>
              </div>
            )}
            
            {analysis?.epic && (
              <div>
                <h4 className="text-sm font-semibold flex items-center">
                  <Layers className="h-4 w-4 mr-2 text-primary" />
                  Epic
                </h4>
                <p className="mt-1 text-sm text-muted-foreground px-6">
                  {analysis.epic}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
      
      <CardFooter className="p-3 flex justify-between bg-secondary/50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleExpand}
          className="text-xs"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          asChild
        >
          <a href={commit.url} target="_blank" rel="noopener noreferrer">
            View on GitHub
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CommitCard;
