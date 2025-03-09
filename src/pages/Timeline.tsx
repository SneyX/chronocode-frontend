import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Timeline from '@/components/ui/timeline';
import FilterBar from '@/components/ui/filter-bar';
import CommitCard from '@/components/ui/commit-card';
import RepositoryInput from '@/components/ui/repository-input';
import FloatingChatButton from '@/components/ui/floating-chat-button';
import SidebarChat from '@/components/ui/sidebar-chat';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Commit, TimelineFilters, TimeScale, GroupBy } from '@/types';
import { filterCommits } from '@/utils/filter-utils';
import { fetchCommitsForRepo, checkRepoExists } from '@/lib/supabase';
import { useChat } from '@/contexts/chat-context';
import { cn } from '@/lib/utils';

const mockCommits: Commit[] = [
  // ... keep existing mockCommits array
];

const TimelinePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [filteredCommits, setFilteredCommits] = useState<Commit[]>([]);
  const [filters, setFilters] = useState<TimelineFilters>({
    types: [],
    authors: [],
    epics: [],
    dateRange: { from: null, to: null },
    searchTerm: ''
  });
  const [timeScale, setTimeScale] = useState<TimeScale>('week');
  const [groupBy, setGroupBy] = useState<GroupBy>('type');
  const [selectedCommit, setSelectedCommit] = useState<string | undefined>();
  const [expandedCommit, setExpandedCommit] = useState<string | undefined>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const repoParam = searchParams.get('repo');
  const exampleParam = searchParams.get('example');
  const { isChatOpen, resetChat } = useChat();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      resetChat();
      
      try {
        if (repoParam) {
          console.log('Fetching data for repo:', repoParam, 'example:', exampleParam);
          
          try {
            if (repoParam) {
              const repoData = await fetchCommitsForRepo(repoParam);
              
              if (repoData && repoData.length > 0) {
                console.log('Found real data in Supabase for repo:', repoParam);
                setCommits(repoData);
                toast.success(`Loaded ${repoData.length} commits for ${repoParam}`);
              } else if (exampleParam === 'true') {
                console.log('Using example data as requested for repo:', repoParam);
                await new Promise(resolve => setTimeout(resolve, 1500));
                setCommits(mockCommits);
                toast.info('Showing example data for this repository', {
                  description: 'The actual analysis will be available soon.',
                });
              } else {
                console.log('No data found in Supabase for repo:', repoParam);
                setCommits([]);
                toast.warning('No commit data found for this repository', {
                  description: 'Please try analyzing the repository again.',
                });
              }
            }
          } catch (error) {
            console.error('Error fetching commits from Supabase:', error);
            if (exampleParam === 'true') {
              setCommits(mockCommits);
              toast.info('Showing example data for this repository', {
                description: 'The actual analysis will be available soon.',
              });
            } else {
              setCommits([]);
              toast.error('Error loading repository data', {
                description: 'Please try again later.',
              });
            }
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 1500));
          setCommits(mockCommits);
          toast.info('Showing example timeline data', {
            description: 'Enter a GitHub repository URL to analyze real data.',
          });
        }
      } catch (error) {
        console.error('Error fetching commits:', error);
        toast.error('Failed to load commits', {
          description: 'Please try again later.',
        });
        setCommits([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [repoParam, exampleParam, resetChat]);
  
  useEffect(() => {
    setFilteredCommits(filterCommits(commits, filters));
  }, [commits, filters]);
  
  const handleRepositorySubmit = async (url: string, repoName: string, repoExists = false) => {
    setIsLoading(true);
    
    resetChat();
    
    try {
      console.log('Handling repository submit:', repoName, 'exists:', repoExists);
      
      if (repoExists) {
        console.log('Repository already exists in Supabase, navigating...');
        navigate(`/timeline?repo=${encodeURIComponent(repoName)}`);
        
        toast.success('Repository data found!', {
          description: 'Loading timeline from existing data.',
        });
      } else {
        console.log('Repository not found in Supabase, showing example data...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        navigate(`/timeline?repo=${encodeURIComponent(repoName)}&example=true`);
        
        toast.info('Starting repository analysis...', {
          description: 'This may take several minutes to complete.',
        });
      }
    } catch (error) {
      console.error('Error analyzing repository:', error);
      toast.error('Failed to analyze repository', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCommitSelect = (commitSha: string) => {
    setSelectedCommit(commitSha);
    setExpandedCommit(commitSha);
    
    setTimeout(() => {
      const commitCard = document.getElementById(`commit-${commitSha}`);
      if (commitCard) {
        commitCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };
  
  const handleRefreshAnalysis = async () => {
    if (!repoParam) return;
    
    setIsLoading(true);
    try {
      console.log('Refreshing analysis for repo:', repoParam);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Analysis refreshed successfully!', {
        description: 'New commits have been analyzed.',
      });
      
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing analysis:', error);
      toast.error('Failed to refresh analysis', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectedCommitData = selectedCommit 
    ? commits.find(commit => commit.sha === selectedCommit)
    : undefined;

  const showChatComponents = commits.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className={cn("flex-grow container py-8", isChatOpen && "pr-[420px] transition-all duration-300")}>
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold animate-fade-in">
            {repoParam ? `Timeline: ${repoParam}` : 'Repository Timeline'}
          </h1>
          
          {repoParam && !isLoading && (
            <Button 
              onClick={handleRefreshAnalysis}
              variant="outline"
              className="animate-fade-in"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Analysis
            </Button>
          )}
        </div>
        
        <div className="mb-8 animate-slide-down">
          <RepositoryInput 
            onSubmit={handleRepositorySubmit} 
            isLoading={isLoading}
          />
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Analyzing repository commits...</p>
          </div>
        ) : (
          <>
            {filteredCommits.length > 0 ? (
              <>
                <FilterBar 
                  commits={commits}
                  filters={filters}
                  onFilterChange={setFilters}
                  timeScale={timeScale}
                  onTimeScaleChange={setTimeScale}
                  groupBy={groupBy}
                  onGroupByChange={setGroupBy}
                />
                
                <Timeline 
                  commits={filteredCommits}
                  timeScale={timeScale}
                  groupBy={groupBy}
                  selectedCommit={selectedCommit}
                  onCommitSelect={handleCommitSelect}
                  className={cn("mb-10 animate-scale-in", isChatOpen && "chat-open")}
                />
                
                {selectedCommitData && (
                  <div className="mt-8 animation-delay-200 animate-fade-in">
                    <h2 className="text-xl font-semibold mb-4">Selected Commit</h2>
                    <CommitCard 
                      id={`commit-${selectedCommitData.sha}`}
                      commit={selectedCommitData}
                      isExpanded={expandedCommit === selectedCommitData.sha}
                      onToggleExpand={() => {
                        if (expandedCommit === selectedCommitData.sha) {
                          setExpandedCommit(undefined);
                        } else {
                          setExpandedCommit(selectedCommitData.sha);
                        }
                      }}
                    />
                  </div>
                )}
                
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Recent Commits</h2>
                  <div className="grid grid-cols-1 gap-4 animation-delay-300 animate-fade-in">
                    {filteredCommits.slice(0, 5).map((commit) => (
                      <CommitCard 
                        key={commit.sha}
                        id={`commit-${commit.sha}`}
                        commit={commit}
                        isExpanded={expandedCommit === commit.sha}
                        onToggleExpand={() => {
                          if (expandedCommit === commit.sha) {
                            setExpandedCommit(undefined);
                          } else {
                            setExpandedCommit(commit.sha);
                          }
                        }}
                        className={selectedCommit === commit.sha ? 'ring-2 ring-primary' : ''}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No commits match your current filters.</p>
                <Button variant="outline" onClick={() => setFilters({
                  types: [],
                  authors: [],
                  epics: [],
                  dateRange: { from: null, to: null },
                  searchTerm: ''
                })}>
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      
      {showChatComponents && (
        <>
          <FloatingChatButton repoName={repoParam || undefined} />
          <SidebarChat repoName={repoParam || undefined} commits={commits} />
        </>
      )}
      
      <Footer />
    </div>
  );
};

export default TimelinePage;
