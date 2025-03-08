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
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Commit, TimelineFilters, TimeScale, GroupBy } from '@/types';
import { filterCommits } from '@/utils/filter-utils';
import { fetchCommitsForRepo } from '@/lib/supabase';
import { useChat } from '@/contexts/chat-context';
import { ChatProvider } from '@/contexts/chat-context';

const mockCommits: Commit[] = [
  {
    sha: '1',
    created_at: '2023-05-10T10:00:00Z',
    repo_name: 'owner/repo',
    author: 'developer1',
    author_url: 'https://github.com/developer1',
    author_email: 'dev1@example.com',
    date: '2023-05-10T10:00:00Z',
    message: 'Initial commit',
    url: 'https://github.com/owner/repo/commit/1',
    description: 'Set up project structure and dependencies',
    commit_analises: [
      {
        id: 'a1',
        created_at: '2023-05-10T11:00:00Z',
        repo_name: 'owner/repo',
        title: 'Project Initialization',
        idea: 'Setting up the foundational structure for the project',
        description: 'This commit establishes the basic project structure, adding essential configuration files and dependencies needed to start development.',
        commit_sha: '1',
        type: 'MILESTONE',
        epic: 'Project Setup'
      }
    ]
  },
  {
    sha: '2',
    created_at: '2023-05-12T10:00:00Z',
    repo_name: 'owner/repo',
    author: 'developer2',
    author_url: 'https://github.com/developer2',
    author_email: 'dev2@example.com',
    date: '2023-05-12T10:00:00Z',
    message: 'Add authentication module',
    url: 'https://github.com/owner/repo/commit/2',
    description: 'Implement user authentication with JWT',
    commit_analises: [
      {
        id: 'a2',
        created_at: '2023-05-12T11:00:00Z',
        repo_name: 'owner/repo',
        title: 'User Authentication System',
        idea: 'Implementing secure user authentication',
        description: 'This commit adds a complete authentication system using JWT tokens for secure user sessions. It includes login, registration, and password recovery functionality.',
        commit_sha: '2',
        type: 'FEATURE',
        epic: 'Authentication'
      }
    ]
  },
  {
    sha: '3',
    created_at: '2023-05-15T10:00:00Z',
    repo_name: 'owner/repo',
    author: 'developer1',
    author_url: 'https://github.com/developer1',
    author_email: 'dev1@example.com',
    date: '2023-05-15T10:00:00Z',
    message: 'Fix login error handling',
    url: 'https://github.com/owner/repo/commit/3',
    description: 'Improve error messages on login failure',
    commit_analises: [
      {
        id: 'a3',
        created_at: '2023-05-15T11:00:00Z',
        repo_name: 'owner/repo',
        title: 'Login Error Handling Improvement',
        idea: 'Enhancing user experience by providing clearer error messages',
        description: 'This commit improves the error handling during login attempts. It provides more specific error messages to help users understand why their login failed (invalid credentials, account locked, etc).',
        commit_sha: '3',
        type: 'BUG',
        epic: 'Authentication'
      }
    ]
  },
  {
    sha: '4',
    created_at: '2023-05-20T10:00:00Z',
    repo_name: 'owner/repo',
    author: 'developer3',
    author_url: 'https://github.com/developer3',
    author_email: 'dev3@example.com',
    date: '2023-05-20T10:00:00Z',
    message: 'Add user profile page',
    url: 'https://github.com/owner/repo/commit/4',
    description: 'Create user profile page with edit functionality',
    commit_analises: [
      {
        id: 'a4',
        created_at: '2023-05-20T11:00:00Z',
        repo_name: 'owner/repo',
        title: 'User Profile Page Implementation',
        idea: 'Creating a comprehensive user profile management interface',
        description: 'This commit adds a complete user profile page where users can view and edit their personal information, including profile picture, contact details, and preferences.',
        commit_sha: '4',
        type: 'FEATURE',
        epic: 'User Management'
      }
    ]
  },
  {
    sha: '5',
    created_at: '2023-05-25T10:00:00Z',
    repo_name: 'owner/repo',
    author: 'developer2',
    author_url: 'https://github.com/developer2',
    author_email: 'dev2@example.com',
    date: '2023-05-25T10:00:00Z',
    message: 'Update dependencies',
    url: 'https://github.com/owner/repo/commit/5',
    description: 'Update all npm packages to latest versions',
    commit_analises: [
      {
        id: 'a5',
        created_at: '2023-05-25T11:00:00Z',
        repo_name: 'owner/repo',
        title: 'Dependency Update',
        idea: 'Maintaining project health by updating dependencies',
        description: 'This commit updates all npm packages to their latest versions to ensure the project has the latest features, performance improvements, and security patches.',
        commit_sha: '5',
        type: 'CHORE',
        epic: 'Project Maintenance'
      }
    ]
  },
  {
    sha: '6',
    created_at: '2023-06-01T10:00:00Z',
    repo_name: 'owner/repo',
    author: 'developer1',
    author_url: 'https://github.com/developer1',
    author_email: 'dev1@example.com',
    date: '2023-06-01T10:00:00Z',
    message: 'Implement password strength checker',
    url: 'https://github.com/owner/repo/commit/6',
    description: 'Add functionality to check password strength during registration',
    commit_analises: [
      {
        id: 'a6',
        created_at: '2023-06-01T11:00:00Z',
        repo_name: 'owner/repo',
        title: 'Password Strength Validation',
        idea: 'Enhancing security by enforcing strong passwords',
        description: 'This commit adds a password strength checker during user registration to enforce strong password policies. It provides visual feedback to users about their password strength and specific suggestions for improvement.',
        commit_sha: '6',
        type: 'FEATURE',
        epic: 'Authentication'
      }
    ]
  },
  {
    sha: '7',
    created_at: '2023-06-05T10:00:00Z',
    repo_name: 'owner/repo',
    author: 'developer3',
    author_url: 'https://github.com/developer3',
    author_email: 'dev3@example.com',
    date: '2023-06-05T10:00:00Z',
    message: 'Fix potential XSS vulnerability',
    url: 'https://github.com/owner/repo/commit/7',
    description: 'Address XSS vulnerability in user input handling',
    commit_analises: [
      {
        id: 'a7',
        created_at: '2023-06-05T11:00:00Z',
        repo_name: 'owner/repo',
        title: 'XSS Vulnerability Fix',
        idea: 'Addressing a critical security vulnerability',
        description: 'This commit fixes a potential Cross-Site Scripting (XSS) vulnerability in the application by properly sanitizing user input and implementing appropriate content security policies.',
        commit_sha: '7',
        type: 'WARNING',
        epic: 'Security'
      }
    ]
  },
  {
    sha: '8',
    created_at: '2023-06-10T10:00:00Z',
    repo_name: 'owner/repo',
    author: 'developer2',
    author_url: 'https://github.com/developer2',
    author_email: 'dev2@example.com',
    date: '2023-06-10T10:00:00Z',
    message: 'Improve application performance',
    url: 'https://github.com/owner/repo/commit/8',
    description: 'Optimize database queries and implement caching',
    commit_analises: [
      {
        id: 'a8',
        created_at: '2023-06-10T11:00:00Z',
        repo_name: 'owner/repo',
        title: 'Performance Optimization',
        idea: 'Enhancing application speed and responsiveness',
        description: 'This commit significantly improves application performance by optimizing database queries, implementing a robust caching strategy, and reducing unnecessary computations in critical paths.',
        commit_sha: '8',
        type: 'FEATURE',
        epic: 'Performance'
      }
    ]
  },
  {
    sha: '9',
    created_at: '2023-06-15T10:00:00Z',
    repo_name: 'owner/repo',
    author: 'developer1',
    author_url: 'https://github.com/developer1',
    author_email: 'dev1@example.com',
    date: '2023-06-15T10:00:00Z',
    message: 'Release v1.0.0',
    url: 'https://github.com/owner/repo/commit/9',
    description: 'Prepare for initial production release',
    commit_analises: [
      {
        id: 'a9',
        created_at: '2023-06-15T11:00:00Z',
        repo_name: 'owner/repo',
        title: 'Version 1.0.0 Release',
        idea: 'First stable production release of the application',
        description: 'This commit marks the first production-ready release (v1.0.0) of the application. It includes final version bumps, documentation updates, and release notes for users.',
        commit_sha: '9',
        type: 'MILESTONE',
        epic: 'Releases'
      }
    ]
  }
];

const TimelineContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [filteredCommits, setFilteredCommits] = useState<Commit[]>([]);
  const [filters, setFilters] = useState<TimelineFilters>({
    types: [],
    authors: [],
    epics: [], // Initialize empty epics array
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
  const { filteredCommitShas } = useChat();
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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
  }, [repoParam, exampleParam]);
  
  useEffect(() => {
    let filtered = filterCommits(commits, filters);
    
    if (filteredCommitShas && filteredCommitShas.length > 0) {
      filtered = filtered.filter(commit => filteredCommitShas.includes(commit.sha));
    }
    
    setFilteredCommits(filtered);
  }, [commits, filters, filteredCommitShas]);
  
  const handleRepositorySubmit = async (url: string, repoName: string, repoExists = false) => {
    setIsLoading(true);
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

  const showChatButton = commits.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container py-8">
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
              <div className="flex flex-col md:flex-row gap-6 relative">
                <div className="flex-1">
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
                    className="mb-10 animate-scale-in"
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
                </div>
                
                <div className="w-96 hidden md:block shrink-0" />
              </div>
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
      
      {showChatButton && (
        <FloatingChatButton repoName={repoParam || undefined} />
      )}
      
      <Footer />
    </div>
  );
};

const TimelinePage: React.FC = () => {
  return (
    <ChatProvider>
      <TimelineContent />
    </ChatProvider>
  );
};

export default TimelinePage;
