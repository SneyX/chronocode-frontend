
import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Commit, TimeScale, GroupBy, CommitType } from '@/types';
import { calculateTimeRange, generateTimeIntervals, formatTimeInterval, calculateCommitPosition } from '@/utils/date-utils';
import { groupCommits, getCommitTypeColor } from '@/utils/filter-utils';
import { GitCommit, Sparkles, AlertTriangle, Trophy, Bug, Wrench } from 'lucide-react';
import { formatDate } from '@/utils/date-utils';
import { cn } from '@/lib/utils';

interface TimelineProps {
  commits: Commit[];
  timeScale: TimeScale;
  groupBy: GroupBy;
  selectedCommit?: string;
  onCommitSelect: (commitSha: string) => void;
  className?: string;
}

const Timeline: React.FC<TimelineProps> = ({
  commits,
  timeScale,
  groupBy,
  selectedCommit,
  onCommitSelect,
  className
}) => {
  const [timeRange, setTimeRange] = useState(() => calculateTimeRange(commits, timeScale));
  const [timeIntervals, setTimeIntervals] = useState(() => 
    generateTimeIntervals(timeRange.start, timeRange.end, timeScale)
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [hoveredCommit, setHoveredCommit] = useState<string | null>(null);
  
  // Update time range and intervals when commits or timeScale changes
  useEffect(() => {
    const range = calculateTimeRange(commits, timeScale);
    setTimeRange(range);
    setTimeIntervals(generateTimeIntervals(range.start, range.end, timeScale));
  }, [commits, timeScale]);

  const groupedCommits = groupCommits(commits, groupBy);
  
  const getCommitTypeIcon = (type: CommitType) => {
    switch (type) {
      case 'FEATURE': return <Sparkles className="h-full w-full p-1" />;
      case 'WARNING': return <AlertTriangle className="h-full w-full p-1" />;
      case 'MILESTONE': return <Trophy className="h-full w-full p-1" />;
      case 'BUG': return <Bug className="h-full w-full p-1" />;
      case 'CHORE': return <Wrench className="h-full w-full p-1" />;
      default: return <GitCommit className="h-full w-full p-1" />;
    }
  };

  return (
    <div className={cn('w-full h-[600px] bg-card rounded-lg border shadow-sm overflow-hidden', className)}>
      <div className="flex flex-col h-full">
        {/* Timeline Header - Time Intervals */}
        <div className="flex-none bg-muted/30 border-b">
          <div className="flex pl-40">
            {timeIntervals.map((interval, index) => (
              <div 
                key={index} 
                className="flex-1 px-2 py-3 text-center text-xs font-medium border-r last:border-r-0"
              >
                {formatTimeInterval(interval, timeScale)}
              </div>
            ))}
          </div>
        </div>
        
        {/* Timeline Body */}
        <ScrollArea className="flex-grow" ref={scrollAreaRef}>
          <div className="min-w-fit">
            {/* Render each group */}
            {Object.entries(groupedCommits).map(([groupName, groupCommits], groupIndex) => (
              groupCommits.length > 0 && (
                <div key={groupName} className="group/row">
                  {/* Group Label */}
                  <div className="flex sticky left-0 z-10">
                    <div className="w-40 bg-muted/30 p-3 font-medium border-r flex items-center">
                      {groupBy === 'type' && (
                        <div className={cn(
                          'h-6 w-6 mr-2 rounded-md flex items-center justify-center',
                          getCommitTypeColor(groupName as CommitType)
                        )}>
                          {getCommitTypeIcon(groupName as CommitType)}
                        </div>
                      )}
                      <span className="truncate">{groupName}</span>
                    </div>
                    
                    {/* Timeline Grid for this group */}
                    <div className="flex-grow relative flex border-b min-h-[100px] group-hover/row:bg-muted/10">
                      {timeIntervals.map((_, index) => (
                        <div key={index} className="flex-1 border-r last:border-r-0"></div>
                      ))}
                      
                      {/* Plot commits */}
                      {groupCommits.map((commit) => {
                        const position = calculateCommitPosition(
                          commit.date,
                          timeRange.start,
                          timeRange.end,
                          timeScale
                        );
                        
                        const analysis = commit.commit_analises[0];
                        const commitType = analysis?.type || 'CHORE';
                        
                        return (
                          <TooltipProvider key={commit.sha}>
                            <Tooltip delayDuration={200}>
                              <TooltipTrigger asChild>
                                <button
                                  className={cn(
                                    'absolute top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full',
                                    'flex items-center justify-center transition-all duration-300',
                                    'z-10 hover:z-20 hover:scale-125 hover:shadow-lg',
                                    getCommitTypeColor(commitType),
                                    (selectedCommit === commit.sha || hoveredCommit === commit.sha) && 
                                      'ring-2 ring-offset-2 ring-primary scale-125 z-20'
                                  )}
                                  style={{ left: `${position}%` }}
                                  onClick={() => onCommitSelect(commit.sha)}
                                  onMouseEnter={() => setHoveredCommit(commit.sha)}
                                  onMouseLeave={() => setHoveredCommit(null)}
                                >
                                  {getCommitTypeIcon(commitType)}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs p-0 overflow-hidden">
                                <div className="p-3">
                                  <p className="font-medium text-sm">{analysis?.title || commit.message}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {commit.author} • {formatDate(commit.date)}
                                  </p>
                                </div>
                                <Separator />
                                <div className="p-2 bg-muted/30 text-xs">
                                  {analysis?.idea || commit.description.substring(0, 100)}
                                  {(analysis?.idea?.length || commit.description.length) > 100 && '...'}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Timeline;
