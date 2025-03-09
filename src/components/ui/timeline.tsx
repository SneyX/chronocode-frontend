
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Commit, TimeScale, GroupBy, CommitType } from '@/types';
import { 
  calculateTimeRange, 
  generateTimeIntervals, 
  formatTimeInterval, 
  calculateCommitPosition,
  isCommitInInterval,
  getCommitIntervalIndex,
  formatDate
} from '@/utils/date-utils';
import { groupCommits, getCommitTypeColor } from '@/utils/filter-utils';
import { GitCommit, Sparkles, AlertTriangle, Trophy, Bug, Wrench, RefreshCw, FileText, Layers, Calendar } from 'lucide-react';
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
  intervalIndex: number;
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
  const timelineRef = useRef<HTMLDivElement>(null);
  const [hoveredCommit, setHoveredCommit] = useState<string | null>(null);
  const [openClusterDialog, setOpenClusterDialog] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<ClusteredCommit | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [columnsWithCommits, setColumnsWithCommits] = useState<Record<number, boolean>>({});
  
  const { highlightedCommits, currentQuestion, isChatOpen } = useChat();
  
  useEffect(() => {
    const range = calculateTimeRange(commits, timeScale);
    setTimeRange(range);
    setTimeIntervals(generateTimeIntervals(range.start, range.end, timeScale));
  }, [commits, timeScale]);

  // Calculate which columns have commits
  useEffect(() => {
    const columnsMap: Record<number, boolean> = {};
    
    commits.forEach(commit => {
      const commitDate = new Date(commit.date);
      const intervalIndex = getCommitIntervalIndex(
        commitDate,
        timeIntervals,
        timeScale
      );
      columnsMap[intervalIndex] = true;
    });
    
    setColumnsWithCommits(columnsMap);
  }, [commits, timeIntervals, timeScale]);

  const groupedCommits = groupCommits(commits, groupBy);
  
  const getCommitTypeIconComponent = (type: CommitType) => {
    switch (type) {
      case 'FEATURE': return <Sparkles className="h-full w-full p-1" />;
      case 'WARNING': return <AlertTriangle className="h-full w-full p-1" />;
      case 'MILESTONE': return <Trophy className="h-full w-full p-1" />;
      case 'BUG': return <Bug className="h-full w-full p-1" />;
      case 'CHORE': return <Wrench className="h-full w-full p-1" />;
      case 'REFACTOR': return <RefreshCw className="h-full w-full p-1" />;
      case 'DOCS': return <FileText className="h-full w-full p-1" />;
      default: return <GitCommit className="h-full w-full p-1" />;
    }
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget) {
      setScrollPosition(e.currentTarget.scrollLeft);
    }
  }, []);

  const clusterCommits = (commits: Commit[], groupName: string): ClusteredCommit[] => {
    const positionMap: Record<string, Commit[]> = {};
    
    commits.forEach(commit => {
      const commitDate = new Date(commit.date);
      const intervalIndex = getCommitIntervalIndex(
        commitDate,
        timeIntervals,
        timeScale
      );
      
      const key = `${intervalIndex}`;
      
      if (!positionMap[key]) {
        positionMap[key] = [];
      }
      
      positionMap[key].push(commit);
    });
    
    return Object.entries(positionMap).map(([key, groupedCommits]) => {
      const intervalIndex = parseInt(key, 10);
      const position = intervalIndex * (100 / (timeIntervals.length - 1 || 1));
      
      return {
        position,
        commits: groupedCommits,
        intervalIndex
      };
    });
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
    if (highlightedCommits.length > 0 && scrollAreaRef.current) {
      setTimeout(() => {
        const firstHighlightedCommit = document.querySelector('.highlighted-commit');
        if (firstHighlightedCommit) {
          firstHighlightedCommit.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [highlightedCommits]);

  const getColumnWidth = (index: number): number => {
    // Base column width depends on timeline width and number of intervals
    const baseColumnWidth = Math.max(80, Math.min(200, 1200 / timeIntervals.length));
    
    // If this column has no commits, make it narrower
    return columnsWithCommits[index] ? baseColumnWidth : Math.max(40, baseColumnWidth * 0.6);
  };

  // Calculate the position offset for each column based on widths of previous columns
  const getColumnOffset = (index: number): number => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getColumnWidth(i);
    }
    return offset;
  };

  // Calculate the total timeline width
  const timelineWidth = timeIntervals.reduce((total, _, index) => total + getColumnWidth(index), 0);
  const sidebarWidth = isChatOpen ? 8 : 10; // rem units

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
      
      {/* Column headers above the timeline */}
      <div className="flex-none relative border-b bg-gradient-to-r from-background via-background/80 to-background shadow-sm z-20">
        <div className="flex" style={{ marginLeft: `${sidebarWidth}rem` }}>
          <div 
            className="flex absolute top-0 left-0 h-14" 
            style={{ 
              transform: `translateX(-${scrollPosition}px)`,
              width: `${timelineWidth}px`
            }}
          >
            {timeIntervals.map((interval, index) => {
              const hasCommits = columnsWithCommits[index];
              return (
                <div 
                  key={index} 
                  className={cn(
                    "flex-none px-2 py-3 flex flex-col items-center justify-center transition-all duration-300",
                    "border-r last:border-r-0 relative group",
                    hasCommits ? "bg-transparent" : "bg-muted/30"
                  )}
                  style={{ 
                    width: `${getColumnWidth(index)}px`,
                  }}
                >
                  <div className="flex items-center mb-1">
                    <Calendar className={cn(
                      "h-4 w-4 mr-1",
                      hasCommits ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs font-medium truncate",
                      hasCommits ? "text-primary" : "text-muted-foreground"
                    )}>
                      {formatTimeInterval(interval, timeScale)}
                    </span>
                  </div>
                  {!hasCommits && (
                    <span className="text-[10px] text-muted-foreground opacity-70">No commits</span>
                  )}
                  {hasCommits && (
                    <div className="h-1 w-10 bg-primary/20 rounded-full">
                      <div className="h-1 w-6 bg-primary rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="flex-grow flex overflow-hidden" ref={timelineRef}>
        <div className="flex-none bg-background z-10 shadow-md">
          {Object.entries(groupedCommits).map(([groupName, groupCommits], groupIndex) => (
            groupCommits.length > 0 && (
              <div key={groupName} className="group/row border-b min-h-[80px] flex items-center">
                <div className={cn(
                  "bg-background/90 backdrop-blur-md p-3 font-medium flex items-center",
                  isChatOpen ? "w-32" : "w-40"
                )}>
                  {groupBy === 'type' && (
                    <div className={cn(
                      'h-6 w-6 mr-2 rounded-md flex items-center justify-center',
                      getCommitTypeColor(groupName as CommitType)
                    )}>
                      {getCommitTypeIconComponent(groupName as CommitType)}
                    </div>
                  )}
                  <span className="truncate">{groupName}</span>
                </div>
              </div>
            )
          ))}
        </div>
        
        <div className="flex-grow overflow-x-auto" onScroll={handleScroll}>
          <div style={{ width: `${timelineWidth}px`, minWidth: '100%' }}>
            {Object.entries(groupedCommits).map(([groupName, groupCommits], groupIndex) => (
              groupCommits.length > 0 && (
                <div key={groupName} className="group/row border-b min-h-[80px] relative">
                  <div className="absolute inset-0 flex pointer-events-none">
                    {timeIntervals.map((interval, index) => {
                      const hasCommits = columnsWithCommits[index];
                      return (
                        <div 
                          key={index}
                          className={cn(
                            "flex-none border-r last:border-r-0 transition-all duration-300",
                            hasCommits 
                              ? (index % 2 === 0 ? "bg-muted/5" : "") 
                              : "bg-muted/20"
                          )}
                          style={{ 
                            width: `${getColumnWidth(index)}px`,
                            left: `${getColumnOffset(index)}px`
                          }}
                        ></div>
                      );
                    })}
                  </div>
                  
                  {clusterCommits(groupCommits, groupName).map((cluster) => {
                    // Calculate position based on column offsets
                    const columnOffset = getColumnOffset(cluster.intervalIndex);
                    const columnWidth = getColumnWidth(cluster.intervalIndex);
                    const leftPosition = columnOffset + (columnWidth / 2);
                    
                    if (cluster.commits.length === 1) {
                      const commit = cluster.commits[0];
                      const analyses = commit.commit_analyses || commit.commit_analises || [];
                      const analysis = analyses[0];
                      const commitType = analysis?.type || 'CHORE';
                      const isCommitHighlighted = isHighlighted(commit.sha);
                      
                      return (
                        <TooltipProvider key={commit.sha} delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className={cn(
                                  'absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full',
                                  'flex items-center justify-center transition-all duration-300',
                                  'z-10 hover:z-30 hover:scale-125 hover:shadow-lg',
                                  getCommitTypeColor(commitType),
                                  (selectedCommit === commit.sha || hoveredCommit === commit.sha) && 
                                    'ring-2 ring-offset-2 ring-primary scale-125 z-30',
                                  isCommitHighlighted && 
                                    'ring-2 ring-offset-2 ring-yellow-400 scale-125 z-30 highlighted-commit animate-pulse'
                                )}
                                style={{ left: `${leftPosition}px` }}
                                onClick={() => onCommitSelect(commit.sha)}
                                onMouseEnter={() => setHoveredCommit(commit.sha)}
                                onMouseLeave={() => setHoveredCommit(null)}
                              >
                                {getCommitTypeIconComponent(commitType)}
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
                        <TooltipProvider key={`cluster-${cluster.intervalIndex}`} delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className={cn(
                                  'absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 h-9 w-9 rounded-full',
                                  'flex items-center justify-center transition-all duration-300',
                                  'z-10 hover:z-30 hover:scale-125 hover:shadow-lg border-2',
                                  getCommitTypeColor(dominantType),
                                  hasHighlightedCommits && 
                                    'ring-2 ring-offset-2 ring-yellow-400 highlighted-commit animate-pulse'
                                )}
                                style={{ left: `${leftPosition}px` }}
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
                        {getCommitTypeIconComponent(commitType)}
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
