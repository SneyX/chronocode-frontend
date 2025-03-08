
// This is a read-only file, so we'll create a wrapper component instead

import React from 'react';
import { Commit } from '@/types';
import CommitCardOriginal from '@/components/ui/commit-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, GitCommit } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { cn } from '@/lib/utils';
import { getCommitTypeColor } from '@/utils/filter-utils';

interface CompactCommitCardProps {
  commit: Commit;
  onClick: () => void;
  className?: string;
}

export const CompactCommitCard: React.FC<CompactCommitCardProps> = ({
  commit,
  onClick,
  className
}) => {
  // Support both property names
  const analyses = commit.commit_analyses || commit.commit_analises || [];
  const analysis = analyses[0];
  const commitType = analysis?.type || 'CHORE';
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:border-primary cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
            getCommitTypeColor(commitType)
          )}>
            <GitCommit className="h-4 w-4" />
          </div>
          
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-sm line-clamp-1">
                {analysis?.title || commit.message}
              </h3>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
            
            <p className="text-xs text-muted-foreground mt-1">
              {commit.author} • {formatDistance(new Date(commit.date), new Date(), { addSuffix: true })}
            </p>
            
            {analysis?.epic && (
              <Badge variant="outline" className="mt-2 text-xs">
                {analysis.epic}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Add compact property to CommitCard component in commit-card.tsx wrapper
interface CommitCardWrapperProps {
  id?: string;
  commit: Commit;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
  compact?: boolean;
}

const CommitCardWrapper: React.FC<CommitCardWrapperProps> = ({
  id,
  commit,
  isExpanded = false,
  onToggleExpand = () => {},
  className = "",
  compact = false
}) => {
  if (compact) {
    return (
      <CompactCommitCard
        commit={commit}
        onClick={onToggleExpand}
        className={className}
      />
    );
  }
  
  return (
    <CommitCardOriginal
      id={id}
      commit={commit}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      className={className}
    />
  );
};

export default CommitCardWrapper;
