import React, { useState, useRef, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Commit, TimeScale, GroupBy, CommitType } from '@/types';
import { calculateTimeRange, generateTimeIntervals, formatTimeInterval, calculateCommitPosition } from '@/utils/date-utils';
import { groupCommits, getCommitTypeColor } from '@/utils/filter-utils';
import { GitCommit, Sparkles, AlertTriangle, Trophy, Bug, Wrench, Layers } from 'lucide-react';
import { formatDate } from '@/utils/date-utils';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/chat-context';

interface TimelineProps {
  commits: Commit[];
  timeScale: TimeScale;
  groupBy: GroupBy;
  selectedCommit?: string;
  onCommitSelect: (commitSha: string) => void;
  className?: string;
}

interface ClusteredCommit {
  position: number;
  commits: Commit[];
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
  const [hoveredCommit, setHoveredCommit] = useState<string | null>(null);
  const [openClusterDialog, setOpenClusterDialog] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<ClusteredCommit | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const { highlightedCommits, currentQuestion, isChatOpen } = useChat();
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  
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

  const clusterCommits = (commits: Commit[], groupName: string): ClusteredCommit[] => {
    const positionMap: Record<number, Commit[]> = {};
    
    commits.forEach(commit => {
      const position = calculateCommitPosition(
        commit.date,
        timeRange.start,
        timeRange.end,
        timeScale
      );
      
      const roundedPosition = Math.round(position);
      
      if (!positionMap[roundedPosition]) {
        positionMap[roundedPosition] = [];
      }
      
      positionMap[roundedPosition].push(commit);
    });
    
    return Object.entries(positionMap).map(([pos, groupedCommits]) => ({
      position: Number(pos),
      commits: groupedCommits
    }));
  };

  const handleClusterClick = (cluster: ClusteredCommit) => {
    setSelectedCluster(cluster);
    setOpenClusterDialog(true);
  };

  const handleCommitSelectFromCluster = (commitSha: string) => {
    onCommitSelect(commitSha);
    setOpenClusterDialog(false);
  };

  const isHighlighted = (commitSha: string) => {
    return highlightedCommits.includes(commitSha);
  };

  useEffect(() => {
    if (highlightedCommits.length > 0 && timelineContainerRef.current) {
      setTimeout(() => {
        const firstHighlightedCommit = document.querySelector('.highlighted-commit');
        if (firstHighlightedCommit) {
          firstHighlightedCommit.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [highlightedCommits]);

  // Drag to scroll functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (timelineContainerRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - timelineContainerRef.current.offsetLeft);
      setScrollLeft(timelineContainerRef.current.scrollLeft);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    if (timelineContainerRef.current) {
      e.preventDefault();
      const x = e.pageX - timelineContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      timelineContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className={cn(
      "w-full h-full flex flex-col bg-card rounded-lg border shadow-sm overflow-hidden",
      className
    )}>
      {currentQuestion && highlightedCommits.length > 0 && (
        <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Filtered by:</span>
            <span className="text-sm italic truncate max-w-[200px]">"{currentQuestion}"</span>
          </div>
          <Badge variant="outline" className="ml-2 shrink-0">
            {highlightedCommits.length} commit{highlightedCommits.length > 1 ? 's' : ''}
          </Badge>
        </div>
      )}
      
      <div 
        ref={timelineContainerRef}
        className="timeline-container flex-grow h-full"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="timeline-content">
          <div className="timeline-labels bg-muted/30 border-b sticky top-0 z-10">
            <div className={cn(
              "shrink-0",
              isChatOpen ? "w-32" : "w-40"
            )}></div>
            
            <div className="flex">
              {timeIntervals.map((interval, index) => (
                <div 
                  key={index} 
                  className="timeline-column px-2 py-3 text-center text-xs font-medium border-r last:border-r-0"
                >
                  {formatTimeInterval(interval, timeScale)}
                </div>
              ))}
            </div>
          </div>
          
          <div className="timeline-lanes">
            {Object.entries(groupedCommits).map(([groupName, groupCommits], groupIndex) => (
              groupCommits.length > 0 && (
                <div key={groupName} className="group/row">
                  <div className="flex">
                    <div className={cn(
                      "shrink-0 bg-muted/30 p-3 font-medium border-r flex items-center sticky left-0 z-10",
                      isChatOpen ? "w-32" : "w-40"
                    )}>
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
                    
                    <div className="flex-grow relative flex border-b min-h-[80px] group-hover/row:bg-muted/10">
                      {timeIntervals.map((_, index) => (
                        <div key={index} className="timeline-column border-r last:border-r-0"></div>
                      ))}
                      
                      {clusterCommits(groupCommits, groupName).map((cluster) => {
                        if (cluster.commits.length === 1) {
                          const commit = cluster.commits[0];
                          const analyses = commit.commit_analyses || commit.commit_analises || [];
                          const analysis = analyses[0];
                          const commitType = analysis?.type || 'CHORE';
                          const isCommitHighlighted = isHighlighted(commit.sha);
                          
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
                                        'ring-2 ring-offset-2 ring-primary scale-125 z-20',
                                      isCommitHighlighted && 
                                        'ring-2 ring-offset-2 ring-yellow-400 scale-125 z-20 highlighted-commit animate-pulse'
                                    )}
                                    style={{ left: `${cluster.position}%` }}
                                    onClick={() => onCommitSelect(commit.sha)}
                                    onMouseEnter={() => setHoveredCommit(commit.sha)}
                                    onMouseLeave={() => setHoveredCommit(null)}
                                  >
                                    {getCommitTypeIcon(commitType)}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent 
                                  side="top" 
                                  className="max-w-xs p-0 overflow-hidden z-50"
                                  avoidCollisions={true}
                                  collisionPadding={20}
                                  sideOffset={12}
                                >
                                  <div className="p-3">
                                    <p className="font-medium text-sm">{analysis?.title || commit.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {commit.author} • {formatDate(commit.date)}
                                    </p>
                                  </div>
                                  <Separator />
                                  <div className="p-2 bg-muted/30 text-xs">
                                    {analysis?.idea || commit.description?.substring(0, 100)}
                                    {(analysis?.idea?.length || commit.description?.length) > 100 && '...'}
                                  </div>
                                  {isCommitHighlighted && (
                                    <>
                                      <Separator />
                                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-xs">
                                        <span className="font-semibold">Relevant to your question:</span> {currentQuestion}
                                      </div>
                                    </>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        } else {
                          const commitTypes = cluster.commits.map(commit => {
                            const analyses = commit.commit_analyses || commit.commit_analises || [];
                            return analyses[0]?.type || 'CHORE';
                          });
                          
                          const mostCommonType = commitTypes.reduce(
                            (acc, type) => {
                              acc[type] = (acc[type] || 0) + 1;
                              return acc;
                            },
                            {} as Record<string, number>
                          );
                          
                          const dominantType = Object.entries(mostCommonType).sort((a, b) => b[1] - a[1])[0][0] as CommitType;
                          
                          const hasHighlightedCommits = cluster.commits.some(commit => 
                            isHighlighted(commit.sha)
                          );
                          
                          const highlightedCount = cluster.commits.filter(commit => 
                            isHighlighted(commit.sha)
                          ).length;
                          
                          return (
                            <TooltipProvider key={`cluster-${cluster.position}`}>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <button
                                    className={cn(
                                      'absolute top-1/2 transform -translate-y-1/2 h-9 w-9 rounded-full',
                                      'flex items-center justify-center transition-all duration-300',
                                      'z-10 hover:z-20 hover:scale-125 hover:shadow-lg border-2',
                                      getCommitTypeColor(dominantType),
                                      hasHighlightedCommits && 
                                        'ring-2 ring-offset-2 ring-yellow-400 highlighted-commit animate-pulse'
                                    )}
                                    style={{ left: `${cluster.position}%` }}
                                    onClick={() => handleClusterClick(cluster)}
                                  >
                                    <Layers className="h-5 w-5" />
                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                                      {cluster.commits.length}
                                    </span>
                                    {hasHighlightedCommits && (
                                      <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-yellow-400 text-black text-xs flex items-center justify-center font-bold">
                                        {highlightedCount}
                                      </span>
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent 
                                  side="top" 
                                  className="max-w-xs p-0 overflow-hidden z-50"
                                  avoidCollisions={true}
                                  collisionPadding={20}
                                  sideOffset={12}
                                >
                                  <div className="p-3">
                                    <p className="font-medium text-sm">Commit Cluster</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Contains {cluster.commits.length} commits
                                    </p>
                                  </div>
                                  <Separator />
                                  <div className="p-2 bg-muted/30 text-xs">
                                    Click to view all {cluster.commits.length} commits in this time period
                                    {hasHighlightedCommits && (
                                      <p className="mt-1 text-yellow-600 dark:text-yellow-400 font-medium">
                                        {highlightedCount} relevant to your question
                                      </p>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      <Dialog open={openClusterDialog} onOpenChange={setOpenClusterDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Commit Cluster</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {selectedCluster?.commits.map((commit) => {
              const analyses = commit.commit_analyses || commit.commit_analises || [];
              const analysis = analyses[0];
              const commitType = analysis?.type || 'CHORE';
              const isCommitHighlighted = isHighlighted(commit.sha);
              
              return (
                <div 
                  key={commit.sha} 
                  className={cn(
                    "p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                    selectedCommit === commit.sha && "ring-2 ring-primary",
                    isCommitHighlighted && "ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                  )}
                  onClick={() => handleCommitSelectFromCluster(commit.sha)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'h-6 w-6 rounded-md flex items-center justify-center',
                        getCommitTypeColor(commitType)
                      )}>
                        {getCommitTypeIcon(commitType)}
                      </div>
                      <span className="font-medium">{analysis?.title || commit.message}</span>
                    </div>
                    <Badge className={getCommitTypeColor(commitType)}>
                      {commitType}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {analysis?.idea || commit.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                    <div>{commit.author}</div>
                    <div>{formatDate(commit.date)}</div>
                  </div>
                  
                  {isCommitHighlighted && currentQuestion && (
                    <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 text-xs rounded">
                      <span className="font-semibold">Relevant to your question:</span> {currentQuestion}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setOpenClusterDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timeline;
